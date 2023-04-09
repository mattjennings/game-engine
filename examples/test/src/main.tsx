import { engine } from './engine'
import { resources } from './resources'

await resources.load()
await engine.start()

setInterval(() => {
  engine.router.navigate(
    engine.router.currentScene.name === 'level1' ? 'level2' : 'level1'
  )
}, 2000)
