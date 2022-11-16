import summary from 'rollup-plugin-summary';
import {terser} from 'rollup-plugin-terser';
import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import postcss from 'rollup-plugin-postcss';
import litcss from 'rollup-plugin-postcss-lit';
import pkgMinifyHTML from 'rollup-plugin-minify-html-literals';
import {rollupPluginHTML} from '@web/rollup-plugin-html';

const minifyHTML = pkgMinifyHTML.default;

export default {
  input: 'index.html',
  treeshake: true,
  output: {
    format: 'esm',
    chunkFileNames: '[hash]-[name].js',
    entryFileNames: '[hash]-[name].js',
    dir: 'dist',
  },
  onwarn(warning) {
    if (warning.code !== 'THIS_IS_UNDEFINED') {
      console.error(`(!) ${warning.message}`);
    }
  },
  plugins: [
    rollupPluginHTML({
      rootDir: './',
      minify: true,
      flattenOutput: true,
      extractAssets: true,
    }),
    replace({'Reflect.decorate': 'undefined', preventAssignment: true}),
    minifyHTML(),
    resolve({
      browser: true,
    }),
    postcss({
      minimize: true,
      inject: false,
      autoModules: true,
    }),
    litcss(),
    terser({
      toplevel: true,
      ecma: 5,
      module: true,
      warnings: true,
      mangle: {
        properties: {
          regex: /^__/,
        },
      },
    }),
    summary({
      showGzippedSize: true,
      showBrotliSize: true,
    }),
  ],
};
