import {
  AnimationComponent,
  Component,
  Engine,
  GameObject,
  ImageResource,
  ResourceLoader,
  SoundResource,
  SpriteSheetResource,
  UpdateArgs,
} from '@game-engine/core'
import { CanvasRenderer } from '@game-engine/canvas'

const loader = new ResourceLoader({
  resources: {
    cow: new ImageResource('/cow.png'),
    character: new SpriteSheetResource({
      src: '/character.png',
      frameWidth: 16,
      frameHeight: 16,
      animations: {
        walk_down: [0, 1, 2, 3].map((i) => i * 4),
      },
    }),
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

function ww<T>(obj: T) {
  return {
    get: () => obj,
  }
}
class MyObj extends GameObject<{ x: number }> {
  constructor() {
    super({
      state: {
        x: 0,
      },
    })

    this.addComponent(
      AnimationComponent.fromSpriteSheet(loader.get('character'), {
        initial: 'walk_down',
        frameRate: 5,
        strategy: 'loop',
      })
    )
  }

  public update({ delta }: UpdateArgs) {
    this.state.set((s) => {
      // s.x += delta * 0.1

      // round to 2 decimal places
      s.x = Math.round(s.x * 100) / 100

      return s
    })
  }

  render() {
    const state = this.state.get()
    const animation = this.getComponent(AnimationComponent)

    const frame = loader
      .get('character')
      .getAnimationFrame(animation.current.name, animation.current.frame)

    return (
      <>
        <sprite x={state.x} y={0} src={loader.get('character')} crop={frame} />
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
