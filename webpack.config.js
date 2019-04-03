var webpack = require('webpack');
var path = require('path');

var basePath = path.join(__dirname, 'src');
module.exports = {
  entry: './src/main.ts',

  output: {
    filename: './bundle.js'
  },

  resolve: {
    root: [ path.join(__dirname, 'src') ],
    extensions: ['', '.ts', '.js'],
    alias: {
      app: basePath + '/app',
      shared: basePath + '/app/shared'
    }
  },

  module: {
    loaders: [
      { test: /\.ts$/, loader: 'ts-loader' }
    ]
  }
};