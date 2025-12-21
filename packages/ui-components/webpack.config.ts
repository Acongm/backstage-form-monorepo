import path from 'path';
import { fileURLToPath } from 'url';
import { readdirSync, existsSync } from 'fs';
import type { Configuration } from 'webpack';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PAGES_DIR = path.resolve(__dirname, 'src/components');

// 自动扫描组件目录
function getEntries() {
  const entries: Record<string, string> = {};
  
  // Add index entry that exports all components
  entries['index'] = path.join(__dirname, 'src/index.ts');
  
  if (existsSync(PAGES_DIR)) {
    const dirs = readdirSync(PAGES_DIR).filter(dir => 
      !dir.startsWith('.') && 
      existsSync(path.join(PAGES_DIR, dir, 'index.ts'))
    );
    
    dirs.forEach(dir => {
      entries[dir] = path.join(PAGES_DIR, dir, 'index.ts');
    });
  }
  
  return entries;
}

export default (env: { mode?: string } = {}) => {
  const entries = getEntries();
  const isUMD = env.mode === 'umd';
  
  const config: Configuration = {
    mode: 'production',
    entry: entries,
    output: {
      path: path.resolve(__dirname, isUMD ? 'dist/umd' : 'dist/esm'),
      filename: (pathData) => {
        return pathData.chunk?.name === 'index' ? 'index.js' : '[name]/index.js';
      },
      library: isUMD ? {
        name: '[name]FormPlugin',
        type: 'umd',
      } : undefined,
      libraryTarget: isUMD ? 'umd' : undefined,
      globalObject: 'this',
      clean: false,
      module: !isUMD, // ESM 需要启用 module 输出
    },
    experiments: !isUMD ? {
      outputModule: true, // 启用真正的 ESM 输出
    } : undefined,
    resolve: {
      extensions: ['.tsx', '.ts', '.js', '.jsx'],
    },
    module: {
      rules: [
        {
          test: /\.(tsx?|jsx?)$/,
          loader: 'ts-loader',
          exclude: /node_modules/,
          options: { 
            transpileOnly: true,
            compilerOptions: {
              module: isUMD ? 'ESNext' : 'ESNext',
            }
          },
        },
        {
          test: /\.less$/,
          use: ['style-loader', 'css-loader', 'less-loader'],
        },
      ],
    },
    externals: isUMD ? {
      react: {
        commonjs: 'react',
        commonjs2: 'react',
        amd: 'React',
        root: 'React',
      },
      'react-dom': {
        commonjs: 'react-dom',
        commonjs2: 'react-dom',
        amd: 'ReactDOM',
        root: 'ReactDOM',
      },
      antd: {
        commonjs: 'antd',
        commonjs2: 'antd',
        amd: 'antd',
        root: 'antd',
      },
    } : [
      // ESM 格式：使用正则表达式排除所有外部依赖
      /^react$/,
      /^react-dom$/,
      /^antd/,
      /^@ant-design\//,
    ],
  };

  return config;
};