import path from 'path';
import { readdirSync, existsSync } from 'fs';
import type { Configuration } from 'webpack';

const PAGES_DIR = path.resolve(__dirname, 'src/components');
const entries = {};

if (existsSync(PAGES_DIR)) {
  const dirs = readdirSync(PAGES_DIR).filter(dir => 
    !dir.startsWith('.') && 
    existsSync(path.join(PAGES_DIR, dir, `${dir}.tsx`))
  );
  
  dirs.forEach(dir => {
    entries[dir] = `./src/components/${dir}/index.ts`;
  });
}

if (Object.keys(entries).length === 0) {
  entries['UserProfileForm'] = './src/components/UserProfileForm/index.ts';
}

const config: Configuration = {
  mode: 'production',
  entry: entries,
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].umd.js',
    library: {
      name: '[name]FormPlugin',
      type: 'umd',
      export: 'default',
    },
    globalObject: 'this',
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\\.(tsx?|jsx?)$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
        options: { transpileOnly: true },
      },
    ],
  },
  externals: {
    react: 'React',
    'react-dom': 'ReactDOM',
    antd: 'antd',
  },
};

export default config;
