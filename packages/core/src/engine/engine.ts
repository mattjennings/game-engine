import { EventEmitter } from 'events'
import { Renderer } from '../renderer'
import { Scene } from '../scene'
import { Router, SceneRoute } from './router'

interface EngineOptions<Scenes extends Record<string, SceneRoute>> {
  maxFPS?: number
  renderer?: Renderer<any>

  initialScene?: keyof Scenes
  scenes?: Scenes
}

export class Engine<
  Scenes extends Record<string, SceneRoute>,
  R extends Renderer<any> = Renderer<any>
> extends EventEmitter {
  isRunning: boolean
  maxFPS: number | null
  renderer?: R
  router: Router<Scenes>

  #initialScene: keyof Scenes = 'main'

  constructor(options: EngineOptions<Scenes> = {}) {
    super()
    this.isRunning = false
    this.maxFPS = options.maxFPS ?? null
    this.renderer = options.renderer as R | undefined
    this.router = new Router({
      engine: this,
      scenes: options.scenes as Scenes,
    })

    if (options.initialScene) {
      this.#initialScene = options.initialScene
    }
  }

  public async start() {
    if (!this.isRunning) {
      this.isRunning = true
      this._updateLoop(performance.now(), performance.now())
      await this.router.start(this.#initialScene)
    }

    return this
  }

  public stop() {
    this.isRunning = false
    this.router.stop()

    return this
  }

  private _updateLoop(ts: number, lastTime: number): any {
    if (!this.isRunning) return

    const delta = ts - lastTime

    if (this.maxFPS === null || delta >= 1000 / this.maxFPS) {
      this.emit('preupdate', { delta })
      this.emit('update', { delta })
      this.emit('postupdate', { delta })

      for (const scene of this.router.currentScenes) {
        this.render(scene, { delta })
      }

      return requestAnimationFrame((nextTs) => this._updateLoop(nextTs, ts))
    }

    requestAnimationFrame((nextTs) => this._updateLoop(nextTs, lastTime))
  }

  public render(scene: Scene, { delta }: { delta: number }) {
    this.renderer?.render?.({ scene, delta })
    this.emit('render', { scene, delta })
  }
}
