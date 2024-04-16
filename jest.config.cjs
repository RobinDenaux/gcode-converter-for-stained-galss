const { pathsToModuleNameMapper } = require('ts-jest');

module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    moduleNameMapper: {
        "src/(.*)": "<rootDir>/src/$1"
    },
    modulePaths: ['<rootDir>'],
    coverageDirectory: '../coverage',
    moduleFileExtensions: ['js', 'json', 'ts'],
    testRegex: '.*\\.test\\.ts$',
    collectCoverageFrom: ['**/*.(t|j)s'],
};