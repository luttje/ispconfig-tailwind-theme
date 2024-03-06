import { resolve } from 'path'
import tailwindcss from 'tailwindcss'
import { defineConfig, normalizePath } from 'vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'

const pathFromRoot = (path) => normalizePath(resolve(__dirname, path));

export default defineConfig({
  build: {
    outDir: pathFromRoot('theme'),

    // Build as lib, so we can include manually
    lib: {
      entry: pathFromRoot('src/assets/app.js'),
      name: 'main',
      fileName: (format) => `tailwindone.${format}.js`,
    },

    css: {
      postcss: {
        plugins: [tailwindcss],
      },
    },

    // Output JS and CSS to the assets directory
    rollupOptions: {
      output: {
        dir: pathFromRoot('theme/assets'),
      },
    },
  },
  
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: 'src/templates/**/*',
          dest: 'templates',
          
          // In order to get better editor support, we'll transform 'Liquidish' templates to the ISPConfig tmpl format
          transform: (contents, path) => {
            // TODO
          },
          
          rename: (name) => name.replace('.html', '.htm'),
        }
      ]
    })
  ],
})