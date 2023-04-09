import { Scene } from './scene'

export abstract class Renderer<T extends Scene = Scene> {
  abstract render?(args: { scene: T; delta: number }): void
}
