import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import sourcemaps from "rollup-plugin-sourcemaps";

export default {
  input: "dist/server.js",
  output: {
    file: "dist/server-rolled.js",
    format: "cjs",
    sourcemap: true,
  },
  plugins: [resolve({ preferBuiltins: true }), commonjs(), sourcemaps()],
};
