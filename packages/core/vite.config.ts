import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  build: {
    emptyOutDir: process.env.NODE_ENV !== 'development',
    lib: {
      entry: 'src/index.ts',
      name: 'GameEngine',
      fileName: (format) => `game-engine.${format}.js`,
    },
  },

  plugins: [
    dts({
      copyDtsFiles: true,
    }),
  ],
})
