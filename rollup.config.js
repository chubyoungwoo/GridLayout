import RollupPluginVue from 'rollup-plugin-vue'
import RollupPluginSass from 'rollup-plugin-sass'
import RollupPluginBabel from 'rollup-plugin-babel'
import RollupPluginBuble from 'rollup-plugin-buble'
import RollupPluginUglify from 'rollup-plugin-uglify'
import RollupPluginNodeResolve from 'rollup-plugin-node-resolve'

import Packages from './package.json'

const external = Object.keys(Packages.dependencies)

export default {
  input: './src/main.js',
  output: {
    name: 'GridLayout',
    file: './dist/gridLayout.js',
    format: 'umd',
    external
  },
  plugins: [
    RollupPluginVue({
      compileTemplate: true,
      htmlMinifier: {collapseBooleanAttributes: false}
    }),
    RollupPluginSass({
      output: 'dist/gridLayout.css',
      include: '**/*.scss',
      exclude: 'node_modules/**'
    }),
    RollupPluginBuble({
      transforms: {dangerousForOf: true}
    }),
    RollupPluginBabel({
      exclude: 'node_modules/**',
    }),
    RollupPluginUglify({
      output: {
        comments: false
      }
    }),
    RollupPluginNodeResolve({
      extensions: ['.js', '.vue'],
      preferBuiltins: false
    })
  ]
}