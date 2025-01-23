const path = require('path');
const webpack = require('webpack');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: {
    demo: './demo/demo.js'
  },
  module: {
    rules: [
      {
        test: /\.(js|tsx?)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-react', '@babel/preset-typescript'],
            plugins: [require.resolve('react-refresh/babel')]
          }
        }
      }
    ]
  },
  resolve: { extensions: ['.ts', '.tsx', '.js', '.json'] },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new ReactRefreshWebpackPlugin({
      overlay: {
        useURLPolyfill: true
      }
    })
  ],
  devtool: 'inline-source-map',
  devServer: {
    host: process.env.IP || 'localhost',
    disableHostCheck: true,
    hot: true,
    compress: true
  }
};
