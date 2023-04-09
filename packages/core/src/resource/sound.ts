import { Resource } from './resource'
import { Howl, Howler } from 'howler'

export class SoundResource implements Resource {
  public sound: Howl
  public isLoaded: boolean

  constructor(public src: string) {
    this.sound = new Howl({
      src: [src],
      onload: () => {
        this.isLoaded = true
      },
      onloaderror: () => {
        this.isLoaded = false
      },
    })
    this.isLoaded = false
  }

  public play() {
    return this.sound.play()
  }

  public pause() {
    return this.sound.pause()
  }

  public stop() {
    return this.sound.stop()
  }

  public mute(muted: boolean = true) {
    return this.sound.mute(muted)
  }

  public volume(volume: number) {
    return this.sound.volume(volume)
  }

  public rate(rate: number) {
    return this.sound.rate(rate)
  }

  public seek(seek: number) {
    return this.sound.seek(seek)
  }

  public loop(loop: boolean = true) {
    return this.sound.loop(loop)
  }

  public async load() {
    await new Promise<Howl>((resolve, reject) => {
      this.sound.once('load', () => {
        this.isLoaded = true
        resolve(this.sound)
      })
      this.sound.once('loaderror', () => {
        reject(`Failed to load SoundResource: ${this.src}`)
      })
    })
  }
}
