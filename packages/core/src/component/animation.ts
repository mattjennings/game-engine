import { UpdateArgs } from '../game-object'
import { SpriteSheetResource } from '../resource'

import { Component } from './component'

export type Animations<T extends string> = Record<T, Animation>

export interface Animation {
  name: string
  frames: number[]
  frameRate: number
  strategy?: AnimationStratgy
}

type AnimationStratgy = 'loop' | 'stop' | 'reverse'

export class AnimationComponent<T extends string> extends Component {
  public animations: Animations<T>

  public current?: {
    name: T
    frame: number
    direction: 1 | -1
    frameTime: number
  }
  constructor(args: {
    initial: T
    animations: Record<T, Omit<Animation, 'name'>>
  }) {
    super()

    this.animations = Object.entries(args.animations).reduce(
      (acc, [name, animation]) => {
        acc[name as T] = {
          ...(animation as Animation),
          name,
        }
        return acc
      },
      {} as Animations<T>
    )
    this.current = {
      name: args.initial,
      frame: 0,
      direction: 1,
      frameTime: 0,
    }
  }

  getAnimation(name: T) {
    return this.animations[name]
  }

  update({ delta }: UpdateArgs) {
    if (!this.current) {
      return
    }

    const animation = this.getAnimation(this.current.name)

    this.current.frameTime += delta

    if (this.current.frameTime >= 1000 / animation.frameRate) {
      this.current.frameTime = 0
      this.current.frame += this.current.direction

      if (this.current.frame >= animation.frames.length) {
        this.current.frame = animation.frames.length - 1
        if (animation.strategy === 'loop') {
          this.current.frame = 0
        } else if (animation.strategy === 'reverse') {
          this.current.direction = -1
        }
      } else if (this.current.frame < 0) {
        this.current.frame = 0
        if (animation.strategy === 'loop') {
          this.current.frame = animation.frames.length - 1
        } else if (animation.strategy === 'reverse') {
          this.current.direction = 1
        }
      }
    }
  }

  static fromSpriteSheet<T extends string>(
    spritesheet: SpriteSheetResource<T>,
    opts: {
      frameRate: number | ((name: T) => number)
      strategy?: AnimationStratgy | ((name: T) => AnimationStratgy)
      initial?: T
    }
  ) {
    const animations: Animations<string> = {}

    Object.entries(spritesheet.animations ?? {}).forEach(([name, frames]) => {
      animations[name] = {
        name,
        frames: frames,
        frameRate:
          typeof opts.frameRate === 'function'
            ? opts.frameRate(name as T)
            : opts.frameRate,
        strategy:
          typeof opts.strategy === 'function'
            ? opts.strategy(name as T)
            : opts.strategy,
      }
    })

    return new AnimationComponent({
      initial: opts?.initial ?? Object.keys(animations)[0],
      animations,
    })
  }
}
