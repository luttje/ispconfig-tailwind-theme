import { resolve } from 'path';
import tailwindcss from 'tailwindcss';
import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import { ISPConfigTransformationStrategy } from 'liquidish/strategies';
import { LiquidishTransformer } from 'liquidish';
import { lstatSync, readdirSync } from 'fs';

const path = (path) => resolve(__dirname, path);
const srcTemplatesPath = path('src/templates');

const liquidish = new LiquidishTransformer({
    strategyBuilder: (transformer) => new ISPConfigTransformationStrategy(transformer)
});

const staticAssetsDirectories = [
    'favicon',
    'fonts',
    'images',
    'javascripts',
    'stylesheets',
];

const templateFiles = [];

// Iterate all files in the templates directory recursivly, and add them (except those in components/)
const walk = (dir) => {
    const files = readdirSync(dir);

    for (const file of files) {
        const fullPath = resolve(dir, file);

        if (file.endsWith('.liquid')) {
            templateFiles.push(fullPath.replace(__dirname, '').replace(/\\/g, '/').replace(/^\//, ''));
        }

        if (lstatSync(fullPath).isDirectory()) {
            if (file === 'components') {
                continue;
            }

            walk(fullPath);
        }
    }
}

walk(srcTemplatesPath);

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
                    // src: 'src/templates/**/*.liquid',
                    src: templateFiles,
                    dest: 'templates',

                    transform: (contents, path) => {
                        // console.log(path);
                        return liquidish.transform(contents, path);
                    },

                    rename: function (name, ext, fullPath) {
                        const path = fullPath.replace(srcTemplatesPath, '');
                        return path.replace(/\.liquid$/, '.htm');
                    },
                },

                ...staticAssetsDirectories.map((dir) => ({
                    src: `src/assets/${dir}`,
                    dest: `assets`,
                })),

                {
                    src: 'src/ispconfig_version',
                    dest: '.',
                },
            ],
        })
    ],
})
