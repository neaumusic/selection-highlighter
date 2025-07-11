import path from "path";
import { Configuration, DefinePlugin } from "webpack";

import packageJson from "./package.json";
import { CleanWebpackPlugin } from "clean-webpack-plugin";
import HtmlWebPackPlugin from "html-webpack-plugin";
// @ts-ignore
import CopyWebpackPlugin from "copy-webpack-plugin";
import RemoveFilesWebpackPlugin from "remove-files-webpack-plugin";

const config: Configuration[] = [
  // ----------------------------------------------------------------
  //                         GOOGLE CHROME
  // ----------------------------------------------------------------
  manifest({
    entry: `./src/manifest.json`,
    outputDirectory: `dist/chrome_extension`,
    description: `Highlight occurrences of selected text, with or without a keypress.`,
    browserSpecificSettings: null,
  }),
  content_script({
    entry: `./src/content_script/highlighter.ts`,
    outputDirectory: `dist/chrome_extension/content_script`,
  }),
  popup({
    doesSupportPaypal: true,
    entry: `./src/popup/main.tsx`,
    outputDirectory: `dist/chrome_extension/popup`,
  }),
  // ----------------------------------------------------------------
  //                        MOZILLA FIREFOX
  // ----------------------------------------------------------------
  manifest({
    entry: `./src/manifest.json`,
    outputDirectory: `dist/firefox_extension`,
    description: `Highlight occurrences of selected text, with or without a keypress.`,
    browserSpecificSettings: {
      gecko: {
        id: `{ee192302-b8b3-450e-a7f8-a3dabdccf2a8}`,
      },
    },
  }),
  content_script({
    entry: `./src/content_script/highlighter.ts`,
    outputDirectory: `dist/firefox_extension/content_script`,
  }),
  popup({
    doesSupportPaypal: true,
    entry: `./src/popup/main.tsx`,
    outputDirectory: `dist/firefox_extension/popup`,
  }),
  // ----------------------------------------------------------------
  //                       APPLE SAFARI
  //                   (see build_safari.sh)
  // ----------------------------------------------------------------
  manifest({
    entry: `./src/manifest.json`,
    outputDirectory: `build/safari_extension`,
    description: `Highlight occurrences of selected text.`,
    browserSpecificSettings: null,
  }),
  content_script({
    entry: `./src/content_script/highlighter.ts`,
    outputDirectory: `build/safari_extension/content_script`,
  }),
  popup({
    doesSupportPaypal: false,
    entry: `./src/popup/main.tsx`,
    outputDirectory: `build/safari_extension/popup`,
  }),
];

export default config;

type ManifestConfig = {
  entry: string;
  outputDirectory: string;
  description: string;
  browserSpecificSettings: {
    gecko: {
      id: string;
    };
  } | null;
};
function manifest({
  entry,
  outputDirectory,
  description,
  browserSpecificSettings,
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
              let manifestString = manifestBuffer
                .toString()
                .replace(/\$\{DESCRIPTION\}/, description)
                .replace(/\$\{PACKAGE_VERSION\}/g, packageJson.version);
              if (browserSpecificSettings) {
                const manifestJson = JSON.parse(manifestString);
                manifestJson.browser_specific_settings =
                  browserSpecificSettings;
                manifestString = JSON.stringify(manifestJson, null, 2);
              }
              return Buffer.from(manifestString);
            },
          },
          {
            from: `src/images/icon.png`,
            to: `images`,
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
  doesSupportPaypal: boolean;
  entry: string;
  outputDirectory: string;
};
function popup({
  doesSupportPaypal,
  entry,
  outputDirectory,
}: PopupConfig): Configuration {
  return {
    entry: entry,
    output: {
      path: path.resolve(__dirname, outputDirectory),
    },
    plugins: [
      new HtmlWebPackPlugin({
        title: `Selection Highlighter Options`,
      }),
      new DefinePlugin({
        "process.env.DOES_SUPPORT_PAYPAL": JSON.stringify(doesSupportPaypal),
      }),
    ],
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
    stats: true,
    mode: `none`,
  };
}
