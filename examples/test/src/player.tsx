import { AnimationComponent, GameObject } from '@game-engine/core'
import { resources } from './game'

export class Player extends GameObject<{ x: number; y: number }> {
  private spritesheet = resources.get('character')

  constructor({ x, y }: { x: number; y: number }) {
    super()

    this.state.set({
      x,
      y,
    })

    this.addComponent(
      AnimationComponent.fromSpriteSheet(this.spritesheet, {
        initial: 'walk_down',
        frameRate: 5,
        strategy: 'loop',
      })
    )
  }

  render() {
    const animation = this.getComponent(AnimationComponent)

    if (!animation.current) {
      return null
    }

    const frame = this.spritesheet.getAnimationFrame(
      animation.current.name,
      animation.current.frame
    )

    return (
      <sprite
        x={this.state().x}
        y={this.state().y}
        src={this.spritesheet}
        crop={frame}
      />
    )
  }
}
