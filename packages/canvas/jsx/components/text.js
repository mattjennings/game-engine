import { useCanvas } from '../../renderer.js'

export function Text(props) {
  const ctx = useCanvas()

  ctx.font = props.font
  ctx.fillStyle = props.color
  ctx.fillText(props.text, props.x, props.y)
}
