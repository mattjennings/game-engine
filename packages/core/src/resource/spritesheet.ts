import { ImageResource } from '../resource'

export class SpriteSheetResource<T extends string> extends ImageResource {
  public frameWidth: number
  public frameHeight: number
  public animations?: {
    [key: string]: number[]
  }

  constructor(
    src: string,
    {
      frameWidth,
      frameHeight,
      animations,
    }: {
      frameWidth: number
      frameHeight: number
      animations: Record<T, number[]>
    }
  ) {
    super(src)
    this.frameWidth = frameWidth
    this.frameHeight = frameHeight
    this.animations = animations
  }

  getFrame(row: number, col: number): SpriteSheetFrame
  getFrame(frame: number): SpriteSheetFrame
  getFrame(frameOrRow: number, col?: number) {
    if (col !== undefined) {
      return {
        x: col * this.frameWidth,
        y: frameOrRow * this.frameHeight,
        width: this.frameWidth,
        height: this.frameHeight,
      }
    }

    const frame = frameOrRow

    const x = (frame % (this.image.width / this.frameWidth)) * this.frameWidth
    const y =
      Math.floor(frame / (this.image.width / this.frameWidth)) *
      this.frameHeight

    return {
      x,
      y,
      width: this.frameWidth,
      height: this.frameHeight,
    }
  }

  getAnimation(name: string) {
    return this.animations?.[name]
  }

  getAnimationFrame(name: string, frame: number) {
    const animation = this.getAnimation(name)
    if (!animation) {
      return
    }

    return this.getFrame(animation[frame])
  }
}

export interface SpriteSheetFrame {
  x: number
  y: number
  width: number
  height: number
}
