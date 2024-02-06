const { defaults: tsjPreset } = require("ts-jest/presets")

module.exports = {
  ...tsjPreset,
  preset: "react-native",
  roots: ["<rootDir>"],
  globals: {
    "ts-jest": {
      tsConfig: "tsconfig.test.json",
    },
  },
  moduleFileExtensions: ["js", "ts", "tsx", "json"],
  testPathIgnorePatterns: ["node_modules", "detox"],
  moduleNameMapper: {
    "^app(.*)$": "<rootDir>/app/$1",
    "^assets(.*)$": "<rootDir>/assets/$1",
    "^test(.*)$": "<rootDir>/test/$1",
  },
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": "babel-jest",
  },

  setupFiles: ["<rootDir>/test/setup.ts"],
}
