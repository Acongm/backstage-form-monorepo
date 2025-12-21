import path from 'path';
import { fileURLToPath } from 'url';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import type { Configuration } from 'webpack';
import type { Configuration as DevServerConfiguration } from 'webpack-dev-server';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const config: Configuration & { devServer?: DevServerConfiguration } = {
  mode: 'development',
  entry: {
    index: './src/index.tsx',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].bundle.js',
    clean: true,
    publicPath: '/',
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.jsx'],
    alias: {
      '@arvin/ui-components': path.resolve(__dirname, '../ui-components/src'),
    },
    modules: [
      'node_modules',
      path.resolve(__dirname, '../ui-components/node_modules'),
    ],
  },
  module: {
    rules: [
      {
        test: /\.(tsx?|jsx?)$/,
        loader: 'ts-loader',
        include: [
          path.resolve(__dirname, 'src'),
          path.resolve(__dirname, '../ui-components/src')
        ],
        options: {
          configFile: path.resolve(__dirname, 'tsconfig.json'),
          // 👇 关键：只转译，不进行类型检查 → 绕过 rootDir 限制
          transpileOnly: true,
          allowTsInNodeModules: true,
        }
      },
      {
        test: /\.less$/,
        use: ['style-loader', 'css-loader', 'less-loader'],
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.md$/,
        type: 'asset/source',
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
      filename: 'index.html',
      chunks: ['index'],
    }),
    new HtmlWebpackPlugin({
      template: './public/umd.html',
      filename: 'umd.html',
      chunks: [],
    }),
    new HtmlWebpackPlugin({
      template: './public/esm.html',
      filename: 'esm.html',
      chunks: [],
    }),
  ],
  devServer: {
    port: 3000,
    hot: true,
    open: '/umd.html',
    static: [
      {
        directory: path.join(__dirname, 'public'),
        publicPath: '/',
      },
      {
        directory: path.join(__dirname, '../ui-components/dist'),
        publicPath: '/dist',
      }
    ],
  },
};

export default config;