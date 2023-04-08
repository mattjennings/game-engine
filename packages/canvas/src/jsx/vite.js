/**
 * @return {import('vite').Plugin}
 */
export default function canvasJsx() {
  return {
    name: 'vite-plugin-game-engine-canvas-jsx',
    config(config) {
      config.esbuild ??= {}
      config.define ??= {}

      if (typeof config.esbuild !== 'object') {
        throw new Error('config.esbuild must be enabled')
      }

      config.esbuild.jsxFactory = 'h'
      config.esbuild.jsxFragment = 'Fragment'
      config.esbuild.jsxInject = `import { h, Fragment } from '@game-engine/canvas/jsx/runtime'`
    },
  }
}
