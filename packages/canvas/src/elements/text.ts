import { useCanvas } from '../renderer.js'

export interface TextProps {
  font?: string
  color?: string
  text: string
  x: number
  y: number
  quality?: 'low' | 'medium' | 'high'
}

export function Text(props: TextProps) {
  const ctx = useCanvas()

  ctx.save()
  if (props.font) ctx.font = props.font
  if (props.color) ctx.fillStyle = props.color
  if (props.quality) ctx.imageSmoothingQuality = props.quality

  ctx.fillText(props.text, props.x, props.y)
  ctx.restore()
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      text: TextProps
    }
  }
}
