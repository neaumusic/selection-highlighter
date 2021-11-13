const path = require('path');

const packageJson = require('./package.json');
const CleanWebpackPlugin = require('clean-webpack-plugin').CleanWebpackPlugin;
const HtmlWebPackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const RemoveFilesWebpackPlugin = require('remove-files-webpack-plugin');

const ROOT = `dist`;

const CHROME_EXTENSION_OUTPUT_PATH = `chrome_extension`;
const FIREFOX_EXTENSION_OUTPUT_PATH = `firefox_extension`;

const CHROME_MANIFEST_ENTRY = `./src/chrome_extension/manifest.json`;
const FIREFOX_MANIFEST_ENTRY = `./src/firefox_extension/manifest.json`;

const OPTIONS_PATH = `options`;
const OPTIONS_PAGE_PATH = `options_page`;
const OPTIONS_UI_PATH = `options_ui`;
const HIGHLIGHTER_PATH = `highlighter`;
const IMAGES_PATH = `images`;

const manifest = ({ entry, outputDirectory }) => ({
  entry: entry,
  output: {
    path: path.resolve(__dirname, `${ROOT}/${outputDirectory}`),
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
          from: entry,
          transform: function(manifestBuffer, path) {
            const manifestString = manifestBuffer.toString()
              .replace(/\$\{PACKAGE_VERSION\}/g, packageJson.version)
              .replace(/\$\{OPTIONS_PATH\}/g, OPTIONS_PATH)
              .replace(/\$\{OPTIONS_PAGE_PATH\}/g, OPTIONS_PAGE_PATH)
              .replace(/\$\{OPTIONS_UI_PATH\}/g, OPTIONS_UI_PATH)
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
          `${ROOT}/${outputDirectory}/DELETED.js`,
        ],
      },
    }),
  ],
  stats: true,
  mode: 'none',
});

const highlighter = ({ outputDirectory }) => ({
  entry: './src/highlighter/highlighter.js',
  output: {
    path: path.resolve(__dirname, `${ROOT}/${outputDirectory}/${HIGHLIGHTER_PATH}`),
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
  stats: true,
  mode: 'none',
});

const options_page = ({ outputDirectory }) => ({
  entry: './src/options_page/options_page.js',
  output: {
    path: path.resolve(__dirname, `${ROOT}/${outputDirectory}/${OPTIONS_PAGE_PATH}`),
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
    new HtmlWebPackPlugin({
      filename: 'options_page.html',
      template: './src/options_page/options_page.html',
      title: 'Selection Highlighter Options',
    }),
  ],
  stats: true,
  mode: 'none',
});

const options_ui = ({ outputDirectory }) => ({
  entry: './src/options_ui/options_ui.js',
  output: {
    path: path.resolve(__dirname, `${ROOT}/${outputDirectory}/${OPTIONS_UI_PATH}`),
    filename: 'options_ui.js',
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
    new HtmlWebPackPlugin({
      filename: 'options_ui.html',
      template: './src/options_ui/options_ui.html',
      title: 'Selection Highlighter Options',
    }),
  ],
  stats: true,
  mode: 'none',
});

const options = ({ outputDirectory }) => ({
  entry: './src/options/default_options_text',
  output: {
    path: path.resolve(__dirname, `${ROOT}/${outputDirectory}/${OPTIONS_PATH}`),
    filename: 'default_options_text.js',
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
});

module.exports = [
  // chrome
  manifest({ entry: CHROME_MANIFEST_ENTRY, outputDirectory: CHROME_EXTENSION_OUTPUT_PATH }),
  highlighter({ outputDirectory: CHROME_EXTENSION_OUTPUT_PATH }),
  options({ outputDirectory: CHROME_EXTENSION_OUTPUT_PATH }),
  options_page({ outputDirectory: CHROME_EXTENSION_OUTPUT_PATH }),
  // firefox
  manifest({ entry: FIREFOX_MANIFEST_ENTRY, outputDirectory: FIREFOX_EXTENSION_OUTPUT_PATH }),
  highlighter({ outputDirectory: FIREFOX_EXTENSION_OUTPUT_PATH }),
  options({ outputDirectory: FIREFOX_EXTENSION_OUTPUT_PATH }),
  options_ui({ outputDirectory: FIREFOX_EXTENSION_OUTPUT_PATH }),
];
