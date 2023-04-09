import { Scene, Engine, UpdateArgs } from '@game-engine/core'
import { Player } from './player'

export class Level1 extends Scene {
  public onCreate(): void {
    console.log('Level1 created')
    this.addChild(new Player({ x: 100, y: 100 }))
  }
}
