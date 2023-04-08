import { GameObject } from './game-object'

export abstract class Renderer<T extends GameObject<any>> {
  abstract render?(gameObjects: Set<T>): void
  abstract renderStart?(): void
  abstract renderEnd?(): void
}
