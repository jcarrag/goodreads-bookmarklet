import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import serve from 'rollup-plugin-serve'

export default [
  {
    input: 'src/index.js',
    output: {
      file: 'dist/server.js',
      format: 'cjs'
    },
    plugins: [
      resolve({ preferBuiltins: true }),
      commonjs(),
      serve("dist")
    ],
    external: [ 'fs', 'path', 'stream', 'http', 'events', 'util', 'url', 'https', 'net', 'zlib', 'dns', 'os', 'tls' ]
  }, {
    input: 'bookmarklet/download.js',
    output: {
      file: 'dist/download.js',
      format: 'es'
    },
    plugins: [
      resolve(),
      commonjs()
    ]
  }
]
