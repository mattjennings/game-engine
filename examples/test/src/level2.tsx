import { Scene, Engine, UpdateArgs, ImageResource } from '@game-engine/core'
import { Player } from './player'
import { RenderObject } from '@game-engine/canvas'
import { resources } from './game'

resources.add('cow', new ImageResource('/cow.png'))

export default class Level2 extends Scene {
  public onActivate(): void {
    this.addChildren([
      new Player({ x: 200, y: 100 }),
      new RenderObject(() => (
        <>
          <text
            x={100}
            y={24}
            text="Level 2"
            color="white"
            font="16px Verdana"
          />
          <text
            x={100}
            y={80}
            text="cow was loaded during transition"
            color="white"
            font="8px Verdana"
          />
          <text
            x={100}
            y={92}
            text="refresh and check network tab"
            font="8px Verdana"
            color="white"
          />
          <sprite x={100} y={100} src={resources.get('cow') as ImageResource} />
        </>
      )),
    ])
  }
}
