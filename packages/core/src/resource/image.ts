import { Resource } from './resource'

export class ImageResource implements Resource {
  public image: HTMLImageElement
  public isLoaded: boolean

  constructor(public src: string) {
    this.image = new Image()
    this.isLoaded = false
  }

  get width() {
    return this.image.width
  }

  get height() {
    return this.image.height
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
}
