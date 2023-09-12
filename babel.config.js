/** @type {import('@babel/core').TransformOptions['plugins']} */
const plugins = [
  [
    /** Enables baseUrl: "./" option in tsconfig.json to work @see https://github.com/entwicklerstube/babel-plugin-root-import */
    "babel-plugin-root-import",
    {
      paths: [
        {
          rootPathPrefix: "app/",
          rootPathSuffix: "app",
        },
        {
          rootPathPrefix: "assets/",
          rootPathSuffix: "assets",
        },
        {
          rootPathPrefix: "core/",
          rootPathSuffix: "core",
        },
        {
          rootPathPrefix: "app/components",
          rootPathSuffix: "deprecated",
        },
        {
          rootPathPrefix: "app/components-v2",
          rootPathSuffix: "components",
        },
      ],
    },
  ],
  [
    "@babel/plugin-proposal-decorators",
    {
      legacy: true,
    },
  ],
  [
    "@babel/plugin-proposal-optional-catch-binding"
  ],

  /** NOTE: This must be last in the plugins @see https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/installation/#babel-plugin */
  "react-native-reanimated/plugin",
]

/** @type {import('@babel/core').TransformOptions} */
module.exports = {
  presets: ["module:metro-react-native-babel-preset"],
  env: {
    production: {
      "plugins": [
        [
            "transform-remove-console",
            {
                "exclude": [
                    "error",
                    "warn"
                ]
            }
        ]
      ]
    },
  },
  plugins
}
