/** @type {import('jest').Config} */
module.exports = {
  preset: "jest-expo",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/../src/$1",
    "^~/(.*)$": "<rootDir>/src/$1",
    // Its react-native entry is an .mjs file Jest can't load; tests use the CommonJS build.
    "^lucide-react-native$": "<rootDir>/node_modules/lucide-react-native/dist/cjs/lucide-react-native.js",
  },
};
