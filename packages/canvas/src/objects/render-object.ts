import { GameObject } from '@game-engine/core'

export class RenderObject extends GameObject {
  fn: () => JSX.IntrinsicElements

  constructor(fn: () => JSX.IntrinsicElements) {
    super()
    this.fn = fn
  }

  render() {
    return this.fn()
  }
}
