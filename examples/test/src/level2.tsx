import { Scene, Engine, UpdateArgs } from '@game-engine/core'
import { Player } from './player'
import { RenderObject } from '@game-engine/canvas'

export default class Level2 extends Scene {
  public onActivate(): void {
    this.addChild(new Player({ x: 200, y: 100 }))

    this.addChild(
      new RenderObject(() => (
        <text
          x={100}
          y={24}
          text="Level 2"
          color="white"
          font="16px Verdana"
          quality="high"
        />
      ))
    )
  }
}
