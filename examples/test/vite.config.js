import { defineConfig } from 'vite'
import canvas from '@game-engine/canvas/jsx/vite'

export default defineConfig({
  plugins: [canvas()],
})
