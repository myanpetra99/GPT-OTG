const path = require('path');

module.exports = {
  mode: 'production',
  entry: {
    contentScript: './src/contentScript.js',
  },
  output: {
    path: path.resolve(__dirname, 'src'),
    filename: '[name].bundle.js',
  },
};
