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
  public components: Component[]

  constructor({
    state,
    components,
  }: {
    state: State extends never ? State | undefined : State
    components?: Component[]
  }) {
    super()
    this.state = writable<State>(state as State)
    this.components = []

    components?.forEach((c) => this.addComponent(c))
  }

  public addComponent(component: Component): void {
    this.components.push(component)
    component.add(this)
  }

  public removeComponent(component: Component): void {
    const index = this.components.indexOf(component)
    if (index > -1) {
      this.components.splice(index, 1)
    }
    component.remove()
  }

  public getComponent<T extends Component>(type: new () => T): T {
    const component = this.components.find((c) => c instanceof type) as T

    if (!component) {
      throw new Error(`Component ${type.name} not found`)
    }

    return component
  }
}

export type UpdateArgs = { delta: number }
