const path = require('path');

const distPath = path.resolve(__dirname, '../../..', '.build');

const webpackEntries = {
  'js/maps.bundle': [
    '@webgis/config/yeongju_a.js',
    '@webgis/javascript/maps/index.js',
  ],
  'js/serv.register': [
    '@webgis/config/yeongju_a.js',
    '@webgis/javascript/service/register/kakaoMap.js',
    '@webgis/javascript/service/register/index.js',
  ],
  'js/serv.search': [
    '@webgis/config/yeongju_a.js',
    '@webgis/javascript/service/search/kakaoMap.js',
    '@webgis/javascript/service/search/index.js',
  ],
  'js/data.storage': [
    '@webgis/config/index.js',
    '@webgis/javascript/data/storage.js',
  ],
  'js/serv.pres': [
    '@webgis/javascript/service/pres-manage.js',
  ],
  'js/serv.schedule': [
    '@webgis/javascript/service/schedule.js',
  ],
  'css/custom.bundle': [
    '@webgis/stylesheet/_init.scss',
  ],
};

/**
 * @link https://webpack.js.org/plugins/copy-webpack-plugin/
 */
const webpackCopy = {
  view: {
    from: path.resolve(__dirname, 'views'),
    to: path.resolve(distPath, 'views'),
  },
  media: {
    from: path.resolve(__dirname, 'media'),
    to: path.resolve(distPath, 'public', 'assets', 'media'),
  },
};

/**
 * @link https://webpack.js.org/configuration/module/#rule
 */
const webpackRules = {
  js: {
    test: /\.m?js$/,
    exclude: [/(node_modules|bower_components)/, /__tests__/],
    loader: 'babel-loader',
    options: {
      cacheDirectory: true,
      rootMode: 'upward',
    },
  },
  worker: {
    test: /.*\.worker\..*$/,
    use: {
      loader: 'worker-loader',
      options: {
        inline: 'no-fallback',
      },
    },
  },
};

module.exports = {
  webpackEntries,
  webpackCopy,
  webpackRules,
};
