import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import serve from "rollup-plugin-serve";

export default [
  {
    input: "bookmarklet/download.js",
    output: {
      file: "dist/download.js",
      format: "es"
    },
    plugins: [resolve(), commonjs(), serve("dist")]
  }
];
