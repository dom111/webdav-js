const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');

module.exports = {
  mode: 'production',
  resolve: {
    alias: {
      'webdav-js': path.resolve(__dirname)
    }
  },
  entry: [
    'babel-polyfill',
    path.resolve(__dirname, 'src/webdav.js')
  ],
  output: {
    filename: 'webdav-min.js',
    path: path.resolve(__dirname, 'src')
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '../assets/css/style-min.css'
    }),
    new OptimizeCssAssetsPlugin()
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader'
      },
      {
        test: /\.css$/,
        use: [
          { loader: MiniCssExtractPlugin.loader },
          'css-loader'
        ]
      },
      {
        test: /\.scss$/,
        use: [
          { loader: MiniCssExtractPlugin.loader },
          'css-loader',
          {
            loader: 'sass-loader',
            options: {
              sassOptions: {
                outputStyle: 'expanded'
              }
            }
          }
        ]
      }
    ]
  }
};
