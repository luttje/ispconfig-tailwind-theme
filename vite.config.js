import { resolve } from 'path'
import tailwindcss from 'tailwindcss'
import { defineConfig } from 'vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'

const path = (path) => resolve(__dirname, path);

const staticDirectories = [
  'src/assets/favicon',
  'src/assets/fonts',
  'src/assets/images',
  'src/assets/javascripts',
  'src/assets/stylesheets',
];

export default defineConfig({
  build: {
    outDir: path('dist'),

    // Build as lib, so we can include manually
    lib: {
      entry: path('src/assets/app.js'),
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
        dir: path('theme/assets'),
      },
    },
  },

  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: 'src/templates/*',
          dest: 'templates',
          
          // In order to get better editor support, we'll transform 'Liquidish' templates to the ISPConfig tmpl format
          // transform: (contents, path) => {
          //   // TODO
          // },
        },
        ...staticDirectories.map((dir) => ({
          src: dir,
          dest: dir.replace('src/', ''),
        })),
      ],
    })
  ],
})