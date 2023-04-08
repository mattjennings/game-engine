import { GameObject } from './game-object'
import { Renderer } from './renderer'

interface EngineOptions {
  maxFPS?: number
  renderer?: Renderer<any>
}

export class Engine {
  private _running: boolean
  private _gameObjects: Set<GameObject>
  private _maxFPS: number | null
  private _renderer?: Renderer<any>

  constructor(options: EngineOptions = {}) {
    this._running = false
    this._gameObjects = new Set<GameObject>()
    this._maxFPS = options.maxFPS ?? null
    this._renderer = options.renderer
  }

  public start() {
    if (!this._running) {
      this._running = true
      this._updateLoop(performance.now())
    }

    return this
  }

  public stop() {
    this._running = false

    return this
  }

  public addGameObject(gameObject: GameObject): void {
    this._gameObjects.add(gameObject)
  }

  public removeGameObject(gameObject: GameObject): void {
    this._gameObjects.delete(gameObject)
  }

  private _updateLoop(lastTime: number): void {
    if (!this._running) {
      return
    }

    const currentTime = performance.now()
    const delta = currentTime - lastTime

    if (this._maxFPS === null || delta >= 1000 / this._maxFPS) {
      // Execute pre-update methods
      for (const gameObject of this._gameObjects) {
        gameObject.preUpdate?.({ delta })
      }

      // Execute update methods
      for (const gameObject of this._gameObjects) {
        gameObject.update?.({ delta })
      }

      // Execute post-update methods
      for (const gameObject of this._gameObjects) {
        gameObject.postUpdate?.({ delta })
      }

      // Execute rendering
      if (this._renderer) {
        this._renderer.renderStart?.()
        this._renderer.render?.(this._gameObjects)
        this._renderer.renderEnd?.()
      }

      lastTime = currentTime
    }

    requestAnimationFrame(() => this._updateLoop(lastTime))
  }
}
