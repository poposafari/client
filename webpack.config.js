const path = require("path");
const webpack = require("webpack");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
  mode:"development",
  devServer: {
    static: path.resolve(__dirname, "dist"),
    https: false,
  },
  entry: {
    app: "./client/src/Main.ts",
  },
  output: {
    filename: "bundle.js",
    publicPath: "./client/public/html/",
    path: path.resolve(__dirname, "dist")
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"]
  },
  devtool: "source-map",
  watchOptions: {
    ignored: /node_modules/,
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      CANVAS_RENDERER: JSON.stringify(true),
      WEBGL_RENDERER: JSON.stringify(true),
    }),
    // new CopyWebpackPlugin({
    //   patterns: [
    //     {
    //       from: path.resolve(__dirname, "index.html").replace(/\\/g, '/'),
    //       to: path.resolve(__dirname, "dist").replace(/\\/g, '/')
    //     },
    //     {
    //       from: path.resolve(__dirname, "client","public", "**", "*").replace(/\\/g, '/'),
    //       to: path.resolve(__dirname, "dist").replace(/\\/g, '/')
    //     }
    //   ]
    // })
  ],
}