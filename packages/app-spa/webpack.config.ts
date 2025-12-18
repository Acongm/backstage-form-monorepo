const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/index.tsx',
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\\.(tsx?|jsx?)$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\\.(less)$/,
        use: ['style-loader', 'css-loader', 'less-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    alias: {
      // 确保正确解析 monorepo 中的组件
      'ui-components': path.resolve(__dirname, '../ui-components/src'),
    },
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: '表单预览',
      templateContent: '<!DOCTYPE html><html><head><meta charset="utf-8"><title>表单预览</title></head><body><div id="root"></div></body></html>',
    }),
  ],
  devServer: {
    static: './dist',
    port: 3000,
    open: true,
  },
};
