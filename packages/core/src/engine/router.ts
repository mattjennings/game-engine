import { EventEmitter } from 'events'
import { Scene } from '../scene'
import { Resource } from '../resource'
import { Engine } from './engine'
import { Transition } from './transition'

type AsyncScene<Data = any> = () => Promise<
  { default: typeof Scene<Data> } | typeof Scene<Data>
>

export type SceneRoute<Data = any> = typeof Scene<Data> | AsyncScene<Data>

type SceneData<Scene> = Scene extends SceneRoute<infer Data> ? Data : never

export interface RouterArgs<Scenes extends Record<string, SceneRoute<any>>> {
  scenes: Scenes
  engine: Engine<any, any>
}

export interface NavigateOptions<Data = any> {
  data?: Data
  replace?: boolean
  transition?: Transition
}

export class Router<
  Scenes extends Record<string, SceneRoute>
> extends EventEmitter {
  currentScenes: Scene[] = []
  engine: Engine<any, any>
  scenes: Map<keyof Scenes, SceneResource> = new Map()
  currentTransition: Transition | null = null

  constructor(args: RouterArgs<Scenes>) {
    super()
    this.engine = args.engine
    this.initializeScenes(args.scenes)
  }

  initializeScenes(scenes: Record<string, SceneRoute>) {
    for (const [key, scene] of Object.entries(scenes)) {
      this.scenes.set(
        key,
        new SceneResource(wrapSceneRoute(scene as SceneRoute))
      )
    }
  }

  get currentScene() {
    return this.currentScenes[0]
  }

  addScene(sceneKey: keyof Scenes, sceneRoute: SceneRoute) {
    this.scenes.set(sceneKey, new SceneResource(wrapSceneRoute(sceneRoute)))
  }

  async start(sceneKey: keyof Scenes) {
    await this.navigate(sceneKey)
  }

  stop() {
    for (const scene of this.currentScenes) {
      scene.deactivate()
    }
    this.currentScenes = []
  }

  async loadScene(sceneKey: keyof Scenes) {
    const resource = this.scenes.get(sceneKey)
    if (!resource) throw new Error(`Scene "${sceneKey as string}" not found`)
    if (!resource.isLoaded) await resource.load()
  }

  async navigate<K extends keyof Scenes>(
    sceneKey: K,
    options: NavigateOptions<SceneData<Scenes[K]>> = {}
  ) {
    const { replace = true, transition } = options

    // If there is an ongoing transition, stop it
    if (this.currentTransition) {
      throw new Error(
        'Cannot navigate while a transition is in progress, use router.waitForTransition() first'
      )
    }

    const sceneResource = this.scenes.get(sceneKey)
    if (!sceneResource)
      throw new Error(`Scene "${sceneKey as string}" not found`)
    if (!sceneResource.isLoaded) await this.loadScene(sceneKey)

    const SceneClass = sceneResource.Scene!

    if (replace) {
      if (transition) {
        this.currentTransition = transition
        this.currentScene.addChild(transition)
        await this.playTransition(transition, true)
      }

      for (const scene of this.currentScenes) {
        scene.deactivate()
      }

      if (transition) {
        this.currentScene.removeChild(transition)
      }

      this.currentScenes = []
    }

    const newScene = new SceneClass(this.engine, { name: sceneKey as string })
    newScene.activate({ data: options.data })
    this.currentScenes.push(newScene)

    if (transition) {
      newScene.addChild(transition)
      await this.playTransition(transition, false)
      newScene.destroyChild(transition)
    }
    this.currentTransition = null
  }

  async playTransition(transition: Transition, isOutro: boolean) {
    this.currentTransition = transition
    await transition.execute(isOutro)
  }

  async waitForTransition() {
    if (this.currentTransition) {
      await new Promise((resolve) => {
        const check = () => {
          if (!this.currentTransition) {
            this.engine.off('update', check)
            resolve(undefined)
          }
        }
        this.engine.on('update', check)
      })
    }
  }
}

class SceneResource extends Resource {
  isLoaded = false
  #promise: () => Promise<{ default: typeof Scene } | typeof Scene>
  Scene: typeof Scene | null = null

  constructor(
    promise: () => Promise<{ default: typeof Scene } | typeof Scene>
  ) {
    super()
    this.#promise = promise
  }

  async load() {
    const result = await this.#promise()
    this.Scene = 'default' in result ? result.default : result
    this.isLoaded = true
  }
}

function isScene(route: typeof Scene | AsyncScene): route is typeof Scene {
  return isClass(route)
}

function isClass(obj: any) {
  if (typeof obj !== 'function') return false
  const descriptor = Object.getOwnPropertyDescriptor(obj, 'prototype')
  if (!descriptor) return false
  return !descriptor.writable
}

function wrapSceneRoute(sceneRoute: SceneRoute): AsyncScene {
  if (typeof sceneRoute === 'function' && !isScene(sceneRoute)) {
    return sceneRoute as AsyncScene
  }
  return async () => sceneRoute
}
