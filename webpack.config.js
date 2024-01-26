const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
  entry: './client/Main.ts',
  output: {
    filename: 'bundle.js',
    //publicPath: "/dist/",
    path: path.resolve(__dirname, 'dist'),
  },
  mode: 'development',
  devServer: {
    static: {
      directory: path.resolve(__dirname, 'client'),
    },
    port: 8080,
    hot: true,
  },
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
    new HtmlWebpackPlugin({
      template: './client/index.html'
    }),
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