import { Engine, GameObject } from '@game-engine/core'
import { CanvasRenderer, ImageResource } from '@game-engine/canvas'

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

const image = new ImageResource('/cow.png')

image.load()

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

  render() {
    const state = this.state.get()

    return (
      <>
        <sprite x={state.x} y={0} src={image} />
        <text
          x={state.x}
          y={100}
          text="hello from jsx"
          font="20px sans-serif"
        />
      </>
    )
  }
}

engine.addGameObject(new MyObj())
