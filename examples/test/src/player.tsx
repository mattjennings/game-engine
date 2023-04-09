import { AnimationComponent, GameObject, UpdateArgs } from '@game-engine/core'
import { resources } from './resources'

const spritesheet = resources.get('character')

export class Player extends GameObject<{ x: number; y: number }> {
  constructor({ x, y }: { x: number; y: number }) {
    super()

    this.state.set({
      x,
      y,
    })

    this.addComponent(
      AnimationComponent.fromSpriteSheet(spritesheet, {
        initial: 'walk_down',
        frameRate: 5,
        strategy: 'loop',
      })
    )
  }

  render() {
    const animation = this.getComponent(AnimationComponent)
    const frame = spritesheet.getAnimationFrame(
      animation.current.name,
      animation.current.frame
    )

    return (
      <sprite
        x={this.state().x}
        y={this.state().y}
        src={spritesheet}
        crop={frame}
      />
    )
  }
}
