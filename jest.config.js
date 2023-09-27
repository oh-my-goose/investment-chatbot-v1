"use strict";

module.exports = {
  verbose: true,
  moduleDirectories: ["node_modules"],
  preset: "ts-jest",
  testEnvironment: "node",
  testRegex: "(/tests/.*.(spec|test))\\.ts$",
  testPathIgnorePatterns: ["/node_modules/", "/dist/"],
  collectCoverage: false,
  transform: {
    "^.+\\.tsx?$": ["ts-jest", { tsconfig: "<rootDir>/tsconfig.test.json" }],
  },
};
