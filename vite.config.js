import { resolve } from 'path'
import tailwindcss from 'tailwindcss'
import { defineConfig } from 'vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import { liquidishTransform } from './liquidish';

const path = (path) => resolve(__dirname, path);
const srcTemplatesPath = path('src/templates');

const staticAssetsDirectories = [
  'favicon',
  'fonts',
  'images',
  'javascripts',
  'stylesheets',
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
        dir: path('dist/assets'),
      },
    },
  },

  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: 'src/templates/**/*.liquid',
          dest: 'templates',
          
          transform: liquidishTransform,

          rename: function (name, ext, fullPath) {
            const path = fullPath.replace(srcTemplatesPath, '');
            return path.replace(/\.liquid$/, '.htm');
          },
        },
        ...staticAssetsDirectories.map((dir) => ({
          src: `src/assets/${dir}`,
          dest: `assets`,
        })),
      ],
    })
  ],
})