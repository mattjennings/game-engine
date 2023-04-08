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
      this._updateLoop(performance.now(), performance.now())
    }

    return this
  }

  public stop() {
    this._running = false

    return this
  }

  public addGameObject(gameObject: GameObject): void {
    this._gameObjects.add(gameObject)
    gameObject.onAdd?.()
    gameObject.emit('add')
  }

  public removeGameObject(gameObject: GameObject): void {
    this._gameObjects.delete(gameObject)
    gameObject.onRemove?.()
    gameObject.emit('remove')
  }

  private _updateLoop(ts: number, lastTime: number): void {
    if (!this._running) {
      return
    }

    const delta = ts - lastTime

    if (this._maxFPS && delta < 1000 / this._maxFPS) {
      requestAnimationFrame((nextTs) => this._updateLoop(nextTs, lastTime))
      return
    } else {
      // Execute pre-update methods
      for (const gameObject of this._gameObjects) {
        gameObject.preUpdate?.({ delta })
        gameObject.emit('preupdate', { delta })
      }

      // Execute update methods
      for (const gameObject of this._gameObjects) {
        gameObject.update?.({ delta })
        gameObject.emit('update', { delta })
      }

      // Execute post-update methods
      for (const gameObject of this._gameObjects) {
        gameObject.postUpdate?.({ delta })
        gameObject.emit('postupdate', { delta })
      }

      // Execute rendering
      if (this._renderer) {
        this._renderer.renderStart?.()
        this._renderer.render?.(this._gameObjects)
        this._renderer.renderEnd?.()
      }
    }

    requestAnimationFrame((nextTs) => this._updateLoop(nextTs, ts))
  }
}
