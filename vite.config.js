import { resolve } from 'path'
import { defineConfig } from 'vite'
import tailwindcss from 'tailwindcss'

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/assets/app.js'),
      name: 'main',
      fileName: (format) => `tailwindone.${format}.js`
    },
    outDir: resolve(__dirname, 'assets/dist'),
    css: {
      postcss: {
        plugins: [tailwindcss],
      },
    },
  },
})