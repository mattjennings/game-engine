import { Scene, Engine, UpdateArgs } from '@game-engine/core'
import { Player } from './player'

export class Level2 extends Scene {
  public onCreate(): void {
    console.log('Level2 created')
    this.addChild(new Player({ x: 110, y: 100 }))
  }
}
