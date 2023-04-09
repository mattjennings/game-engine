import { GameObject, Renderer, Scene } from '@game-engine/core'
import { createContext, useContext } from './jsx/index'

const CanvasContext = createContext(null)

export function useCanvas(): CanvasRenderingContext2D {
  return useContext(CanvasContext)
}

export interface CanvasRendererOptions {
  dpr?: number
  antialias?: boolean
  backgroundColor?: string
  resolution?: {
    width: number
    height: number
  }
  scale?: Scale
}

export type Scale = 'fit' | 'stretch'

interface CanvasScene extends Scene<any> {
  preRender?: (context: CanvasRenderingContext2D) => void
  render?: (context: CanvasRenderingContext2D) => void
  postRender?: (context: CanvasRenderingContext2D) => void

  children: Set<CanvasGameObject | GameObject>
}

interface CanvasGameObject extends GameObject {
  preRender?: (context: CanvasRenderingContext2D) => void
  render?: (context: CanvasRenderingContext2D) => void
  postRender?: (context: CanvasRenderingContext2D) => void
}

export class CanvasRenderer implements Renderer {
  #canvas: HTMLCanvasElement

  #context: CanvasRenderingContext2D

  dpr: number = window.devicePixelRatio
  antialias: boolean = true
  scale: Scale | undefined = undefined
  resolution: {
    width: number
    height: number
  } = {
    width: 800,
    height: 600,
  }
  backgroundColor: string = '#000'

  constructor(canvas: HTMLCanvasElement, options: CanvasRendererOptions = {}) {
    this.#canvas = canvas
    this.#context = canvas.getContext('2d')!

    if (options?.dpr) this.dpr = options.dpr
    if (typeof options.antialias === 'boolean')
      this.antialias = options.antialias
    if (options?.resolution) this.resolution = options.resolution
    if (options?.backgroundColor) this.backgroundColor = options.backgroundColor
    if (options?.scale) this.scale = options.scale

    // set resolution
    const width = this.resolution.width
    const height = this.resolution.height

    // set dpr
    canvas.width = width * this.dpr
    canvas.height = height * this.dpr
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`

    this.#context.scale(this.dpr, this.dpr)

    // set antialias
    if (this.antialias) {
      this.#context.imageSmoothingEnabled = true
      this.#context.imageSmoothingQuality = 'high'
      this.#canvas.style.imageRendering = 'auto'
    } else {
      this.#context.imageSmoothingEnabled = false
      this.#canvas.style.imageRendering = 'pixelated'
    }

    window.addEventListener('resize', () => {
      this.scaleCanvas()
    })

    this.scaleCanvas()
  }

  scaleCanvas() {
    const container = this.#canvas.parentElement
    if (!container) {
      return
    }

    const containerWidth = container.offsetWidth
    const containerHeight = container.offsetHeight
    const aspectRatio = this.resolution.width / this.resolution.height

    switch (this.scale) {
      case 'fit': {
        let newWidth = containerWidth
        let newHeight = newWidth / aspectRatio

        if (newHeight > containerHeight) {
          newHeight = containerHeight
          newWidth = newHeight * aspectRatio
        }

        this.#canvas.style.width = `${newWidth}px`
        this.#canvas.style.height = `${newHeight}px`
        break
      }
      case 'stretch': {
        this.#canvas.style.width = `${containerWidth}px`
        this.#canvas.style.height = `${containerHeight}px`
        break
      }
      default:
        break
    }
  }

  render({ scene }: { scene: CanvasScene }) {
    if (!this.#context) {
      return
    }
    this.#context.fillStyle = this.backgroundColor
    this.#context.fillRect(0, 0, this.#canvas.width, this.#canvas.height)

    CanvasContext.Provider({
      value: this.#context,
      children: () => {
        const canvasGameObjects: CanvasGameObject[] = Array.from(
          scene.children
        ).filter(
          (gameObject) =>
            'render' in gameObject ||
            'preRender' in gameObject ||
            'postRender' in gameObject
        )

        // pre render
        if (scene.preRender) {
          scene.preRender(this.#context)
        }

        canvasGameObjects.forEach((gameObject) => {
          gameObject.preRender?.(this.#context)
        })

        if (scene.render) {
          scene.render(this.#context)
        }

        canvasGameObjects.forEach((gameObject) => {
          gameObject.render?.(this.#context)
        })

        canvasGameObjects.forEach((gameObject) => {
          gameObject.postRender?.(this.#context)
        })

        if (scene.postRender) {
          scene.postRender(this.#context)
        }
      },
    })
  }
}
