import type { Config } from "@jest/types";
import nextJest from "next/jest";

export const customJestConfig: Config.InitialOptions = {
  coverageProvider: "v8",
  testEnvironment: "jsdom",
  preset: "ts-jest",
  // Add more setup options before each test is run
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"]
};

export const createJestConfig = nextJest({
  dir: "./"
});

const jestConfig = async () => {
  const nextJestConfig = await createJestConfig(customJestConfig)();
  return {
    ...nextJestConfig,
    moduleNameMapper: {
      // Workaround to put our SVG mock first
      "\\.svg$": "<rootDir>/__mocks__/svg.js",
      ...nextJestConfig.moduleNameMapper
    }
  };
};

export default jestConfig;
