const path = require('path');

const publicDir = path.resolve(__dirname, 'public');

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
    path: path.join(publicDir, 'assets/livesite/js'),
  },
};
