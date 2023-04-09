import { Transition } from '@game-engine/core'

export class FadeTransition extends Transition {
  postRender(ctx: CanvasRenderingContext2D) {
    const { progress, isOutro } = this.state.get()

    ctx.save()
    ctx.fillStyle = 'black'
    ctx.globalAlpha = isOutro ? progress : 1 - progress
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)

    ctx.restore()
  }
}
