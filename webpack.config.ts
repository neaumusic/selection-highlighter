import path from "path";
import { Configuration } from "webpack";

import packageJson from "./package.json";
import { CleanWebpackPlugin } from "clean-webpack-plugin";
import HtmlWebPackPlugin from "html-webpack-plugin";
// @ts-ignore
import CopyWebpackPlugin from "copy-webpack-plugin";
import RemoveFilesWebpackPlugin from "remove-files-webpack-plugin";

// tokens for manifest.json
const PACKAGE_VERSION = packageJson.version;
const CONTENT_SCRIPT_PATH = `content_script`;
const POPUP_PATH = `popup`;
const OPTIONS_UI_PATH = `options_ui`;
const IMAGES_PATH = `images`;

const config: Configuration[] = [
  // modern (dist/chrome)
  manifest({
    entry: `./src/chrome_extension/manifest.json`,
    outputDirectory: `dist/chrome_extension`,
    description: `Highlight occurrences of selected text, with or without a keypress.`,
  }),
  content_script({
    entry: `./src/chrome_extension/${CONTENT_SCRIPT_PATH}/highlighter.ts`,
    outputDirectory: `dist/chrome_extension/${CONTENT_SCRIPT_PATH}`,
  }),
  popup({
    entry: `./src/chrome_extension/${POPUP_PATH}/main.tsx`,
    outputDirectory: `dist/chrome_extension/${POPUP_PATH}`,
  }),

  // modern (build/safari)
  manifest({
    entry: `./src/chrome_extension/manifest.json`,
    outputDirectory: `build/safari_extension`,
    description: `Highlight occurrences of selected text.`,
  }),
  content_script({
    entry: `./src/chrome_extension/${CONTENT_SCRIPT_PATH}/highlighter.ts`,
    outputDirectory: `build/safari_extension/${CONTENT_SCRIPT_PATH}`,
  }),
  popup({
    entry: `./src/chrome_extension/${POPUP_PATH}/main.tsx`,
    outputDirectory: `build/safari_extension/${POPUP_PATH}`,
  }),

  // legacy (dist/firefox)
  manifest({
    entry: `./src/firefox_extension/manifest.json`,
    outputDirectory: `dist/firefox_extension`,
    description: `Highlight occurrences of selected text, with or without a keypress.`,
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

export default config;

type ManifestConfig = {
  entry: string;
  outputDirectory: string;
  description: string;
};
function manifest({
  entry,
  outputDirectory,
  description,
}: ManifestConfig): Configuration {
  return {
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
            transform: function (manifestBuffer: Buffer, path: string) {
              const manifestString = manifestBuffer
                .toString()
                .replace(/\$\{DESCRIPTION\}/, description)
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
  };
}

type ContentScriptConfig = {
  entry: string;
  outputDirectory: string;
};
function content_script({
  entry,
  outputDirectory,
}: ContentScriptConfig): Configuration {
  return {
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
  };
}

type PopupConfig = {
  entry: string;
  outputDirectory: string;
};
function popup({ entry, outputDirectory }: PopupConfig): Configuration {
  return {
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
  };
}

type OptionsUIConfig = {
  entry: string;
  outputDirectory: string;
};
function options_ui({
  entry,
  outputDirectory,
}: OptionsUIConfig): Configuration {
  return {
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
  };
}
