const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
  entry: './client/Main.ts',
  output: {
    filename: 'bundle.js',
    publicPath: "/public/",
    path: path.resolve(__dirname, 'public'),
  },
  devtool: "source-map",
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  plugins: [
    // new CopyWebpackPlugin({
    //   patterns: [
    //     {
    //       from: path.resolve(__dirname,"client","index.html").replace(/\\/g, '/'),
    //       to: path.resolve(__dirname, "dist").replace(/\\/g, '/')
    //     },
    //     {
    //       from: path.resolve(__dirname, "assets", "**", "*").replace(/\\/g, '/'),
    //       to: path.resolve(__dirname, "dist").replace(/\\/g, '/')
    //     }
    //   ]
    // })
  ],
};