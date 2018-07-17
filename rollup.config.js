import babel from "rollup-plugin-babel";

export default [
  {
    input: "src/module.js",
    plugins: [
      babel({
        exclude: "node_modules/**",
        presets: ["flow"],
      }),
    ],
    output: {
      file: "dist/module/formsquare.js",
      format: "esm",
    },
  },
  {
    input: "src/module.js",
    plugins: [
      babel({
        exclude: "node_modules/**",
        presets: [
          "flow",
          [
            "env",
            {
              modules: false,
              targets: {
                node: "8",
                browsers: ["defaults"],
              },
            },
          ],
        ],
      }),
    ],
    output: [
      {
        file: "dist/cjs/formsquare.js",
        format: "cjs",
        sourcemap: true,
      },
      {
        file: "dist/iife/formsquare.js",
        format: "iife",
        name: "formsquare",
        sourcemap: true,
      },
    ],
  },
];
