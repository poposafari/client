const path = require("path");
const webpack = require("webpack");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
  entry: {
    app: "./client/src/Main.ts",
  },
  output: {
    filename: "app.js",
    path: path.resolve(__dirname, "dist")
  },
  plugins:[
    new webpack.optimize.UglifyJsPlugin() //번들링 될때 소스코드를 난독화 시켜서 번들링 하기 때문에 상용화를 할때는 해당 플러그인을 통해서 번들링 후 배포.
  ],
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