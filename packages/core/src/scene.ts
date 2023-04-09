import { EventEmitter } from 'events'
import { GameObject, UpdateArgs } from './game-object'
import { Engine } from './engine'

export interface SceneActivateArgs<Data = undefined> {
  data: Data
}

export class Scene<Data = undefined> extends EventEmitter {
  name?: string
  isActive: boolean = false
  engine: Engine

  public onActivate(_args: SceneActivateArgs): void {}
  public onDeactivate(): void {}

  public children: Set<GameObject>

  constructor(engine: Engine, opts?: { name?: string }) {
    super()
    this.name = opts?.name
    this.engine = engine
    this.children = new Set<GameObject>()

    this.preUpdate = this.preUpdate.bind(this)
    this.update = this.update.bind(this)
    this.postUpdate = this.postUpdate.bind(this)

    this.engine.on('update', this.update)
    this.engine.on('preupdate', this.preUpdate)
    this.engine.on('postupdate', this.postUpdate)
  }

  public addChild(gameObject: GameObject): void {
    if (!this.children.has(gameObject)) {
      this.children.add(gameObject)
      gameObject.attachScene(this)

      this.emit('gameobject_added', gameObject)
    }
  }

  public addChildren(gameObjects: GameObject[]): void {
    for (const gameObject of gameObjects) {
      this.addChild(gameObject)
    }
  }

  public removeChild(gameObject: GameObject): void {
    if (this.children.has(gameObject)) {
      this.children.delete(gameObject)
      gameObject.detachScene()
      this.emit('gameobject_removed', gameObject)
    }
  }

  public destroyChild(gameObject: GameObject): void {
    if (this.children.has(gameObject)) {
      this.children.delete(gameObject)
      gameObject.destroy()
      this.emit('gameobject_destroyed', gameObject)
    }
  }

  public activate({ data }: SceneActivateArgs<Data>) {
    this.onActivate?.({ data } as SceneActivateArgs)
    this.emit('activate', { data })
    this.isActive = true
  }

  public deactivate() {
    this.onDeactivate?.()
    this.emit('deactivate')
    this.isActive = false
  }

  public destroy() {
    this.deactivate()
    for (const child of this.children) {
      this.destroyChild(child)
    }

    this.engine.off('update', this.update)
    this.engine.off('preupdate', this.preUpdate)
    this.engine.off('postupdate', this.postUpdate)
  }

  public preUpdate(_args: UpdateArgs): void {
    if (!this.isActive) return

    for (const child of this.children) {
      child.preUpdate(_args)
    }
  }

  public update(_args: UpdateArgs): void {
    if (!this.isActive) return

    for (const child of this.children) {
      child.update(_args)
    }
  }

  public postUpdate(_args: UpdateArgs): void {
    if (!this.isActive) return

    for (const child of this.children) {
      child.postUpdate(_args)
    }
  }
}
