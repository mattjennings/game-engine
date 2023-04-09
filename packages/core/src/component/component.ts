import { EventEmitter } from 'events'
import { GameObject } from '../game-object'

export class Component<T extends GameObject = GameObject> extends EventEmitter {
  public gameObject!: T

  public preUpdate(_args: { delta: number }): void {}
  public update(_args: { delta: number }): void {}
  public postUpdate(_args: { delta: number }): void {}

  public onGameObjectAdd(): void {}
  public onGameObjectRemove(): void {}

  constructor() {
    super()
  }

  public add(gameObject: GameObject): void {
    this.gameObject = gameObject as T

    this.onGameObjectAdd = this.onGameObjectAdd.bind(this)
    this.onGameObjectRemove = this.onGameObjectRemove.bind(this)
    this.preUpdate = this.preUpdate.bind(this)
    this.update = this.update.bind(this)
    this.postUpdate = this.postUpdate.bind(this)

    this.gameObject.on('add', this.onGameObjectAdd)
    this.gameObject.on('remove', this.onGameObjectRemove)
    this.gameObject.on('preUpdate', this.preUpdate)
    this.gameObject.on('update', this.update)
    this.gameObject.on('postUpdate', this.postUpdate)
  }

  public remove(): void {
    this.gameObject.off('add', this.onGameObjectAdd)
    this.gameObject.off('remove', this.onGameObjectRemove)

    this.gameObject.off('preUpdate', this.preUpdate)
    this.gameObject.off('update', this.update)
    this.gameObject.off('postUpdate', this.postUpdate)
  }
}
