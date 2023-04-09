import { EventEmitter } from 'events'
import { Writable, writable } from './store'
import { Component } from './component'
import { Engine } from './engine'
import { Scene } from './scene'

export class GameObject<State = any> extends EventEmitter {
  engine?: Engine<any, any>
  scene?: Scene<unknown>

  public state: Writable<State>
  public components: Map<new () => Component, Component>

  public onAdd?(_scene: Scene<unknown>): void
  public onRemove?(): void
  public onDestroy?(): void

  public onUpdate?(_args: UpdateArgs): void
  public onPreUpdate?(_args: UpdateArgs): void
  public onPostUpdate?(_args: UpdateArgs): void

  constructor({
    state,
  }: {
    state: State extends never ? State | undefined : State
  }) {
    super()
    this.state = writable<State>(state as State)
    this.components = new Map()
  }

  public addComponent(component: Component): void {
    this.components.set(component.constructor as new () => Component, component)
    component.add(this)
  }

  public removeComponent(component: Component): void {
    this.components.delete(component.constructor as new () => Component)
    component.remove()
  }

  public getComponent<T extends Component>(type: new (...args: any) => T): T {
    const component = this.components.get(type) as T

    if (!component) {
      throw new Error(`Component ${type.name} not found`)
    }

    return component
  }

  public attachScene(scene: Scene<unknown>): void {
    this.scene = scene
    this.engine = scene.engine
    this.onAdd?.(scene)
    this.emit('add')
  }

  public detachScene(): void {
    this.onRemove?.()
    this.emit('remove')
    this.scene = undefined
    this.engine = undefined
  }

  public preUpdate(_args: UpdateArgs): void {
    this.onPreUpdate?.(_args)
    this.emit('preupdate', _args)
  }

  public update(_args: UpdateArgs): void {
    this.onUpdate?.(_args)
    this.emit('update', _args)
  }

  public postUpdate(_args: UpdateArgs): void {
    this.onPostUpdate?.(_args)
    this.emit('postupdate', _args)
  }

  public render(args: any): void {
    this.emit('render', args)
  }

  public destroy() {
    this.onDestroy?.()
    this.emit('destroy')
    this.scene?.removeChild(this)
    this.detachScene()
  }
}

export type UpdateArgs = { delta: number }
