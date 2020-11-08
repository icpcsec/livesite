const path = require('path');

const outDir = path.resolve(__dirname, 'out');

module.exports = {
  target: 'web',
  entry: './src/index.js',
  module: {
    rules: [
      {
        test: /\.[jt]sx?$/,
        exclude: /node_modules/,
        use: ['babel-loader', 'ts-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
  },
  output: {
    filename: 'bundle.js',
    path: outDir,
  },
};
