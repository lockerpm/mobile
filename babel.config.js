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
  plugins: [
    [
      "@babel/plugin-proposal-decorators",
      {
        legacy: true,
      },
    ],
    ["@babel/plugin-proposal-optional-catch-binding"],
    'react-native-reanimated/plugin' // last
  ]
}
