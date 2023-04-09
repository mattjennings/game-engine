import { ImageResource } from '@game-engine/core'
import { useCanvas } from '../renderer'

export interface SpriteProps {
  src: ImageResource
  x: number
  y: number
  crop?: {
    x: number
    y: number
    width: number
    height: number
  }
}

export function Sprite(props: SpriteProps) {
  const ctx = useCanvas()

  if (props.src.isLoaded) {
    if (props.crop) {
      ctx.drawImage(
        props.src.image,
        props.crop.x,
        props.crop.y,
        props.crop.width,
        props.crop.height,
        props.x,
        props.y,
        props.crop.width,
        props.crop.height
      )
    } else {
      ctx.drawImage(props.src.image, props.x, props.y)
    }
  }
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      sprite: SpriteProps
    }
  }
}
