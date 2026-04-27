/** @type {import('jest').Config} */
module.exports = {
  projects: [
    {
      displayName: "electron",
      testEnvironment: "node",
      testMatch: ["<rootDir>/electron/**/*.test.js"],
    },
    {
      displayName: "renderer",
      testEnvironment: "jsdom",
      testMatch: ["<rootDir>/src/**/*.test.{ts,tsx}"],
      transform: {
        "^.+\\.tsx?$": "ts-jest",
      },
      moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/src/$1",
      },
      setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
      moduleFileExtensions: ["ts", "tsx", "js", "jsx"],
    },
  ],
};
