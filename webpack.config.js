const path = require( 'path' );

const config = {
  entry  : './src/index.js',
  module : {
    rules: [
      {
        include : path.resolve( 'src' ),
        test    : /\.(js)$/,
        use     : [
          'babel-loader',
          'eslint-loader',
        ],
      },
    ],
  },
};
const devConfig = {
  ...config,
  ...{
    mode   : 'development',
    output : {
      filename      : 'index.js',
      library       : 'reduxMethods',
      libraryTarget : 'umd',
      path          : path.resolve( 'dist' ),
    },
  },
};
const prodConfig = {
  ...config,
  ...{
    mode   : 'production',
    output : {
      filename      : 'index.min.js',
      library       : 'reduxMethods',
      libraryTarget : 'umd',
      path          : path.resolve( 'dist' ),
    },
  },
};

module.exports = [
  devConfig,
  prodConfig,
];
