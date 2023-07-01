/** @type {import('jest').Config} */
const config = {
  verbose: true,
  moduleDirectories: ["node_modules", "src"],
  transform: {
    // "^.+\\.tsx?$": "ts-jest",
    "^.+\\.tsx?$": "babel-jest",
    // "^.+\\.mjs$": "babel-jest",
  },
  testPathIgnorePatterns: ["<rootDir>/build/", "<rootDir>/node_modules/", "<rootDir>/dist/"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],
  moduleNameMapper: {
    "^~(.*)$": "<rootDir>/src/$1"
  }
};

module.exports = config;