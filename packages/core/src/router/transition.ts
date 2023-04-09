import { GameObject, UpdateArgs } from '../game-object'

export interface TransitionArgs {
  duration?: number | { outro: number; intro: number }
  easing?: (t: number) => number
}

export class Transition extends GameObject<{
  progress: number
  isOutro: boolean
  started: boolean
}> {
  duration: { outro: number; intro: number }
  easing: (t: number) => number

  constructor({ duration = 300, easing = (t) => t }: TransitionArgs = {}) {
    super()

    this.state.set({
      progress: 0,
      isOutro: false,
      started: false,
    })

    this.duration =
      typeof duration === 'number'
        ? { outro: duration, intro: duration }
        : duration
    this.easing = easing

    this.on('introstart', this.onIntroStart)
    this.on('intro', this.onIntro)
    this.on('introcomplete', this.onIntroComplete)
    this.on('outrostart', this.onOutroStart)
    this.on('outro', this.onOutro)
    this.on('outrocomplete', this.onOutroComplete)
  }

  onAdd() {
    if (this.engine) {
      this.engine.on('preupdate', this.onEnginePreUpdate)
    }
  }

  onDestroy() {
    if (this.engine) {
      this.engine.off('preupdate', this.onEnginePreUpdate)
    }
  }
  private getDuration() {
    return this.state().isOutro ? this.duration.outro : this.duration.intro
  }

  onEnginePreUpdate = ({ delta }: UpdateArgs) => {
    if (this.state().started) {
      if (this.state().progress >= 1) {
        this.state.set((prev) => ({
          ...prev,
          progress: 1,
          started: false,
        }))
        this.emit(
          this.state().isOutro ? 'outrocomplete' : 'introcomplete',
          undefined
        )
      } else {
        this.state.set((prev) => ({
          ...prev,
          progress: clamp(0, prev.progress + delta / this.getDuration(), 1),
        }))
        this.emit(
          this.state().isOutro ? 'outro' : 'intro',
          this.easing(this.state().progress)
        )
      }
    }
  }

  onIntroStart() {}

  onIntro(_progress: number) {}

  onIntroComplete() {}

  onOutroStart() {}

  onOutro(_progress: number) {}

  onOutroComplete() {}

  async execute(isOutro?: boolean, progress = 0) {
    this.state.set((p) => ({
      ...p,
      started: true,
      progress,
      isOutro: !!isOutro,
    }))

    this.emit(isOutro ? 'outrostart' : 'introstart', undefined)

    return new Promise((resolve) => {
      this.once(isOutro ? 'outrocomplete' : 'introcomplete', () => {
        resolve(null)
      })
    })
  }
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}
