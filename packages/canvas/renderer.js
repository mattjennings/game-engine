import { Renderer } from '@game-engine/core'
import { createContext, useContext } from './jsx/index.js'

const CanvasContext = createContext(null)

export function useCanvas() {
  return useContext(CanvasContext)
}

/**
 * @implements {Renderer}
 */
export class CanvasRenderer {
  /**
   * @type {HTMLCanvasElement}
   */
  #canvas

  /**
   * @type {CanvasRenderingContext2D}
   */
  #context

  /**
   * @param {HTMLCanvasElement} canvas
   */
  constructor(canvas, options) {
    this.#canvas = canvas
    this.#context = canvas.getContext('2d')

    const dpr = options?.dpr || window.devicePixelRatio
    const antialias = options?.antialias ?? true
    const resolution = options?.resolution

    if (resolution) {
      canvas.width = resolution.width
      canvas.height = resolution.height
    }

    if (dpr) {
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      this.#context.scale(dpr, dpr)
    }

    if (options?.antialias) {
      this.#context.imageSmoothingEnabled = true
      this.#context.imageSmoothingQuality = 'high'
    }
  }

  renderStart() {
    this.#context.clearRect(
      0,
      0,
      this.#context.canvas.width,
      this.#context.canvas.height
    )
  }

  /**
   *
   * @param {Set<any>} gameObjects
   */
  render(gameObjects) {
    if (!this.#context) {
      return
    }

    CanvasContext.Provider({
      value: this.#context,
      children: () =>
        Array.from(gameObjects).map((gameObject) =>
          gameObject.render(this.#context)
        ),
    })
  }
}
