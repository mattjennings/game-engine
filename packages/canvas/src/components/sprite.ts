import { ImageResource } from '@game-engine/core'
import { useCanvas } from '../renderer'

export interface SpriteProps {
  src: ImageResource
  x: number
  y: number
}

export function Sprite(props: SpriteProps) {
  const ctx = useCanvas()

  if (props.src.isLoaded) {
    ctx.drawImage(props.src.image, props.x, props.y)
  }
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      sprite: SpriteProps
    }
  }
}
