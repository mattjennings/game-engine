import { CanvasRenderer } from '@game-engine/canvas'
import { Game, SpriteSheetResource } from '@game-engine/core'
import Level1 from './level1'
import { FadeTransition } from './fade-transition'

export const { engine, router, resources } = new Game({
  initialScene: 'level1',
  scenes: {
    level1: Level1,
    level2: () => import('./level2'),
  },
  renderer: new CanvasRenderer(document.querySelector('canvas')!, {
    antialias: false,
    backgroundColor: 'black',
    resolution: {
      width: 320,
      height: 180,
    },
    scale: 'fit',
  }),

  resources: {
    character: new SpriteSheetResource('/character.png', {
      frameWidth: 16,
      frameHeight: 16,
      animations: {
        walk_down: [0, 1, 2, 3].map((i) => i * 4),
      },
    }),
    // music: new SoundResource('/music.mp3'),
  },
})

router.once('navigatecomplete', async () => {
  await new Promise((resolve) => setTimeout(resolve, 1000))
  router.navigate('level2', {
    transition: new FadeTransition({
      duration: 500,
    }),
  })
})
