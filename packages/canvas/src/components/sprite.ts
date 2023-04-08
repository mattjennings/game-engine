import { Resource } from '@game-engine/core'
import { useCanvas } from '../renderer'

export interface SpriteProps {
  src: ImageResource
  x: number
  y: number
}

export class ImageResource implements Resource<HTMLImageElement> {
  public image: HTMLImageElement
  public isLoaded: boolean

  constructor(public src: string) {
    this.image = new Image()
    this.isLoaded = false
  }

  public load() {
    return new Promise<HTMLImageElement>((resolve, reject) => {
      this.image.src = this.src
      this.image.onload = () => {
        this.isLoaded = true
        resolve(this.image)
      }
      this.image.onerror = (err) => {
        reject(err)
      }
    })
  }

  public unload() {
    return new Promise<void>((resolve) => {
      this.image.src = ''
      this.isLoaded = false
      resolve()
    })
  }

  public get() {
    return this.image
  }

  public onLoaded(callback: (resource: HTMLImageElement) => void) {
    if (this.isLoaded) {
      callback(this.image)
    }
  }

  public onUnloaded(callback: () => void) {
    if (!this.isLoaded) {
      callback()
    }
  }
}

export function Sprite(props: SpriteProps) {
  const ctx = useCanvas()

  if (props.src.isLoaded) {
    ctx.drawImage(props.src.get(), props.x, props.y)
  }
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      sprite: SpriteProps
    }
  }
}
