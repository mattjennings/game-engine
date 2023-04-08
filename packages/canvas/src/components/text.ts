import { useCanvas } from '../renderer.js'

export interface TextProps {
  font?: string
  color?: string
  text: string
  x: number
  y: number
}

export function Text(props: TextProps) {
  const ctx = useCanvas()

  ctx.font = props.font
  ctx.fillStyle = props.color
  ctx.fillText(props.text, props.x, props.y)
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      text: TextProps
    }
  }
}
