import {
  Scene,
  Engine,
  UpdateArgs,
  GameObject,
  SceneActivateArgs,
} from '@game-engine/core'
import { Player } from './player'
import { RenderObject } from '@game-engine/canvas'

export default class Level1 extends Scene<{ something?: boolean }> {
  public onActivate(args: SceneActivateArgs<{ something?: boolean }>): void {
    this.addChild(new Player({ x: 100, y: 100 }))

    this.addChild(
      new RenderObject(() => {
        return (
          <text
            x={100}
            y={24}
            text="Level 1"
            color="white"
            font="16px Verdana"
            quality="high"
          />
        )
      })
    )
  }
}
