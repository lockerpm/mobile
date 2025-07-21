/** @type {import('@babel/core').TransformOptions['plugins']} */
const plugins = [
  [
    "@babel/plugin-proposal-decorators",
    {
      legacy: true,
    },
  ],
  [
    "module-resolver",
    {
      alias: {
        crypto: "react-native-quick-crypto",
        stream: "readable-stream",
        // buffer: "@craftzdog/react-native-buffer",
      },
    },
  ],
  "@babel/plugin-proposal-export-namespace-from",
]

/** @type {import('@babel/core').TransformOptions} */
module.exports = function (api) {
  api.cache(true)
  return {
    presets: ["babel-preset-expo"],
    env: {
      production: {
        plugins: [
          [
            "transform-remove-console",
            {
              exclude: ["error", "warn"],
            },
          ],
        ],
      },
    },
    plugins,
  }
}
