import { Resource } from './resource'

export class ImageResource implements Resource {
  public image: HTMLImageElement
  public isLoaded: boolean

  constructor(public src: string) {
    this.image = new Image()
    this.isLoaded = false
  }

  public async load() {
    await new Promise<HTMLImageElement>((resolve, reject) => {
      this.image.src = this.src
      this.image.onload = () => {
        this.isLoaded = true
        resolve(this.image)
      }
      this.image.onerror = (err) => {
        reject(err)
      }
    })
  }

  public unload() {
    return new Promise<void>((resolve) => {
      this.image.src = ''
      this.isLoaded = false
      resolve()
    })
  }

  public onLoaded(callback: (resource: ImageResource) => void) {
    if (this.isLoaded) {
      callback(this)
    }
  }

  public onUnloaded(callback: () => void) {
    if (!this.isLoaded) {
      callback()
    }
  }
}
