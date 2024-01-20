const path = require("path");
const webpack = require("webpack");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
  entry: {
    app: "./src/Main.ts",
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
    port: 8080,
    static: './dist',
    proxy: {
      '/socket.io': {
        target: 'http://localhost:8000', // 실제 Socket.io 서버 주소에 맞게 수정
        ws: true,
        changeOrigin: true,
      },
    },
  },

  // devServer: {
  //   static: './dist',
  //   //contentBase: path.resolve(__dirname, "dist"),
  //   // https: true
  // },

  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, "index.html").replace(/\\/g, '/'),
          to: path.resolve(__dirname, "dist").replace(/\\/g, '/')
        },
        {
          from: path.resolve(__dirname, "assets", "**", "*").replace(/\\/g, '/'),
          to: path.resolve(__dirname, "dist").replace(/\\/g, '/')
        }
      ]
    })
  ],
};