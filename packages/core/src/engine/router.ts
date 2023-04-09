import { EventEmitter } from 'events'
import { Scene } from '../scene'
import { Resource, ResourceLoader } from '../resource'
import { Engine } from './engine'

type AsyncScene = () => Promise<{ default: typeof Scene } | typeof Scene>

export type SceneRoute = typeof Scene | AsyncScene

export interface RouterArgs<Scenes extends Record<string, SceneRoute>> {
  scenes: Scenes
  engine: Engine<any, any>
}

export class Router<
  Scenes extends Record<string, SceneRoute>
> extends EventEmitter {
  currentScene: Scene | null = null
  engine: Engine<any, any>

  scenes: Map<keyof Scenes, SceneResource> = new Map()

  constructor(args: RouterArgs<Scenes>) {
    super()

    this.engine = args.engine

    for (const [key, scene] of Object.entries(args.scenes)) {
      this.scenes.set(
        key,
        new SceneResource(this._wrapSceneRoute(scene as SceneRoute))
      )
    }
  }

  async start(sceneKey: keyof Scenes) {
    await this.navigate(sceneKey)
  }

  stop() {
    if (this.currentScene) {
      this.currentScene._deactivate()
    }
  }

  async loadScene(sceneKey: keyof Scenes) {
    const resource = this.scenes.get(sceneKey)

    if (!resource) {
      throw new Error(`Scene "${sceneKey as string}" not found`)
    }

    if (!resource.isLoaded) {
      await resource.load()
    }
  }

  async navigate(sceneKey: keyof Scenes) {
    const sceneResource = this.scenes.get(sceneKey)

    if (!sceneResource) {
      throw new Error(`Scene "${sceneKey as string}" not found`)
    }

    if (!sceneResource.isLoaded) {
      await this.loadScene(sceneKey)
    }

    const SceneClass = sceneResource.Scene!

    if (this.currentScene) {
      this.currentScene._deactivate()
    }

    this.currentScene = new SceneClass(this.engine, {
      name: sceneKey as string,
    })
    this.currentScene._activate({ data: undefined })
  }

  private _wrapSceneRoute(sceneRoute: SceneRoute): AsyncScene {
    if (typeof sceneRoute === 'function' && !isScene(sceneRoute)) {
      return sceneRoute as AsyncScene
    }

    return async () => sceneRoute
  }
}

class SceneResource extends Resource {
  isLoaded: boolean = false

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
