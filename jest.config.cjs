const config = {
  preset: "ts-jest",
  resolver: "ts-jest-resolver",
	testPathIgnorePatterns: [".d.ts", ".js"],
	verbose: true,
	roots: ["<rootDir>/test", "<rootDir>/src"],
	collectCoverageFrom: ["src/**/*.ts", "src/**/*.tsx"],
	coveragePathIgnorePatterns: [
    "src/index.ts",
    "src/browser.ts",
    "src/node.ts",
    "src/node.ts",
    "src/aws-provider/aws-credentials/index.ts",
    "src/controllers/index.ts",
    "src/models/index.ts",
    "src/types/types.ts",
    "src/utils/index.ts",
    "src/views/index.ts",
    "src/views/components/index.ts"
  ],
  coverageProvider: "v8",
	coverageThreshold: {
		global: {
			branches: 69,			
			functions: 68,
			lines: 66,
			statements: 66
		}
	},
  extensionsToTreatAsEsm: [".ts", ".tsx", ".jsx"],
  globals: {
    NODE_ENV: "test"
  },
  setupFiles: [
    '<rootDir>/test/setup.js'
  ],
  moduleNameMapper: {
    uuid: require.resolve('uuid'),
    "^(\\.{1,2}/.*)\\.js$": "$1"
  },
  testEnvironment: "jest-environment-jsdom",
  testEnvironmentOptions: {
    customExportConditions: ['default'],
  },
  transform: {
    "^.+\\.ts$": ["ts-jest", {
      "tsconfig": "tsconfig.test.json",
      "isolatedModules": true,
      "useESM": true
    }],
    "^.+\\.[jt]s[x]": ["ts-jest", {
      "tsconfig": "tsconfig.test.json",
      "isolatedModules": true,
      "useESM": true
    }]
  },
  transformIgnorePatterns: [
    "\\/node_modules\\/(?!((@tinystacks|@aws-sdk|uuid)\\/))"
  ]
}

module.exports = config;