const path = require("path");
const webpack = require("webpack");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
  entry: {
    app: "./client/src/Main.ts",
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

  resolve: {
    extensions: [".ts", ".tsx", ".js"]
  },

  output: {
    filename: "app.js",
    path: path.resolve(__dirname, "dist")
  },

  mode: "development",

  devServer: {
    static: path.resolve(__dirname, "dist"),
    https: false
  },

  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, "index.html").replace(/\\/g, '/'),
          to: path.resolve(__dirname, "dist").replace(/\\/g, '/')
        },
        {
          from: path.resolve(__dirname, "client","public", "**", "*").replace(/\\/g, '/'),
          to: path.resolve(__dirname, "dist").replace(/\\/g, '/')
        }
      ]
    })
  ],

};