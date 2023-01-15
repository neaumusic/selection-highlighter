const path = require("path");

const packageJson = require("./package.json");
const CleanWebpackPlugin = require("clean-webpack-plugin").CleanWebpackPlugin;
const HtmlWebPackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const RemoveFilesWebpackPlugin = require("remove-files-webpack-plugin");

const ROOT = `dist`;

const CHROME_EXTENSION_OUTPUT_PATH = `chrome_extension`;
const FIREFOX_EXTENSION_OUTPUT_PATH = `firefox_extension`;

const CHROME_MANIFEST_ENTRY = `./src/chrome_extension/manifest.json`;
const FIREFOX_MANIFEST_ENTRY = `./src/firefox_extension/manifest.json`;

const POPUP_PATH = `popup`;
const CONTENT_SCRIPT_PATH = `content_script`;
const IMAGES_PATH = `images`;

const manifest = ({ entry, outputDirectory }) => ({
  entry: entry,
  output: {
    path: path.resolve(__dirname, `${ROOT}/${outputDirectory}`),
    filename: "DELETED.js",
  },
  plugins: [
    new CleanWebpackPlugin(),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: "LICENSE.md",
        },
        {
          from: entry,
          transform: function (manifestBuffer, path) {
            const manifestString = manifestBuffer
              .toString()
              .replace(/\$\{PACKAGE_VERSION\}/g, packageJson.version)
              .replace(/\$\{POPUP_PATH\}/g, POPUP_PATH)
              .replace(/\$\{CONTENT_SCRIPT_PATH\}/g, CONTENT_SCRIPT_PATH)
              .replace(/\$\{IMAGES_PATH\}/g, IMAGES_PATH);
            return Buffer.from(manifestString);
          },
        },
        {
          from: "src/images/icon.png",
          to: IMAGES_PATH,
        },
      ],
    }),
    new RemoveFilesWebpackPlugin({
      after: {
        log: false,
        include: [`${ROOT}/${outputDirectory}/DELETED.js`],
      },
    }),
  ],
  stats: true,
  mode: "none",
});

const content_script = ({ outputDirectory }) => ({
  entry: "./src/content_script/highlighter.js",
  output: {
    path: path.resolve(
      __dirname,
      `${ROOT}/${outputDirectory}/${CONTENT_SCRIPT_PATH}`
    ),
    filename: "highlighter.js",
  },
  module: {
    rules: [
      {
        test: /\.js$/i,
        use: [{ loader: "babel-loader" }],
      },
    ],
  },
  stats: true,
  mode: "none",
});

const popup = ({ outputDirectory }) => ({
  entry: "./src/popup/index.js",
  output: {
    path: path.resolve(__dirname, `${ROOT}/${outputDirectory}/${POPUP_PATH}`),
  },
  module: {
    rules: [
      {
        resolve: {
          extensions: [".js", ".jsx", ".ts", ".tsx"],
        },
        test: /\.(js|jsx|ts|tsx)$/i,
        use: [
          {
            loader: "babel-loader",
            options: {
              presets: ["@babel/preset-typescript", "@babel/preset-react"],
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
      filename: "popup.html",
      title: "Selection Highlighter Options",
    }),
  ],
  stats: true,
  mode: "none",
});

module.exports = [
  // chrome
  manifest({
    entry: CHROME_MANIFEST_ENTRY,
    outputDirectory: CHROME_EXTENSION_OUTPUT_PATH,
  }),
  content_script({ outputDirectory: CHROME_EXTENSION_OUTPUT_PATH }),
  popup({ outputDirectory: CHROME_EXTENSION_OUTPUT_PATH }),
  // firefox
  manifest({
    entry: FIREFOX_MANIFEST_ENTRY,
    outputDirectory: FIREFOX_EXTENSION_OUTPUT_PATH,
  }),
  content_script({ outputDirectory: FIREFOX_EXTENSION_OUTPUT_PATH }),
];
