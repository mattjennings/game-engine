import { EventEmitter } from 'events'
import { Scene } from '../scene'

export interface EngineOptions {
  maxFPS?: number
}

export class Engine extends EventEmitter {
  isRunning: boolean
  maxFPS: number | null

  constructor(options: EngineOptions = {}) {
    super()
    this.isRunning = false
    this.maxFPS = options.maxFPS ?? null
  }

  public async start() {
    if (!this.isRunning) {
      this.isRunning = true
      this._updateLoop(performance.now(), performance.now())
      this.emit('start')
    }

    return this
  }

  public stop() {
    this.isRunning = false
    this.emit('stop')

    return this
  }

  private _updateLoop(ts: number, lastTime: number): any {
    if (!this.isRunning) return

    const delta = ts - lastTime

    if (this.maxFPS === null || delta >= 1000 / this.maxFPS) {
      this.emit('preupdate', { delta })
      this.emit('update', { delta })
      this.emit('postupdate', { delta })
      this.emit('render', { delta })

      return requestAnimationFrame((nextTs) => this._updateLoop(nextTs, ts))
    }

    requestAnimationFrame((nextTs) => this._updateLoop(nextTs, lastTime))
  }
}
