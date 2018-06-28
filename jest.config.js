module.exports = {
  collectCoverageFrom        : [ 'src/**/*.js', ],
  coveragePathIgnorePatterns : [ 'src/index.js', ],
  moduleFileExtensions       : [ 'js', ],
  modulePaths                : [
    '<rootDir/src',
    '<rootDir>/node_modules',
  ],
};
