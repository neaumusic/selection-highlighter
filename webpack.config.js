const path = require(`path`);

const packageJson = require(`./package.json`);
const CleanWebpackPlugin = require(`clean-webpack-plugin`).CleanWebpackPlugin;
const HtmlWebPackPlugin = require(`html-webpack-plugin`);
const CopyWebpackPlugin = require(`copy-webpack-plugin`);
const RemoveFilesWebpackPlugin = require(`remove-files-webpack-plugin`);

// tokens for manifest.json
const PACKAGE_VERSION = packageJson.version;
const CONTENT_SCRIPT_PATH = `content_script`;
const POPUP_PATH = `popup`;
const OPTIONS_UI_PATH = `options_ui`;
const IMAGES_PATH = `images`;

const manifest = ({ entry, outputDirectory }) => ({
  entry: entry,
  output: {
    path: path.resolve(__dirname, outputDirectory),
    filename: `DELETED.js`,
  },
  plugins: [
    new CleanWebpackPlugin(),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: `LICENSE.md`,
        },
        {
          from: entry,
          transform: function (manifestBuffer, path) {
            const manifestString = manifestBuffer
              .toString()
              .replace(/\$\{OPTIONS_UI_PATH\}/g, OPTIONS_UI_PATH)
              .replace(/\$\{IMAGES_PATH\}/g, IMAGES_PATH)
              .replace(/\$\{PACKAGE_VERSION\}/g, PACKAGE_VERSION)
              .replace(/\$\{POPUP_PATH\}/g, POPUP_PATH)
              .replace(/\$\{CONTENT_SCRIPT_PATH\}/g, CONTENT_SCRIPT_PATH);
            return Buffer.from(manifestString);
          },
        },
        {
          from: `src/images/icon.png`,
          to: IMAGES_PATH,
        },
      ],
    }),
    new RemoveFilesWebpackPlugin({
      after: {
        log: false,
        include: [`${outputDirectory}/DELETED.js`],
      },
    }),
  ],
  stats: true,
  mode: `none`,
});

const content_script = ({ entry, outputDirectory }) => ({
  entry: entry,
  output: {
    path: path.resolve(__dirname, outputDirectory),
    // filename: `highlighter.js`,
  },
  module: {
    rules: [
      {
        resolve: {
          extensions: [`.js`, `.jsx`, `.ts`, `.tsx`],
        },
        test: /\.(js|jsx|ts|tsx)$/i,
        use: [
          {
            loader: `babel-loader`,
            options: {
              presets: [
                `@babel/preset-typescript`,
                [`@babel/preset-react`, { runtime: `automatic` }],
              ],
            },
          },
        ],
      },
    ],
  },
  stats: true,
  mode: `none`,
});

const popup = ({ entry, outputDirectory }) => ({
  entry: entry,
  output: {
    path: path.resolve(__dirname, outputDirectory),
  },
  // optimization: {
  //   minimize: true,
  // },
  module: {
    rules: [
      {
        resolve: {
          extensions: [`.js`, `.jsx`, `.ts`, `.tsx`],
        },
        test: /\.(js|jsx|ts|tsx)$/i,
        use: [
          {
            loader: `babel-loader`,
            options: {
              presets: [
                `@babel/preset-typescript`,
                [`@babel/preset-react`, { runtime: `automatic` }],
              ],
            },
          },
        ],
      },
      {
        test: /\.(jpg|jpeg|png|gif|eot|otf|svg|ttf|woff|woff2)$/i,
        use: [
          {
            loader: `file-loader`,
            options: {
              esModule: false,
              name: `[name].[ext]`,
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new HtmlWebPackPlugin({
      title: `Selection Highlighter Options`,
    }),
  ],
  stats: true,
  mode: `none`,
});

const options_ui = ({ entry, outputDirectory }) => ({
  entry: entry,
  output: {
    path: path.resolve(__dirname, outputDirectory),
  },
  module: {
    rules: [
      {
        test: /\.js$/i,
        use: [
          {
            loader: "babel-loader",
          },
        ],
      },
      {
        test: /\.html$/i,
        use: [
          {
            loader: "html-loader",
          },
        ],
      },
      {
        test: /\.css$/i,
        use: [
          {
            loader: "file-loader",
            options: {
              esModule: false,
              name: "styles.css",
            },
          },
        ],
      },
      {
        test: /\.(jpg|jpeg|png|gif|eot|otf|svg|ttf|woff|woff2)$/i,
        use: [
          {
            loader: "file-loader",
            options: {
              esModule: false,
              name: "[name].[ext]",
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new HtmlWebPackPlugin({
      template: "./src/firefox_extension/options_ui/options_ui.html",
      title: "Selection Highlighter Options",
    }),
  ],
  stats: true,
  mode: "none",
});

module.exports = [
  // chrome
  manifest({
    entry: `./src/chrome_extension/manifest.json`,
    outputDirectory: `dist/chrome_extension`,
  }),
  content_script({
    entry: `./src/chrome_extension/${CONTENT_SCRIPT_PATH}/highlighter.ts`,
    outputDirectory: `dist/chrome_extension/${CONTENT_SCRIPT_PATH}`,
  }),
  popup({
    entry: `./src/chrome_extension/${POPUP_PATH}/main.tsx`,
    outputDirectory: `dist/chrome_extension/${POPUP_PATH}`,
  }),

  // firefox
  manifest({
    entry: `./src/firefox_extension/manifest.json`,
    outputDirectory: `dist/firefox_extension`,
  }),
  content_script({
    entry: `./src/firefox_extension/${CONTENT_SCRIPT_PATH}/highlighter.js`,
    outputDirectory: `dist/firefox_extension/${CONTENT_SCRIPT_PATH}`,
  }),
  options_ui({
    entry: `./src/firefox_extension/${OPTIONS_UI_PATH}/options_ui.js`,
    outputDirectory: `dist/firefox_extension/${OPTIONS_UI_PATH}`,
  }),
];
