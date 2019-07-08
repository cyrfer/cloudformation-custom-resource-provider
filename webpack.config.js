const path = require('path');

const isDevMode = false;

// example excluding aws-sdk:
// https://blog.atj.me/2017/10/bundle-lambda-functions-using-webpack/

const serverConfig = {
  mode: !isDevMode ? 'production' : 'development',
  devtool: !isDevMode ? undefined : 'inline-source-map',
  target: 'node',
  entry: './src/index.js',
  output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'index.js',
      library: 'index',
      libraryTarget: 'commonjs2',
  },
  externals: {
    'aws-sdk': {
      commonjs: 'aws-sdk',
      commonjs2: 'aws-sdk',
      amd: 'aws-sdk',
      root: 'aws-sdk'
    },
  }
};

module.exports = [serverConfig];
