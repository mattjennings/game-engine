import {
  Component,
  Engine,
  GameObject,
  ImageResource,
  ResourceLoader,
  SoundResource,
  UpdateArgs,
} from '@game-engine/core'
import { CanvasRenderer } from '@game-engine/canvas'

const loader = new ResourceLoader({
  resources: {
    cow: new ImageResource('/cow.png'),
    character: new ImageResource('/character.png'),
    music: new SoundResource('/music.mp3'),
  },
})

const engine = new Engine({
  renderer: new CanvasRenderer(document.querySelector('canvas'), {
    antialias: false,
    backgroundColor: 'black',
    resolution: {
      width: 320,
      height: 180,
    },
    scale: 'fit',
  }),
})

await loader.load()
engine.start()

class MyObj extends GameObject<{ x: number }> {
  constructor() {
    super({
      state: {
        x: 0,
      },
    })
  }

  public update({ delta }: UpdateArgs) {
    this.state.set((s) => {
      s.x += delta * 0.1

      // round to 2 decimal places
      s.x = Math.round(s.x * 100) / 100

      return s
    })
  }

  render() {
    const state = this.state.get()

    return (
      <>
        <sprite x={state.x} y={0} src={loader.get('cow')} />
        <text
          x={state.x}
          y={100}
          text="hello from jsx"
          font="20px sans-serif"
          color="white"
        />
      </>
    )
  }
}

engine.addGameObject(new MyObj())
