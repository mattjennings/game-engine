import { EventEmitter } from 'events'
import { Scene } from '../scene'
import { Resource, ResourceLoader } from '../resource'

import { Transition } from './transition'
import { Engine } from '../engine'

type AsyncScene<Data = any> = () => Promise<
  { default: typeof Scene<Data> } | typeof Scene<Data>
>

export type SceneRoute<Data = any> = typeof Scene<Data> | AsyncScene<Data>

type SceneData<Scene> = Scene extends SceneRoute<infer Data> ? Data : never

export interface RouterArgs<Scenes extends Record<string, SceneRoute<any>>> {
  scenes: Scenes
  engine: Engine
}

export interface NavigateOptions<Data = any> {
  data?: Data
  replace?: boolean
  transition?: Transition
  deactivateOnTransitionStart?: boolean
}

export class Router<
  Scenes extends Record<string, SceneRoute>
> extends EventEmitter {
  currentScenes: Scene[] = []
  engine: Engine
  currentTransition: Transition | null = null

  private resources?: ResourceLoader
  private scenes: ResourceLoader<Record<string, SceneResource>>

  constructor(engine: Engine, scenes: Scenes, resources?: ResourceLoader<any>) {
    super()
    this.engine = engine
    this.resources = resources
    this.scenes = new ResourceLoader({
      resources: Object.entries(scenes).reduce((prev, [key, scene]) => {
        return { ...prev, [key]: new SceneResource(scene as AsyncScene) }
      }, {}),
    })
  }

  // initializeScenes(scenes: Record<string, SceneRoute>) {
  //   for (const [key, scene] of Object.entries(scenes)) {
  //     this.scenes.set(
  //       key,
  //       new SceneResource(wrapSceneRoute(scene as SceneRoute))
  //     )
  //   }
  // }

  get currentScene() {
    return this.currentScenes[0]
  }

  addScene(route: string, sceneRoute: SceneRoute) {
    this.scenes.add(
      route as string,
      new SceneResource(wrapSceneRoute(sceneRoute))
    )
  }

  async start(route: keyof Scenes) {
    await this.scenes.get(route as string)?.load()
    await this.navigate(route)
  }

  stop() {
    for (const scene of this.currentScenes) {
      scene.deactivate()
    }
    this.currentScenes = []
  }

  // async loadScene(route: keyof Scenes) {
  //   const resource = this.scenes.get(sceneKey)
  //   if (!resource) throw new Error(`Scene "${sceneKey as string}" not found`)
  //   if (!resource.isLoaded) await resource.load()
  // }

  // async loadResources() {
  //   if (!this.loader) return
  //   await this.loader.load()
  // }

  async navigate<K extends keyof Scenes>(
    route: K,
    options: NavigateOptions<SceneData<Scenes[K]>> = {}
  ) {
    const {
      replace = true,
      transition,
      deactivateOnTransitionStart = true,
    } = options

    // If there is an ongoing transition, stop it
    if (this.currentTransition) {
      throw new Error(
        'Cannot navigate while a transition is in progress, use router.waitForTransition() first'
      )
    }

    this.emit('navigatestart', { route, options })
    const sceneResource = this.scenes.get(route as string)
    if (!sceneResource)
      throw new Error(`Scene for troute "${route as string}" not found`)

    if (this.currentScene) {
      if (replace) {
        if (deactivateOnTransitionStart) {
          this.currentScene?.deactivate()
        }

        if (transition) {
          this.currentTransition = transition
          this.currentScene.addChild(transition)
          await this.playTransition(transition, true)
        }

        for (const scene of this.currentScenes) {
          scene.destroy()
        }

        if (transition) {
          this.currentScene.removeChild(transition)
        }

        this.currentScenes = []
      }
    }

    // await sceneResource.load()
    if (this.resources) {
      this.emit('load')
      this.emit('loadprogress', 0)

      // load scene first
      this.resources.add(`__router__scene-${route as string}`, sceneResource)
      await this.resources.load()

      // then load resources that may have been added via scene import
      const onProgress = (progress: number) => {
        this.emit('loadprogress', progress)
      }

      this.resources.on('progress', onProgress)
      await this.resources.load()

      this.resources.off('progress', onProgress)
      this.emit('loadcomplete')
    } else {
      await sceneResource.load()
    }

    const SceneClass = sceneResource.Scene!
    const newScene = new SceneClass(this.engine, { name: route as string })

    newScene.activate({ data: options.data })
    this.currentScenes.push(newScene)

    if (transition) {
      newScene.addChild(transition)
      await this.playTransition(transition, false)
      newScene.destroyChild(transition)
    }
    this.currentTransition = null
    this.emit('navigatecomplete', { route, options })
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

  constructor(route: SceneRoute) {
    super()

    if (isScene(route)) {
      this.Scene = route
      this.isLoaded = true
      this.#promise = async () => route
    } else {
      this.#promise = route
    }
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
