const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const nodeExternals = require('webpack-node-externals');
const TerserJSPlugin = require('terser-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const packageJson = require('./package.json');
const packageJsonTools = require('./tools/package.json');

const args = getParameters();
const filterProperties = new Set([
  'description',
  'devDependencies',
  'homepage',
  'license',
]);

function getParameters() {
  const possibleArgs = [
    'js', 'prod',
  ];

  const args = [];
  possibleArgs.forEach(function (key) {
    if (process.env['npm_config_' + key]) {
      args.push(key);
    }
  });

  return args;
}

module.exports = {
  target: 'node',
  mode: args.indexOf('prod') === 0 ? 'production' : 'development',
  stats: 'errors-warnings',
  entry: {
    app: './bin/www.js',
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, '.build'),
    publicPath: './public',
  },
  optimization: {
    minimizer: [
      new TerserJSPlugin({
        terserOptions: {
          ecma: 2015,
          module: true,
        },
      }),
    ],
  },
  devtool: args.indexOf('prod') === 0 ? false : 'source-map',
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, 'server.json'),
          to: path.resolve(__dirname, '.build', 'server.json'),
        },
      ],
    }),
    {
      apply: (compiler) => {
        compiler.hooks.compile.tap('package.json', () => {
          const mergedJson = JSON.stringify(
            _.merge(packageJson, packageJsonTools),
            (k, v) => (v == null || filterProperties.has(k) ? undefined : v),
            2,
          );
          fs.writeFileSync(
            path.resolve(__dirname, '.build', 'package.json'),
            mergedJson,
          );
        });
      },
    },
  ],
  cache: {
    type: 'filesystem',
    buildDependencies: {
      // This makes all dependencies of this file - build dependencies
      config: [__filename],
      // By default webpack and loaders are build dependencies
    },
  },
  node: {
    // Need this when working with express, otherwise the build fails
    __dirname: false, // if you don't put this is, __dirname
    __filename: false, // and __filename return blank or /
  },
  externals: [nodeExternals()], // Need this to avoid error when working with Express
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: [/(node_modules|bower_components)/],
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
          },
        },
      },
    ],
  },
};
