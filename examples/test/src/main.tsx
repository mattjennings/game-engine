import { Engine, GameObject } from '@game-engine/core'
import { CanvasRenderer } from '@game-engine/canvas'
import { Text } from '@game-engine/canvas/jsx'

const engine = new Engine({
  maxFPS: 60,
  renderer: new CanvasRenderer(document.querySelector('canvas'), {
    antialias: true,
    resolution: {
      width: 800,
      height: 600,
    },
  }),
}).start()

class MyObj extends GameObject<{ x: number }> {
  constructor() {
    super({
      state: {
        x: 0,
      },
    })
  }

  public update({ delta }: { delta: number }) {
    this.state.set((s) => {
      s.x += delta / 100
      return s
    })
  }

  render(ctx: CanvasRenderingContext2D) {
    const state = this.state.get()

    ctx.font = '20px sans-serif'
    ctx.fillText('hello from ctx', state.x, 50)

    return (
      <Text x={state.x} y={100} text="hello from jsx" font="20px sans-serif" />
    )
  }
}

engine.addGameObject(new MyObj())
