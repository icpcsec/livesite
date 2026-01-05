const path = require('path');
const fs = require('fs');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const Dotenv = require('dotenv-webpack');

const outDir = path.resolve(__dirname, 'out');

module.exports = (env, argv) => {
  let envFile;
  if (env?.envFile) {
    envFile = env.envFile;
  } else if (fs.existsSync('.env')) {
    envFile = '.env';
  } else {
    envFile = '.env.defaults';
  }

  console.log(`Loading environment from: ${envFile}`);

  return {
    target: 'web',
    entry: './src/index.tsx',
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
      publicPath: '/assets/livesite/js/',
    },
    plugins: [
      new Dotenv({
        path: envFile,
        systemvars: true, // Load system environment variables as well
        safe: '.env.example', // Check that all vars in .env.example are defined
        defaults: '.env.defaults',
      }),
      new HtmlWebpackPlugin({
        template: './public/index.template.html',
        filename: path.resolve(__dirname, 'public/index.html'),
        inject: 'body', // Inject bundle.js at end of body
      }),
    ],
  };
};
