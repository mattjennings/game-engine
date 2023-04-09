import { Engine, EngineOptions } from './engine'
import { Renderer } from './renderer'
import { Resource, ResourceLoader } from './resource'
import { Router, SceneRoute } from './router'

export interface GameOptions<
  Scenes extends Record<string, SceneRoute<any>>,
  Resources extends Record<string, Resource>,
  R extends Renderer
> extends EngineOptions {
  renderer?: R
  initialScene: string
  scenes: Scenes
  autoStart?: boolean
  resources?: Resources
}

export class Game<
  Scenes extends Record<string, SceneRoute<any>>,
  Resources extends Record<string, Resource>,
  R extends Renderer
> {
  engine: Engine
  router: Router<Scenes>
  renderer?: R
  resources: ResourceLoader<Resources>

  constructor(options: GameOptions<Scenes, Resources, R>) {
    const { autoStart = true } = options
    this.engine = new Engine(options)
    this.renderer = options.renderer

    this.resources = new ResourceLoader({
      resources: options.resources ?? ({} as Resources),
    })

    this.router = new Router(this.engine, options.scenes, this.resources)

    if (this.renderer) {
      this.engine.on('render', ({ delta }) => {
        for (const scene of this.router.currentScenes) {
          this.renderer?.render?.({ scene, delta })
        }
      })
    }

    if (autoStart) {
      this.start(options.initialScene)
    }
  }

  stop() {
    this.engine.stop()
    this.router.stop()
  }

  async start(scene: keyof Scenes) {
    await this.resources?.load()
    await this.engine.start()
    await this.router.start(scene)
  }
}
