import { Writable, writable } from './store'

export class GameObject<State = any> {
  public preUpdate?(args: { delta: number }): void
  public update?(args: { delta: number }): void
  public postUpdate?(args: { delta: number }): void

  public state: Writable<State>

  constructor({
    state,
  }: {
    state: State extends never ? State | undefined : State
  }) {
    this.state = writable<State>(state as State)
  }
}
