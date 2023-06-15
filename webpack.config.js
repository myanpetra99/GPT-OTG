const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');

module.exports = {
  mode: 'production',
  entry: {
    contentScript: './src/contentScript.js',
    background: './src/background.js',
    popup: './src/popup.css',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
      {
        test: /\.(js)$/,
        exclude: /node_modules/,
        use: ['babel-loader']
      }
    ],
  },
  optimization: {
    minimize: true,
    minimizer: [
      '...',
      new CssMinimizerPlugin(),
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].css',
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: 'src/manifest.json', to: 'manifest.json' },
        { from: 'src/icon16.png', to: 'icon16.png' },
        { from: 'src/icon48.png', to: 'icon48.png' },
        { from: 'src/icon128.png', to: 'icon128.png' },
        { from: 'src/options.html', to: 'options.html' },
        { from: 'src/options.js', to: 'options.js' },
        { from: 'src/options.css', to: 'options.css' }
      ],
    })
  ]
};
