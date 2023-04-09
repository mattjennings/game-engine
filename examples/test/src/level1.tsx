import { Scene } from '@game-engine/core'
import { Player } from './player'

export default class Level1 extends Scene {
  public onActivate(): void {
    this.addChild(new Player({ x: 100, y: 100 }))
  }

  render() {
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
  }
}
