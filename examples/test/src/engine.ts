import { CanvasRenderer } from '@game-engine/canvas'
import { Engine } from '@game-engine/core'
import Level1 from './level1'

export const engine = new Engine({
  initialScene: 'level1',
  scenes: {
    level1: Level1,
    level2: () => import('./level2'),
  },
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
