module.exports = (api) => {
  const babelEnv = api.env();
  const plugins = [
    [
      "@babel/plugin-proposal-decorators",
      {
        legacy: true,
      },
    ],
    ["@babel/plugin-proposal-optional-catch-binding"],
    'react-native-reanimated/plugin' // last
  ]
  if (babelEnv !== 'development') {
    plugins.push(['transform-remove-console']);
  }
  
  return {
    presets: ["module:metro-react-native-babel-preset"],
    plugins,
  }
}
