import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import serve from 'rollup-plugin-serve'

export default {
  input: 'src/index.js',
  output: {
    file: 'dist/bundle.js',
    format: 'iife'
  },
  plugins: [
    resolve(),
    commonjs(),
    serve({
      contentBase: 'dist',
      headers: {
        'Access-Control-Allow-Origin': '*'
      }
    })
  ]
};
