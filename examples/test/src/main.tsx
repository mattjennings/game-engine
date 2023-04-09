import { engine } from './engine'
import { FadeTransition } from './fade-transition'
import { resources } from './resources'

await resources.load()
await engine.start()

while (true) {
  await engine.router.navigate(
    engine.router.currentScene.name === 'level1' ? 'level2' : 'level1',
    {
      transition: new FadeTransition({
        duration: 1000,
      }),
      data: {},
    }
  )
}
