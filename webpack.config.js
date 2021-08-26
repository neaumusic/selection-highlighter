const path = require('path');

const CleanWebpackPlugin = require('clean-webpack-plugin').CleanWebpackPlugin;
const HtmlWebPackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const RemoveFilesWebpackPlugin = require('remove-files-webpack-plugin');

const ROOT = `dist/chrome-extension`;
const OPTIONS_PATH = `options`;
const OPTIONS_PAGE_PATH = `options_page`;
const HIGHLIGHTER_PATH = `highlighter`;
const IMAGES_PATH = `images`;

const manifest = {
  entry: './src/chrome_extension/manifest.json',
  output: {
    path: path.resolve(__dirname, ROOT),
    filename: 'DELETED.js',
  },
  plugins: [
    new CleanWebpackPlugin(),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'LICENSE.md'
        },
        {
          from: 'src/chrome_extension/manifest.json',
          transform: function(manifestBuffer, path) {
            const manifestString = manifestBuffer.toString()
              .replace(/\$\{OPTIONS_PATH\}/g, OPTIONS_PATH)
              .replace(/\$\{OPTIONS_PAGE_PATH\}/g, OPTIONS_PAGE_PATH)
              .replace(/\$\{HIGHLIGHTER_PATH\}/g, HIGHLIGHTER_PATH)
              .replace(/\$\{IMAGES_PATH\}/g, IMAGES_PATH);
            return Buffer.from(manifestString);
          },
        },
        {
          from: 'src/images/icon.png',
          to: IMAGES_PATH,
        },
      ],
    }),
    new RemoveFilesWebpackPlugin({
      after: {
        log: false,
        include: [
          `${ROOT}/DELETED.js`,
        ],
      },
    }),
  ],
  stats: true,
  mode: 'none',
};

const highlighter = {
  entry: './src/highlighter/highlighter.js',
  output: {
    path: path.resolve(__dirname, `${ROOT}/${HIGHLIGHTER_PATH}`),
    filename: 'highlighter.js',
  },
  module: {
    rules: [
      {
        test: /\.js$/i,
        use: [
          {loader: 'babel-loader'},
        ],
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
  ],
  stats: true,
  mode: 'none',
};

const options_page = {
  entry: './src/options_page/options_page.js',
  output: {
    path: path.resolve(__dirname, `${ROOT}/${OPTIONS_PAGE_PATH}`),
    filename: 'options_page.js',
  },
  module: {
    rules: [
      {
        test: /\.js$/i,
        use: [{
          loader: 'babel-loader'
        }],
      },
      {
        test: /\.html$/i,
        use: [{
          loader: 'html-loader'
        }],
      },
      {
        test: /\.css$/i,
        use: [{
          loader: 'file-loader',
          options: {
            esModule: false,
            name: '[name].[ext]',
          },
        }],
      },
      {
        test: /\.(jpg|jpeg|png|gif|eot|otf|svg|ttf|woff|woff2)$/i,
        use: [{
          loader: 'file-loader',
          options: {
            esModule: false,
            name: '[name].[ext]',
          },
        }],
      },
    ],
  },
  plugins: [
    // new CleanWebpackPlugin(),
    new HtmlWebPackPlugin({
      filename: 'options_page.html',
      template: './src/options_page/options_page.html',
      title: 'Selection Highlighter Options',
    }),
  ],
  stats: true,
  mode: 'none',
};

const options = {
  entry: './src/options',
  output: {
    path: path.resolve(__dirname, `${ROOT}/${OPTIONS_PATH}`),
    filename: 'defaultOptionsText.js',
  },
  module: {
    rules: [
      {
        test: /\.js$/i,
        use: [
          {loader: 'babel-loader'},
        ],
      },
    ],
  },
  stats: true,
  mode: 'none',
};

module.exports = [
  manifest,
  highlighter,
  options,
  options_page,
];

