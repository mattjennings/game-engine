import { CanvasRenderer } from '@game-engine/canvas'
import { Engine } from '@game-engine/core'
import { Level1 } from './level1'
import { Level2 } from './level2'

export const engine = new Engine({
  initialScene: 'level1',
  scenes: {
    level1: Level1,
    level2: Level2,
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
