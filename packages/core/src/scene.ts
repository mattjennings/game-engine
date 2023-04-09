import { EventEmitter } from 'events'
import { GameObject, UpdateArgs } from './game-object'
import { Engine } from './engine'

export interface SceneActivateArgs<Data = undefined> {
  data: Data
}

export class Scene<Data = undefined> extends EventEmitter {
  name?: string
  isActive: boolean = false
  engine: Engine<any, any>

  public onCreate(): void {}
  public onDestroy(): void {}
  public onActivate(_args: SceneActivateArgs): void {}
  public onDeactivate(): void {}

  public children: Set<GameObject>

  constructor(engine: Engine<any>, opts?: { name?: string }) {
    super()
    this.name = opts?.name
    this.engine = engine
    this.children = new Set<GameObject>()

    this.onCreate?.()

    this.update = this.update?.bind(this)
    this.preUpdate = this.preUpdate?.bind(this)
    this.postUpdate = this.postUpdate?.bind(this)

    this.engine.on('update', this.update)
    this.engine.on('preupdate', this.preUpdate)
    this.engine.on('postupdate', this.postUpdate)
  }

  public addChild(gameObject: GameObject): void {
    if (!this.children.has(gameObject)) {
      this.children.add(gameObject)
      gameObject._attachScene(this)

      this.emit('gameobject_added', gameObject)
    } else {
      console.warn('GameObject already added to scene')
    }
  }

  public destroyChild(gameObject: GameObject): void {
    if (this.children.has(gameObject)) {
      this.children.delete(gameObject)
      this.emit('gameobject_destroyed', gameObject)
    } else {
      console.warn('GameObject not found in scene')
    }
  }

  public _activate({ data }: SceneActivateArgs<Data>) {
    this.onActivate?.({ data } as SceneActivateArgs)
    this.emit('activate', { data })
    this.isActive = true
  }

  public _deactivate() {
    this.onDeactivate?.()
    this.emit('deactivate')
    this.isActive = false
  }

  public _destroy() {
    for (const child of this.children) {
      this.destroyChild(child)
    }
    this.onDestroy?.()
    this.emit('destroy')

    this.engine.off('update', this.update)
    this.engine.off('preUpdate', this.preUpdate)
    this.engine.off('postUpdate', this.postUpdate)
  }

  public preUpdate(_args: UpdateArgs): void {
    for (const child of this.children) {
      child.preUpdate(_args)
    }
  }

  public update(_args: UpdateArgs): void {
    for (const child of this.children) {
      child.update(_args)
    }
  }

  public postUpdate(_args: UpdateArgs): void {
    for (const child of this.children) {
      child.postUpdate(_args)
    }
  }
}
