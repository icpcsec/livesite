const path = require('path');

const outDir = path.resolve(__dirname, 'out');

module.exports = {
  mode: 'production',
  target: 'web',
  entry: './js/index.js',
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: ['babel-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  output: {
    filename: 'bundle.js',
    path: outDir,
  },
};
