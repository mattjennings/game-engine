import { EventEmitter } from 'events'
import { Writable, writable } from './store'
import { Component } from './component'

export class GameObject<State = any> extends EventEmitter {
  public preUpdate?(args: UpdateArgs): void
  public update?(args: UpdateArgs): void
  public postUpdate?(args: UpdateArgs): void

  public onAdd?(): void
  public onRemove?(): void

  public state: Writable<State>
  public components: Map<new () => Component, Component>

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
}

export type UpdateArgs = { delta: number }
