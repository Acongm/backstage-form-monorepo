# Monorepo 项目创建步骤文档

## 目录

1. [项目初始化](#1-项目初始化)
2. [组件库搭建](#2-组件库搭建)
3. [SPA 调试环境搭建](#3-spa-调试环境搭建)
4. [文档站点搭建](#4-文档站点搭建)
5. [代码规范配置](#5-代码规范配置)
6. [Monorepo 管理工具配置](#6-monorepo-管理工具配置)
7. [项目结构总览](#7-项目结构总览)
8. [快速开始指南](#8-快速开始指南)
9. [常见问题解答](#9-常见问题解答)

---

## 1. 项目初始化

### 1.1 创建项目根目录

```bash
mkdir backstage-form-monorepo
cd backstage-form-monorepo
```

### 1.2 初始化根目录 package.json

```bash
npm init -y
```

### 1.3 配置 workspaces

编辑根目录 `package.json`，添加 workspaces 配置：

```json
{
  "name": "backstage-form-monorepo",
  "private": true,
  "workspaces": [
    "packages/*"
  ],
  "scripts": {
    "build:components": "yarn workspace ui-components build",
    "dev:spa": "yarn workspace app-spa dev",
    "dev:docs": "yarn workspace docs-site dev"
  }
}
```

### 1.4 创建 packages 目录结构

```bash
mkdir -p packages/ui-components
mkdir -p packages/app-spa
mkdir -p packages/docs-site
```

---

**第一步完成，请保存后继续下一步**

## 2. 组件库搭建

### 2.1 初始化组件库 package.json

进入 `packages/ui-components` 目录，创建 `package.json`：

```bash
cd packages/ui-components
npm init -y
```

编辑 `package.json`：

```json
{
  "name": "ui-components",
  "version": "0.1.0",
  "main": "dist/index.umd.js",
  "module": "dist/index.esm.js",
  "types": "dist/index.d.ts",
  "files": [
    "dist"
  ],
  "scripts": {
    "build": "npm run build:umd && npm run build:esm",
    "build:umd": "webpack --config webpack.config.ts --env mode=umd",
    "build:esm": "webpack --config webpack.config.ts --env mode=esm"
  },
  "peerDependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "antd": "^5.12.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "@types/webpack-env": "^1.18.5",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "antd": "^5.12.0",
    "typescript": "^5.3.0",
    "webpack": "^5.89.0",
    "webpack-cli": "^5.1.4",
    "ts-loader": "^9.5.0"
  }
}
```

### 2.2 安装依赖

在根目录执行：

```bash
cd ../..
yarn install
```

### 2.3 配置 TypeScript

在 `packages/ui-components` 目录创建 `tsconfig.json`：

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "module": "ESNext",
    "moduleResolution": "node",
    "declaration": true,
    "declarationMap": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": false
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### 2.4 配置 Webpack

创建 `packages/ui-components/webpack.config.ts`：

```typescript
import path from 'path';
import { readdirSync, existsSync } from 'fs';
import type { Configuration } from 'webpack';

const PAGES_DIR = path.resolve(__dirname, 'src/components');

// 自动扫描组件目录
function getEntries() {
  const entries: Record<string, string> = {};
  
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
      path: path.resolve(__dirname, 'dist'),
      filename: isUMD ? '[name].umd.js' : '[name].esm.js',
      library: isUMD ? {
        name: '[name]FormPlugin',
        type: 'umd',
        export: 'default',
      } : undefined,
      libraryTarget: isUMD ? 'umd' : undefined,
      globalObject: 'this',
      clean: false, // 不清空，保留两种格式
    },
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
    } : {
      react: 'react',
      'react-dom': 'react-dom',
      antd: 'antd',
    },
  };

  return config;
};
```

### 2.5 创建组件目录结构

创建示例组件 `UserProfileForm`：

```bash
cd packages/ui-components
mkdir -p src/components/UserProfileForm/{pages,config,i18n,data,utils}
```

### 2.6 创建组件文件

#### 2.6.1 组件主入口 `src/components/UserProfileForm/index.ts`

```typescript
export { default } from './pages';
export * from './config';
export * from './i18n';
export * from './data';
export * from './utils';
```

#### 2.6.2 组件配置 `src/components/UserProfileForm/config/index.ts`

```typescript
export const componentConfig = {
  name: 'UserProfileForm',
  version: '1.0.0',
  description: '用户资料表单组件',
};
```

#### 2.6.3 多语言配置

`src/components/UserProfileForm/i18n/index.ts`:

```typescript
import zh from './zh';
import en from './en';

export default { zh, en };
```

`src/components/UserProfileForm/i18n/zh.ts`:

```typescript
export default {
  title: '用户资料',
  name: '姓名',
  email: '邮箱',
};
```

`src/components/UserProfileForm/i18n/en.ts`:

```typescript
export default {
  title: 'User Profile',
  name: 'Name',
  email: 'Email',
};
```

#### 2.6.4 静态数据 `src/components/UserProfileForm/data/index.ts`

```typescript
export const genderOptions = [
  { label: '男', value: 'male' },
  { label: '女', value: 'female' },
];
```

#### 2.6.5 工具函数 `src/components/UserProfileForm/utils/index.ts`

```typescript
export const formatPhone = (phone: string) => {
  return phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
};
```

#### 2.6.6 组件主逻辑 `src/components/UserProfileForm/pages/index.tsx`

```typescript
import React from 'react';
import { Form, Input, Button } from 'antd';
import i18n from '../i18n';
import { genderOptions } from '../data';

interface UserProfileFormProps {
  onSubmit?: (values: any) => void;
  locale?: 'zh' | 'en';
}

const UserProfileForm: React.FC<UserProfileFormProps> = ({ 
  onSubmit, 
  locale = 'zh' 
}) => {
  const [form] = Form.useForm();
  const t = i18n[locale];

  const handleSubmit = (values: any) => {
    onSubmit?.(values);
  };

  return (
    <Form form={form} onFinish={handleSubmit} layout="vertical">
      <Form.Item label={t.name} name="name" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item label={t.email} name="email" rules={[{ type: 'email' }]}>
        <Input />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit">
          提交
        </Button>
      </Form.Item>
    </Form>
  );
};

export default UserProfileForm;
```

#### 2.6.7 组件库统一导出 `src/index.ts`

```typescript
export { default as UserProfileForm } from './components/UserProfileForm';
```

### 2.7 创建组件文档模板

#### 2.7.1 `src/components/UserProfileForm/README.md`

```markdown
# UserProfileForm 用户资料表单

## 字段说明

- name: 用户姓名（必填）
- email: 用户邮箱（可选）

## 业务规则

1. 姓名不能为空
2. 邮箱格式需要验证
```

#### 2.7.2 `src/components/UserProfileForm/CODE_TEMPLATE.md`

```markdown
# 代码范式

## Props 接口定义

\`\`\`typescript
interface ComponentProps {
  onSubmit?: (values: any) => void;
  locale?: 'zh' | 'en';
}
\`\`\`

## 使用示例

\`\`\`tsx
<UserProfileForm onSubmit={handleSubmit} locale="zh" />
\`\`\`
```

### 2.8 测试构建

```bash
cd packages/ui-components
yarn build
```

构建完成后，`dist` 目录应包含：
- `UserProfileForm.umd.js` (UMD 格式)
- `UserProfileForm.esm.js` (ESM 格式)

---

**第二步完成，请保存后继续下一步**

## 3. SPA 调试环境搭建

### 3.1 初始化 SPA 项目 package.json

进入 `packages/app-spa` 目录，创建 `package.json`：

```bash
cd packages/app-spa
npm init -y
```

编辑 `package.json`：

```json
{
  "name": "app-spa",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "webpack serve --mode development --open",
    "build": "webpack --mode production"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "antd": "^5.12.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "css-loader": "^6.8.1",
    "html-webpack-plugin": "^5.5.3",
    "less": "^4.2.0",
    "less-loader": "^11.1.0",
    "style-loader": "^3.3.3",
    "ts-loader": "^9.5.0",
    "typescript": "^5.3.0",
    "webpack": "^5.89.0",
    "webpack-cli": "^5.1.4",
    "webpack-dev-server": "^5.0.0"
  }
}
```

### 3.2 配置 TypeScript

创建 `packages/app-spa/tsconfig.json`：

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "module": "ESNext",
    "moduleResolution": "node",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

### 3.3 配置 Webpack

创建 `packages/app-spa/webpack.config.ts`：

```typescript
import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import type { Configuration } from 'webpack';

const config: Configuration = {
  mode: 'development',
  entry: './src/index.tsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    clean: true,
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.jsx'],
  },
  module: {
    rules: [
      {
        test: /\.(tsx?|jsx?)$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.less$/,
        use: ['style-loader', 'css-loader', 'less-loader'],
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
      filename: 'index.html',
    }),
  ],
  devServer: {
    port: 3000,
    hot: true,
    open: true,
  },
};

export default config;
```

### 3.4 创建组件配置管理

创建 `packages/app-spa/src/config/component.ts`，用于快速切换组件：

```typescript
// 组件配置
export interface ComponentConfig {
  name: string;
  umdPath: string;
  esmPath: string;
}

// 可用的组件列表（从组件库构建产物中获取）
export const AVAILABLE_COMPONENTS: ComponentConfig[] = [
  {
    name: 'UserProfileForm',
    umdPath: '/dist/UserProfileForm.umd.js',
    esmPath: '/dist/UserProfileForm.esm.js',
  },
  // 添加更多组件...
];

// 从 URL 参数或 localStorage 获取当前组件名
export function getCurrentComponentName(): string {
  const urlParams = new URLSearchParams(window.location.search);
  const componentName = urlParams.get('component') || 
                       localStorage.getItem('currentComponent') || 
                       AVAILABLE_COMPONENTS[0].name;
  
  localStorage.setItem('currentComponent', componentName);
  return componentName;
}

// 获取当前组件配置
export function getCurrentComponentConfig(): ComponentConfig {
  const name = getCurrentComponentName();
  const config = AVAILABLE_COMPONENTS.find(c => c.name === name);
  return config || AVAILABLE_COMPONENTS[0];
}
```

### 3.5 创建 UMD 加载测试页面

创建 `packages/app-spa/public/umd.html`：

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>UMD 组件测试</title>
  <!-- 引入 React 和 Antd (UMD 格式需要外部依赖) -->
  <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  <script src="https://unpkg.com/antd@5/dist/antd.min.js"></script>
  <link rel="stylesheet" href="https://unpkg.com/antd@5/dist/reset.css">
  
  <style>
    body {
      margin: 20px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    .component-selector {
      margin-bottom: 20px;
      padding: 15px;
      background: #f5f5f5;
      border-radius: 4px;
    }
    .component-selector select {
      padding: 8px 12px;
      font-size: 14px;
      border: 1px solid #d9d9d9;
      border-radius: 4px;
      margin-right: 10px;
    }
    .component-selector button {
      padding: 8px 16px;
      background: #1890ff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    #root {
      max-width: 600px;
      margin: 0 auto;
    }
  </style>
</head>
<body>
  <div class="component-selector">
    <label>选择组件：</label>
    <select id="componentSelect">
      <option value="UserProfileForm">UserProfileForm</option>
      <!-- 动态添加更多组件选项 -->
    </select>
    <button onclick="loadComponent()">加载组件</button>
    <button onclick="switchToESM()">切换到 ESM 模式</button>
  </div>
  
  <div id="root"></div>

  <script>
    // 组件配置
    const COMPONENTS = {
      UserProfileForm: {
        umdPath: '/dist/UserProfileForm.umd.js',
        // 添加更多组件...
      }
    };

    // 从 URL 参数获取组件名
    function getComponentName() {
      const params = new URLSearchParams(window.location.search);
      return params.get('component') || 'UserProfileForm';
    }

    // 加载组件
    function loadComponent() {
      const componentName = document.getElementById('componentSelect').value;
      const componentConfig = COMPONENTS[componentName];
      
      if (!componentConfig) {
        console.error('组件不存在:', componentName);
        return;
      }

      // 移除旧的脚本
      const oldScript = document.getElementById('component-script');
      if (oldScript) {
        oldScript.remove();
      }

      // 加载新的组件脚本
      const script = document.createElement('script');
      script.id = 'component-script';
      script.src = componentConfig.umdPath;
      script.onload = () => {
        // 组件加载完成后渲染
        renderComponent(componentName);
        // 更新 URL
        window.history.pushState({}, '', `?component=${componentName}`);
      };
      script.onerror = () => {
        console.error('组件加载失败:', componentConfig.umdPath);
      };
      document.body.appendChild(script);
    }

    // 渲染组件
    function renderComponent(componentName) {
      const root = document.getElementById('root');
      root.innerHTML = '';

      // 获取组件（根据 webpack 配置的 library 名称）
      const ComponentLibrary = window[componentName + 'FormPlugin'];
      
      if (!ComponentLibrary) {
        console.error('组件未找到:', componentName);
        return;
      }

      const Component = ComponentLibrary.default || ComponentLibrary;
      
      // 使用 React 渲染
      const container = document.createElement('div');
      root.appendChild(container);
      
      ReactDOM.render(
        React.createElement(Component, {
          onSubmit: (values) => {
            console.log('表单提交:', values);
            alert('表单数据: ' + JSON.stringify(values, null, 2));
          },
          locale: 'zh'
        }),
        container
      );
    }

    // 切换到 ESM 模式
    function switchToESM() {
      window.location.href = '/esm.html' + window.location.search;
    }

    // 初始化
    window.addEventListener('DOMContentLoaded', () => {
      const componentName = getComponentName();
      document.getElementById('componentSelect').value = componentName;
      loadComponent();
    });

    // 监听选择器变化
    document.getElementById('componentSelect').addEventListener('change', loadComponent);
  </script>
</body>
</html>
```

### 3.6 创建 ESM 加载测试页面

创建 `packages/app-spa/public/esm.html`：

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ESM 组件测试</title>
  <link rel="stylesheet" href="https://unpkg.com/antd@5/dist/reset.css">
  
  <style>
    body {
      margin: 20px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    .component-selector {
      margin-bottom: 20px;
      padding: 15px;
      background: #f5f5f5;
      border-radius: 4px;
    }
    .component-selector select {
      padding: 8px 12px;
      font-size: 14px;
      border: 1px solid #d9d9d9;
      border-radius: 4px;
      margin-right: 10px;
    }
    .component-selector button {
      padding: 8px 16px;
      background: #1890ff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    #root {
      max-width: 600px;
      margin: 0 auto;
    }
  </style>
</head>
<body>
  <div class="component-selector">
    <label>选择组件：</label>
    <select id="componentSelect">
      <option value="UserProfileForm">UserProfileForm</option>
    </select>
    <button onclick="loadComponent()">加载组件</button>
    <button onclick="switchToUMD()">切换到 UMD 模式</button>
  </div>
  
  <div id="root"></div>

  <script type="module">
    import React from 'https://esm.sh/react@18';
    import ReactDOM from 'https://esm.sh/react-dom@18/client';
    import { createRoot } from 'https://esm.sh/react-dom@18/client';

    // 组件配置
    const COMPONENTS = {
      UserProfileForm: {
        esmPath: '/dist/UserProfileForm.esm.js',
      }
    };

    // 从 URL 参数获取组件名
    function getComponentName() {
      const params = new URLSearchParams(window.location.search);
      return params.get('component') || 'UserProfileForm';
    }

    // 加载组件
    window.loadComponent = async function() {
      const componentName = document.getElementById('componentSelect').value;
      const componentConfig = COMPONENTS[componentName];
      
      if (!componentConfig) {
        console.error('组件不存在:', componentName);
        return;
      }

      try {
        // 动态导入 ESM 模块
        const module = await import(componentConfig.esmPath);
        const Component = module.default;
        
        // 渲染组件
        const root = document.getElementById('root');
        root.innerHTML = '';
        
        const reactRoot = createRoot(root);
        reactRoot.render(
          React.createElement(Component, {
            onSubmit: (values) => {
              console.log('表单提交:', values);
              alert('表单数据: ' + JSON.stringify(values, null, 2));
            },
            locale: 'zh'
          })
        );

        // 更新 URL
        window.history.pushState({}, '', `?component=${componentName}`);
      } catch (error) {
        console.error('组件加载失败:', error);
      }
    };

    // 切换到 UMD 模式
    window.switchToUMD = function() {
      window.location.href = '/umd.html' + window.location.search;
    };

    // 初始化
    window.addEventListener('DOMContentLoaded', () => {
      const componentName = getComponentName();
      document.getElementById('componentSelect').value = componentName;
      loadComponent();
    });

    // 监听选择器变化
    document.getElementById('componentSelect').addEventListener('change', loadComponent);
  </script>
</body>
</html>
```

### 3.7 更新 Webpack 配置支持多 HTML

更新 `packages/app-spa/webpack.config.ts`，添加多个 HTML 入口：

```typescript
import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import type { Configuration } from 'webpack';

const config: Configuration = {
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
  },
  module: {
    rules: [
      {
        test: /\.(tsx?|jsx?)$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.less$/,
        use: ['style-loader', 'css-loader', 'less-loader'],
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
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
    static: {
      directory: path.join(__dirname, 'public'),
      publicPath: '/',
    },
  },
};

export default config;
```

### 3.8 创建主入口页面（可选）

创建 `packages/app-spa/public/index.html`：

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>组件调试中心</title>
  <style>
    body {
      margin: 0;
      padding: 40px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: #f0f2f5;
    }
    .container {
      text-align: center;
      background: white;
      padding: 40px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    h1 {
      margin-bottom: 30px;
      color: #1890ff;
    }
    .links {
      display: flex;
      gap: 20px;
      justify-content: center;
    }
    a {
      display: inline-block;
      padding: 12px 24px;
      background: #1890ff;
      color: white;
      text-decoration: none;
      border-radius: 4px;
      transition: background 0.3s;
    }
    a:hover {
      background: #40a9ff;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>组件调试中心</h1>
    <div class="links">
      <a href="/umd.html">UMD 模式测试</a>
      <a href="/esm.html">ESM 模式测试</a>
    </div>
  </div>
</body>
</html>
```

### 3.9 创建 React 应用入口（用于直接引用测试）

创建 `packages/app-spa/src/index.tsx`：

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import App from './App';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <ConfigProvider locale={zhCN}>
      <App />
    </ConfigProvider>
  </React.StrictMode>
);
```

创建 `packages/app-spa/src/App.tsx`：

```typescript
import React, { useState, useEffect } from 'react';
import { Select, Button, Card } from 'antd';
import { getCurrentComponentName, AVAILABLE_COMPONENTS } from './config/component';

// 动态导入组件（ESM 方式）
const App: React.FC = () => {
  const [componentName, setComponentName] = useState(getCurrentComponentName());
  const [Component, setComponent] = useState<React.ComponentType<any> | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadComponent(componentName);
  }, []);

  const loadComponent = async (name: string) => {
    setLoading(true);
    try {
      // 从组件库导入（开发环境）
      const module = await import(`ui-components/src/components/${name}`);
      setComponent(() => module.default);
      setComponentName(name);
      localStorage.setItem('currentComponent', name);
    } catch (error) {
      console.error('加载组件失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleComponentChange = (value: string) => {
    loadComponent(value);
  };

  return (
    <div style={{ padding: '20px' }}>
      <Card>
        <div style={{ marginBottom: '20px' }}>
          <Select
            value={componentName}
            style={{ width: 200, marginRight: '10px' }}
            onChange={handleComponentChange}
            loading={loading}
          >
            {AVAILABLE_COMPONENTS.map(comp => (
              <Select.Option key={comp.name} value={comp.name}>
                {comp.name}
              </Select.Option>
            ))}
          </Select>
          <Button onClick={() => window.open('/umd.html', '_blank')}>
            打开 UMD 测试页
          </Button>
          <Button onClick={() => window.open('/esm.html', '_blank')}>
            打开 ESM 测试页
          </Button>
        </div>
        
        {Component && (
          <Card title={`组件: ${componentName}`}>
            <Component
              onSubmit={(values: any) => {
                console.log('表单提交:', values);
                alert('表单数据: ' + JSON.stringify(values, null, 2));
              }}
              locale="zh"
            />
          </Card>
        )}
      </Card>
    </div>
  );
};

export default App;
```

### 3.10 安装依赖并启动

```bash
cd ../..
yarn install
cd packages/app-spa
yarn dev
```

访问：
- `http://localhost:3000/umd.html` - UMD 模式测试
- `http://localhost:3000/esm.html` - ESM 模式测试
- `http://localhost:3000/index.html` - React 应用入口

### 3.11 快速切换组件

在 UMD 或 ESM 页面中：
1. 通过下拉选择器选择组件
2. 或通过 URL 参数：`?component=UserProfileForm`
3. 组件名会自动保存到 localStorage

---

**第三步完成，请保存后继续下一步**

## 4. 文档站点搭建

### 4.1 初始化文档站点项目

进入 `packages/docs-site` 目录，创建 `package.json`：

```bash
cd packages/docs-site
npm init -y
```

编辑 `package.json`：

```json
{
  "name": "docs-site",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "storybook dev -p 6006",
    "build": "storybook build",
    "build:docs": "node scripts/generate-docs.js",
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "antd": "^5.12.0",
    "ui-components": "workspace:*"
  },
  "devDependencies": {
    "@storybook/addon-essentials": "^7.6.0",
    "@storybook/addon-interactions": "^7.6.0",
    "@storybook/addon-links": "^7.6.0",
    "@storybook/blocks": "^7.6.0",
    "@storybook/react": "^7.6.0",
    "@storybook/react-webpack5": "^7.6.0",
    "@storybook/test": "^7.6.0",
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "react-docgen-typescript": "^2.2.2",
    "storybook": "^7.6.0",
    "typescript": "^5.3.0"
  }
}
```

### 4.2 初始化 Storybook

```bash
cd packages/docs-site
npx storybook@latest init --yes
```

或手动创建 Storybook 配置。

### 4.3 配置 Storybook

创建 `.storybook/main.ts`：

```typescript
import type { StorybookConfig } from '@storybook/react-webpack5';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx|mdx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
  ],
  framework: {
    name: '@storybook/react-webpack5',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
  typescript: {
    check: false,
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      propFilter: (prop) => (prop.parent ? !/node_modules/.test(prop.parent.fileName) : true),
    },
  },
};

export default config;
```

创建 `.storybook/preview.ts`：

```typescript
import type { Preview } from '@storybook/react';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    docs: {
      toc: true,
    },
  },
  decorators: [
    (Story) => (
      <ConfigProvider locale={zhCN}>
        <Story />
      </ConfigProvider>
    ),
  ],
};

export default preview;
```

### 4.4 创建文档生成脚本

创建 `packages/docs-site/scripts/generate-docs.js`：

```javascript
const fs = require('fs');
const path = require('path');
const { parse } = require('react-docgen-typescript');

// 组件库路径
const COMPONENTS_DIR = path.resolve(__dirname, '../../ui-components/src/components');
const OUTPUT_DIR = path.resolve(__dirname, '../docs');

// 确保输出目录存在
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// 读取组件目录
function getComponents() {
  const components = [];
  const dirs = fs.readdirSync(COMPONENTS_DIR);
  
  dirs.forEach(dir => {
    const componentPath = path.join(COMPONENTS_DIR, dir);
    const stat = fs.statSync(componentPath);
    
    if (stat.isDirectory()) {
      const indexPath = path.join(componentPath, 'pages', 'index.tsx');
      if (fs.existsSync(indexPath)) {
        components.push({
          name: dir,
          path: indexPath,
        });
      }
    }
  });
  
  return components;
}

// 生成 Props 表格
function generatePropsTable(props) {
  if (!props || Object.keys(props).length === 0) {
    return '无 Props';
  }
  
  let table = '| 属性名 | 类型 | 必填 | 默认值 | 说明 |\n';
  table += '|--------|------|------|--------|------|\n';
  
  Object.keys(props).forEach(propName => {
    const prop = props[propName];
    const required = prop.required ? '是' : '否';
    const defaultValue = prop.defaultValue ? prop.defaultValue.value : '-';
    const description = prop.description || '-';
    const type = prop.type.name || '-';
    
    table += `| ${propName} | ${type} | ${required} | ${defaultValue} | ${description} |\n`;
  });
  
  return table;
}

// 生成组件文档
function generateComponentDoc(component) {
  try {
    const parser = parse(component.path, {
      shouldExtractLiteralValuesFromEnum: true,
      propFilter: (prop) => {
        if (prop.parent) {
          return !prop.parent.fileName.includes('node_modules');
        }
        return true;
      },
    });
    
    if (parser.length === 0) {
      console.warn(`无法解析组件: ${component.name}`);
      return null;
    }
    
    const componentInfo = parser[0];
    const propsTable = generatePropsTable(componentInfo.props);
    
    // 读取 README.md（如果存在）
    const readmePath = path.join(COMPONENTS_DIR, component.name, 'README.md');
    let readmeContent = '';
    if (fs.existsSync(readmePath)) {
      readmeContent = fs.readFileSync(readmePath, 'utf-8');
    }
    
    // 读取 CODE_TEMPLATE.md（如果存在）
    const templatePath = path.join(COMPONENTS_DIR, component.name, 'CODE_TEMPLATE.md');
    let templateContent = '';
    if (fs.existsSync(templatePath)) {
      templateContent = fs.readFileSync(templatePath, 'utf-8');
    }
    
    const doc = `# ${component.name}

${componentInfo.description || ''}

## Props

${propsTable}

## 使用示例

\`\`\`tsx
import { ${component.name} } from 'ui-components';

<${component.name}
  // 添加你的 props
/>
\`\`\`

${readmeContent ? `## 产品文档\n\n${readmeContent}\n` : ''}

${templateContent ? `## 代码范式\n\n${templateContent}\n` : ''}
`;
    
    return doc;
  } catch (error) {
    console.error(`生成文档失败 ${component.name}:`, error);
    return null;
  }
}

// 生成索引文档
function generateIndexDoc(components) {
  let index = `# 组件库文档

## 组件列表

`;
  
  components.forEach(component => {
    index += `- [${component.name}](./${component.name}.md)\n`;
  });
  
  return index;
}

// 主函数
function main() {
  console.log('开始生成文档...');
  
  const components = getComponents();
  console.log(`找到 ${components.length} 个组件`);
  
  // 生成每个组件的文档
  components.forEach(component => {
    const doc = generateComponentDoc(component);
    if (doc) {
      const outputPath = path.join(OUTPUT_DIR, `${component.name}.md`);
      fs.writeFileSync(outputPath, doc, 'utf-8');
      console.log(`✓ 生成文档: ${component.name}.md`);
    }
  });
  
  // 生成索引
  const indexDoc = generateIndexDoc(components);
  fs.writeFileSync(path.join(OUTPUT_DIR, 'README.md'), indexDoc, 'utf-8');
  console.log('✓ 生成索引文档');
  
  console.log('文档生成完成！');
}

main();
```

### 4.5 创建 Storybook Stories

创建 `packages/docs-site/src/stories/UserProfileForm.stories.tsx`：

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import UserProfileForm from 'ui-components/src/components/UserProfileForm';

const meta: Meta<typeof UserProfileForm> = {
  title: 'Forms/UserProfileForm',
  component: UserProfileForm,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: '用户资料表单组件，用于收集和编辑用户基本信息。',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    onSubmit: {
      description: '表单提交回调函数',
      action: 'submitted',
    },
    locale: {
      description: '语言设置',
      control: 'select',
      options: ['zh', 'en'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof UserProfileForm>;

export const Default: Story = {
  args: {
    locale: 'zh',
    onSubmit: (values) => {
      console.log('表单数据:', values);
    },
  },
};

export const English: Story = {
  args: {
    locale: 'en',
    onSubmit: (values) => {
      console.log('Form data:', values);
    },
  },
};
```

### 4.6 创建自动生成 Stories 脚本

创建 `packages/docs-site/scripts/generate-stories.js`：

```javascript
const fs = require('fs');
const path = require('path');

const COMPONENTS_DIR = path.resolve(__dirname, '../../ui-components/src/components');
const STORIES_DIR = path.resolve(__dirname, '../src/stories');

// 确保 stories 目录存在
if (!fs.existsSync(STORIES_DIR)) {
  fs.mkdirSync(STORIES_DIR, { recursive: true });
}

// 获取所有组件
function getComponents() {
  const components = [];
  const dirs = fs.readdirSync(COMPONENTS_DIR);
  
  dirs.forEach(dir => {
    const componentPath = path.join(COMPONENTS_DIR, dir);
    const stat = fs.statSync(componentPath);
    
    if (stat.isDirectory()) {
      const indexPath = path.join(componentPath, 'index.ts');
      if (fs.existsSync(indexPath)) {
        components.push(dir);
      }
    }
  });
  
  return components;
}

// 生成 Story 文件内容
function generateStoryContent(componentName) {
  return `import type { Meta, StoryObj } from '@storybook/react';
import ${componentName} from 'ui-components/src/components/${componentName}';

const meta: Meta<typeof ${componentName}> = {
  title: 'Forms/${componentName}',
  component: ${componentName},
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: '${componentName} 组件文档',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    onSubmit: {
      description: '表单提交回调函数',
      action: 'submitted',
    },
    locale: {
      description: '语言设置',
      control: 'select',
      options: ['zh', 'en'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof ${componentName}>;

export const Default: Story = {
  args: {
    locale: 'zh',
    onSubmit: (values) => {
      console.log('表单数据:', values);
    },
  },
};

export const English: Story = {
  args: {
    locale: 'en',
    onSubmit: (values) => {
      console.log('Form data:', values);
    },
  },
};
`;
}

// 主函数
function main() {
  console.log('开始生成 Stories...');
  
  const components = getComponents();
  console.log(`找到 ${components.length} 个组件`);
  
  components.forEach(componentName => {
    const storyPath = path.join(STORIES_DIR, `${componentName}.stories.tsx`);
    const content = generateStoryContent(componentName);
    fs.writeFileSync(storyPath, content, 'utf-8');
    console.log(`✓ 生成 Story: ${componentName}.stories.tsx`);
  });
  
  console.log('Stories 生成完成！');
}

main();
```

### 4.7 更新 package.json 脚本

在 `packages/docs-site/package.json` 中添加：

```json
{
  "scripts": {
    "generate:docs": "node scripts/generate-docs.js",
    "generate:stories": "node scripts/generate-stories.js",
    "prepare:docs": "npm run generate:docs && npm run generate:stories"
  }
}
```

### 4.8 创建文档查看页面（可选）

创建 `packages/docs-site/src/App.tsx`：

```typescript
import React from 'react';
import { Layout, Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';

const { Header, Content, Sider } = Layout;

const App: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ color: 'white' }}>
        <h1>组件库文档</h1>
      </Header>
      <Layout>
        <Sider width={200}>
          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            items={[
              { key: '/', label: '首页' },
              { key: '/components', label: '组件列表' },
            ]}
            onClick={({ key }) => navigate(key)}
          />
        </Sider>
        <Content style={{ padding: '24px' }}>
          {/* 这里可以集成生成的 Markdown 文档 */}
        </Content>
      </Layout>
    </Layout>
  );
};

export default App;
```

### 4.9 安装依赖并启动

```bash
cd ../..
yarn install
cd packages/docs-site
yarn prepare:docs  # 生成文档和 Stories
yarn dev            # 启动 Storybook
```

访问 `http://localhost:6006` 查看文档。

### 4.10 使用说明

1. **生成文档**：运行 `yarn generate:docs` 从 TypeScript 类型文件生成 Markdown 文档
2. **生成 Stories**：运行 `yarn generate:stories` 自动生成 Storybook Stories
3. **查看文档**：运行 `yarn dev` 启动 Storybook 查看交互式文档
4. **构建文档**：运行 `yarn build` 构建静态文档站点

---

**第四步完成，请保存后继续下一步**

## 5. 代码规范配置

### 5.1 安装依赖

在根目录安装代码规范相关依赖：

```bash
cd ../..
yarn add -D -W \
  eslint \
  @typescript-eslint/parser \
  @typescript-eslint/eslint-plugin \
  eslint-plugin-react \
  eslint-plugin-react-hooks \
  prettier \
  eslint-config-prettier \
  eslint-plugin-prettier \
  husky \
  @commitlint/cli \
  @commitlint/config-conventional \
  lint-staged
```

### 5.2 配置 ESLint

创建根目录 `.eslintrc.js`：

```javascript
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  env: {
    browser: true,
    node: true,
    es6: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:prettier/recommended',
  ],
  plugins: ['@typescript-eslint', 'react', 'react-hooks', 'prettier'],
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    'prettier/prettier': 'error',
  },
  ignorePatterns: ['dist', 'node_modules', '*.config.js'],
};
```

创建 `.eslintignore`：

```
node_modules
dist
build
coverage
*.config.js
*.config.ts
```

### 5.3 配置 Prettier

创建根目录 `.prettierrc`：

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "avoid",
  "endOfLine": "lf",
  "bracketSpacing": true,
  "jsxSingleQuote": false
}
```

创建 `.prettierignore`：

```
node_modules
dist
build
coverage
*.log
.DS_Store
package-lock.json
yarn.lock
```

### 5.4 配置 TypeScript（根目录）

创建根目录 `tsconfig.json`：

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "module": "ESNext",
    "moduleResolution": "node",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true
  },
  "exclude": ["node_modules", "dist"]
}
```

### 5.5 配置 Husky

初始化 Husky：

```bash
npx husky install
```

创建 pre-commit hook：

```bash
npx husky add .husky/pre-commit "npx lint-staged"
```

创建 commit-msg hook：

```bash
npx husky add .husky/commit-msg "npx --no -- commitlint --edit \$1"
```

### 5.6 配置 lint-staged

在根目录 `package.json` 中添加：

```json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{js,jsx,json,md}": [
      "prettier --write"
    ]
  }
}
```

### 5.7 配置 Commitlint

创建 `commitlint.config.js`：

```javascript
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',     // 新功能
        'fix',      // 修复 bug
        'docs',     // 文档变更
        'style',    // 代码格式（不影响代码运行的变动）
        'refactor', // 重构（既不是新增功能，也不是修复 bug）
        'perf',     // 性能优化
        'test',     // 增加测试
        'chore',    // 构建过程或辅助工具的变动
        'revert',   // 回滚
        'build',    // 打包
      ],
    ],
    'subject-case': [0],
  },
};
```

### 5.8 更新根目录 package.json

添加脚本和配置：

```json
{
  "name": "backstage-form-monorepo",
  "private": true,
  "workspaces": [
    "packages/*"
  ],
  "scripts": {
    "build:components": "yarn workspace ui-components build",
    "dev:spa": "yarn workspace app-spa dev",
    "dev:docs": "yarn workspace docs-site dev",
    "lint": "eslint . --ext .ts,.tsx",
    "lint:fix": "eslint . --ext .ts,.tsx --fix",
    "format": "prettier --write \"**/*.{ts,tsx,js,jsx,json,md}\"",
    "format:check": "prettier --check \"**/*.{ts,tsx,js,jsx,json,md}\"",
    "prepare": "husky install"
  },
  "devDependencies": {
    "@commitlint/cli": "^18.4.0",
    "@commitlint/config-conventional": "^18.4.0",
    "@typescript-eslint/eslint-plugin": "^6.13.0",
    "@typescript-eslint/parser": "^6.13.0",
    "eslint": "^8.54.0",
    "eslint-config-prettier": "^9.0.0",
    "eslint-plugin-prettier": "^5.0.1",
    "eslint-plugin-react": "^7.33.2",
    "eslint-plugin-react-hooks": "^4.6.0",
    "husky": "^8.0.3",
    "lint-staged": "^15.1.0",
    "prettier": "^3.1.0",
    "typescript": "^5.3.0"
  }
}
```

### 5.9 配置各包的 TypeScript

#### 5.9.1 组件库 TypeScript 配置

更新 `packages/ui-components/tsconfig.json`：

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": true,
    "declarationMap": true,
    "noEmit": false
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.stories.tsx", "**/*.test.tsx"]
}
```

#### 5.9.2 SPA TypeScript 配置

更新 `packages/app-spa/tsconfig.json`：

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "noEmit": false
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

#### 5.9.3 文档站点 TypeScript 配置

更新 `packages/docs-site/tsconfig.json`：

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "noEmit": false
  },
  "include": ["src/**/*", ".storybook/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### 5.10 创建 EditorConfig（可选）

创建 `.editorconfig`：

```ini
root = true

[*]
charset = utf-8
end_of_line = lf
indent_style = space
indent_size = 2
insert_final_newline = true
trim_trailing_whitespace = true

[*.md]
trim_trailing_whitespace = false
```

### 5.11 创建 VS Code 配置（可选）

创建 `.vscode/settings.json`：

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[json]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

创建 `.vscode/extensions.json`：

```json
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-typescript-next"
  ]
}
```

### 5.12 测试代码规范

运行以下命令测试配置：

```bash
# 检查代码格式
yarn format:check

# 自动修复 ESLint 问题
yarn lint:fix

# 格式化代码
yarn format

# 测试提交信息格式
echo "feat: 添加新功能" | npx commitlint
```

### 5.13 提交信息规范说明

提交信息格式：`<type>(<scope>): <subject>`

**类型 (type)**：
- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档变更
- `style`: 代码格式（不影响代码运行）
- `refactor`: 重构
- `perf`: 性能优化
- `test`: 增加测试
- `chore`: 构建过程或辅助工具的变动
- `revert`: 回滚

**示例**：
```
feat(ui-components): 添加 UserProfileForm 组件
fix(app-spa): 修复组件加载问题
docs: 更新 README 文档
style: 格式化代码
```

### 5.14 验证配置

1. **测试 ESLint**：
```bash
yarn lint
```

2. **测试 Prettier**：
```bash
yarn format:check
```

3. **测试 Git Hooks**：
```bash
# 创建一个测试提交
git add .
git commit -m "test: 测试提交规范"
# 如果提交信息格式不正确，会被拦截
```

---

**第五步完成，请保存后继续下一步**

## 6. Monorepo 管理工具配置

本项目支持两种 Monorepo 管理工具：**Lerna** 和 **Nx**。你可以根据项目需求选择其中一种。

---

## 方案 A: 使用 Lerna

### 6.1 安装 Lerna

```bash
yarn add -D -W lerna
```

### 6.2 初始化 Lerna

```bash
npx lerna init
```

这会创建 `lerna.json` 配置文件。

### 6.3 配置 Lerna

编辑 `lerna.json`：

```json
{
  "version": "independent",
  "npmClient": "yarn",
  "useWorkspaces": true,
  "command": {
    "publish": {
      "conventionalCommits": true,
      "message": "chore(release): publish",
      "ignoreChanges": [
        "*.md",
        "*.test.ts",
        "*.test.tsx",
        ".eslintrc.js",
        ".prettierrc"
      ]
    },
    "version": {
      "allowBranch": ["main", "master"],
      "conventionalCommits": true
    }
  },
  "packages": ["packages/*"]
}
```

### 6.4 更新根目录 package.json

添加 Lerna 相关脚本：

```json
{
  "scripts": {
    "lerna:version": "lerna version",
    "lerna:publish": "lerna publish",
    "lerna:bootstrap": "lerna bootstrap",
    "lerna:clean": "lerna clean",
    "lerna:changed": "lerna changed",
    "lerna:diff": "lerna diff",
    "lerna:exec": "lerna exec",
    "lerna:run": "lerna run"
  }
}
```

### 6.5 Lerna 常用命令

```bash
# 查看变更的包
yarn lerna:changed

# 运行所有包的构建命令
yarn lerna:run build

# 在特定包中执行命令
yarn lerna:exec --scope=ui-components -- yarn build

# 版本管理（独立版本）
yarn lerna:version

# 发布包
yarn lerna:publish
```

### 6.6 配置包之间的依赖

在 `packages/app-spa/package.json` 中，依赖组件库：

```json
{
  "dependencies": {
    "ui-components": "workspace:*"
  }
}
```

Lerna 会自动处理 workspace 依赖。

---

## 方案 B: 使用 Nx

### 6.1 安装 Nx

```bash
yarn add -D -W nx @nrwl/workspace
```

### 6.2 初始化 Nx

```bash
npx nx init
```

### 6.3 创建 nx.json

创建 `nx.json`：

```json
{
  "extends": "nx/presets/npm.json",
  "tasksRunnerOptions": {
    "default": {
      "runner": "nx/tasks-runners/default",
      "options": {
        "cacheableOperations": ["build", "lint", "test"]
      }
    }
  },
  "targetDefaults": {
    "build": {
      "dependsOn": ["^build"],
      "inputs": ["production", "^production"]
    },
    "lint": {
      "inputs": ["default", "{workspaceRoot}/.eslintrc.js"]
    }
  },
  "namedInputs": {
    "default": ["{projectRoot}/**/*", "sharedGlobals"],
    "production": [
      "default",
      "!{projectRoot}/**/?(*.)+(spec|test).[jt]s?(x)?(.snap)",
      "!{projectRoot}/tsconfig.spec.json",
      "!{projectRoot}/.eslintrc.js",
      "!{projectRoot}/jest.config.[jt]s",
      "!{projectRoot}/src/test-setup.[jt]s",
      "!{projectRoot}/test-setup.[jt]s"
    ],
    "sharedGlobals": []
  }
}
```

### 6.4 创建项目配置

在根目录创建 `nx-workspace.json` 或使用 `project.json` 文件。

为每个包创建 `project.json`：

#### `packages/ui-components/project.json`

```json
{
  "name": "ui-components",
  "sourceRoot": "packages/ui-components/src",
  "projectType": "library",
  "targets": {
    "build": {
      "executor": "nx:run-commands",
      "options": {
        "command": "yarn build",
        "cwd": "packages/ui-components"
      }
    },
    "lint": {
      "executor": "@nrwl/linter:eslint",
      "options": {
        "lintFilePatterns": ["packages/ui-components/**/*.{ts,tsx}"]
      }
    }
  },
  "tags": ["type:lib"]
}
```

#### `packages/app-spa/project.json`

```json
{
  "name": "app-spa",
  "sourceRoot": "packages/app-spa/src",
  "projectType": "application",
  "targets": {
    "dev": {
      "executor": "nx:run-commands",
      "options": {
        "command": "yarn dev",
        "cwd": "packages/app-spa"
      }
    },
    "build": {
      "executor": "nx:run-commands",
      "options": {
        "command": "yarn build",
        "cwd": "packages/app-spa"
      },
      "dependsOn": ["^build"]
    },
    "lint": {
      "executor": "@nrwl/linter:eslint",
      "options": {
        "lintFilePatterns": ["packages/app-spa/**/*.{ts,tsx}"]
      }
    }
  },
  "tags": ["type:app"]
}
```

#### `packages/docs-site/project.json`

```json
{
  "name": "docs-site",
  "sourceRoot": "packages/docs-site/src",
  "projectType": "application",
  "targets": {
    "dev": {
      "executor": "nx:run-commands",
      "options": {
        "command": "yarn dev",
        "cwd": "packages/docs-site"
      }
    },
    "build": {
      "executor": "nx:run-commands",
      "options": {
        "command": "yarn build",
        "cwd": "packages/docs-site"
      }
    },
    "lint": {
      "executor": "@nrwl/linter:eslint",
      "options": {
        "lintFilePatterns": ["packages/docs-site/**/*.{ts,tsx}"]
      }
    }
  },
  "tags": ["type:app"]
}
```

### 6.5 更新根目录 package.json

添加 Nx 相关脚本：

```json
{
  "scripts": {
    "nx:graph": "nx graph",
    "nx:affected": "nx affected",
    "nx:run-many": "nx run-many",
    "build:all": "nx run-many --target=build --all",
    "lint:all": "nx run-many --target=lint --all",
    "test:all": "nx run-many --target=test --all"
  }
}
```

### 6.6 Nx 常用命令

```bash
# 查看项目依赖图
yarn nx:graph

# 运行受影响的项目
yarn nx:affected --target=build

# 运行所有项目的构建
yarn build:all

# 运行特定项目的命令
nx build ui-components
nx dev app-spa

# 查看项目信息
nx show project ui-components
```

### 6.7 配置 Nx 缓存

Nx 会自动缓存构建结果，提高构建速度。缓存存储在 `.nx/cache` 目录。

---

## 方案对比

### Lerna 优势
- ✅ 简单易用，配置少
- ✅ 专注于版本管理和发布
- ✅ 与 npm/yarn workspaces 集成良好
- ✅ 适合简单的 monorepo 场景

### Nx 优势
- ✅ 强大的任务调度和缓存机制
- ✅ 依赖图可视化
- ✅ 只构建受影响的项目（affected）
- ✅ 支持更复杂的构建管道
- ✅ 更好的开发体验

### 推荐选择

- **小型项目或简单场景**：选择 **Lerna**
- **大型项目或需要复杂构建**：选择 **Nx**

---

## 6.8 统一脚本配置（推荐）

无论使用哪种工具，都可以在根目录 `package.json` 中统一管理脚本：

```json
{
  "scripts": {
    "build": "yarn workspace ui-components build",
    "build:all": "yarn workspaces run build",
    "dev:spa": "yarn workspace app-spa dev",
    "dev:docs": "yarn workspace docs-site dev",
    "clean": "yarn workspaces run clean",
    "lint": "yarn workspaces run lint",
    "lint:fix": "yarn workspaces run lint:fix",
    "format": "prettier --write \"**/*.{ts,tsx,js,jsx,json,md}\"",
    "format:check": "prettier --check \"**/*.{ts,tsx,js,jsx,json,md}\""
  }
}
```

### 6.9 各包添加统一脚本

在每个包的 `package.json` 中添加：

```json
{
  "scripts": {
    "clean": "rm -rf dist",
    "lint": "eslint src --ext .ts,.tsx",
    "lint:fix": "eslint src --ext .ts,.tsx --fix"
  }
}
```

---

**第六步完成，文档创建完毕！**

## 总结

完成以上所有步骤后，你将拥有一个完整的 Monorepo 项目，包含：

1. ✅ **组件库**：支持 UMD 和 ESM 格式，独立打包
2. ✅ **SPA 调试环境**：支持 UMD 和 ESM 两种加载方式测试
3. ✅ **文档站点**：自动从 TypeScript 类型生成文档
4. ✅ **代码规范**：ESLint + Prettier + Husky + Commitlint
5. ✅ **Monorepo 管理**：Lerna 或 Nx 管理多包项目

## 下一步

1. 按照文档逐步执行每个步骤
2. 根据实际需求调整配置
3. 开始开发你的组件库！

祝开发顺利！🎉

---

## 7. 项目结构总览

### 7.1 完整目录结构

```
backstage-form-monorepo/
├── packages/
│   ├── ui-components/          # 组件库
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── UserProfileForm/
│   │   │   │   │   ├── index.ts              # 统一导出
│   │   │   │   │   ├── pages/
│   │   │   │   │   │   └── index.tsx          # 表单主逻辑
│   │   │   │   │   ├── config/
│   │   │   │   │   │   └── index.ts           # 组件元信息
│   │   │   │   │   ├── i18n/
│   │   │   │   │   │   ├── index.ts           # 多语言入口
│   │   │   │   │   │   ├── zh.ts              # 中文
│   │   │   │   │   │   └── en.ts              # 英文
│   │   │   │   │   ├── data/
│   │   │   │   │   │   └── index.ts           # 静态数据
│   │   │   │   │   ├── utils/
│   │   │   │   │   │   └── index.ts           # 工具函数
│   │   │   │   │   ├── README.md              # 产品文档
│   │   │   │   │   └── CODE_TEMPLATE.md       # 代码范式
│   │   │   │   └── ...                        # 其他组件
│   │   │   └── index.ts                       # 组件库统一导出
│   │   ├── dist/                              # 构建产物
│   │   │   ├── UserProfileForm.umd.js         # UMD 格式
│   │   │   ├── UserProfileForm.esm.js         # ESM 格式
│   │   │   └── ...
│   │   ├── webpack.config.ts                  # Webpack 配置
│   │   ├── tsconfig.json                      # TypeScript 配置
│   │   └── package.json
│   │
│   ├── app-spa/                               # SPA 调试环境
│   │   ├── src/
│   │   │   ├── index.tsx                      # 入口文件
│   │   │   ├── App.tsx                        # 主应用
│   │   │   └── config/
│   │   │       └── component.ts               # 组件配置
│   │   ├── public/
│   │   │   ├── index.html                     # 主页面
│   │   │   ├── umd.html                       # UMD 测试页
│   │   │   └── esm.html                       # ESM 测试页
│   │   ├── webpack.config.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   └── docs-site/                             # 文档站点
│       ├── src/
│       │   └── stories/                       # Storybook Stories
│       ├── scripts/
│       │   ├── generate-docs.js               # 文档生成脚本
│       │   └── generate-stories.js            # Stories 生成脚本
│       ├── docs/                               # 生成的文档
│       ├── .storybook/                         # Storybook 配置
│       └── package.json
│
├── .husky/                                    # Git Hooks
│   ├── pre-commit
│   └── commit-msg
│
├── .vscode/                                    # VS Code 配置
│   ├── settings.json
│   └── extensions.json
│
├── .eslintrc.js                               # ESLint 配置
├── .prettierrc                                # Prettier 配置
├── .editorconfig                              # EditorConfig
├── commitlint.config.js                       # Commitlint 配置
├── tsconfig.json                              # 根 TypeScript 配置
├── lerna.json                                 # Lerna 配置（可选）
├── nx.json                                    # Nx 配置（可选）
└── package.json                               # 根 package.json
```

### 7.2 关键文件说明

| 文件/目录 | 说明 |
|----------|------|
| `packages/ui-components/` | 组件库源码，每个组件独立打包 |
| `packages/ui-components/dist/` | 构建产物，包含 UMD 和 ESM 格式 |
| `packages/app-spa/public/umd.html` | UMD 格式组件测试页面 |
| `packages/app-spa/public/esm.html` | ESM 格式组件测试页面 |
| `packages/docs-site/docs/` | 自动生成的 Markdown 文档 |
| `.husky/` | Git Hooks 配置目录 |
| `lerna.json` / `nx.json` | Monorepo 管理工具配置 |

---

## 8. 快速开始指南

### 8.1 环境要求

- Node.js >= 16.x
- Yarn >= 1.22.x 或 npm >= 8.x
- Git

### 8.2 初始化项目（快速版）

```bash
# 1. 创建项目目录
mkdir backstage-form-monorepo && cd backstage-form-monorepo

# 2. 初始化 Git
git init

# 3. 初始化 package.json
npm init -y

# 4. 安装 Yarn（如果未安装）
npm install -g yarn

# 5. 按照文档步骤 1-6 逐步执行
```

### 8.3 开发工作流

#### 创建新组件

```bash
# 1. 在 packages/ui-components/src/components/ 下创建组件目录
mkdir -p packages/ui-components/src/components/NewForm/{pages,config,i18n,data,utils}

# 2. 按照组件结构模板创建文件
# 3. 在 packages/ui-components/src/index.ts 中导出
# 4. 构建组件
yarn build:components

# 5. 在 SPA 中测试
yarn dev:spa
```

#### 开发调试流程

```bash
# 1. 启动组件库构建（watch 模式，如果配置了）
yarn workspace ui-components build:watch

# 2. 启动 SPA 调试环境
yarn dev:spa

# 3. 访问 http://localhost:3000/umd.html 或 /esm.html
# 4. 通过下拉选择器或 URL 参数切换组件测试
```

#### 文档更新流程

```bash
# 1. 更新组件代码和类型定义
# 2. 生成文档
cd packages/docs-site
yarn generate:docs

# 3. 生成 Stories
yarn generate:stories

# 4. 启动 Storybook
yarn dev
```

### 8.4 常用命令速查

```bash
# 构建
yarn build:components          # 构建组件库
yarn build:all                 # 构建所有包

# 开发
yarn dev:spa                   # 启动 SPA 调试环境
yarn dev:docs                  # 启动文档站点

# 代码规范
yarn lint                      # 检查代码
yarn lint:fix                  # 自动修复
yarn format                    # 格式化代码
yarn format:check              # 检查格式

# 清理
yarn clean                     # 清理所有构建产物
```

### 8.5 提交代码流程

```bash
# 1. 添加文件
git add .

# 2. 提交（会自动触发 lint-staged 和 commitlint）
git commit -m "feat(ui-components): 添加新组件"

# 3. 推送
git push
```

---

## 9. 常见问题解答

### 9.1 构建问题

**Q: 构建时提示找不到模块？**

A: 检查以下几点：
1. 确保已运行 `yarn install` 安装所有依赖
2. 检查 `tsconfig.json` 中的路径配置
3. 确认组件导出路径正确

**Q: UMD 格式构建后无法在浏览器中使用？**

A: 确保：
1. 已正确配置 `externals`，React 和 Antd 不被打包
2. 在 HTML 中正确引入了 React、ReactDOM 和 Antd
3. 检查 webpack 的 `library` 配置

### 9.2 依赖问题

**Q: 如何添加新的依赖到组件库？**

A: 
```bash
# 添加到 peerDependencies（如果组件需要）
yarn workspace ui-components add -P package-name

# 添加到 devDependencies（开发工具）
yarn workspace ui-components add -D package-name
```

**Q: 包之间如何相互引用？**

A: 使用 `workspace:*` 协议：
```json
{
  "dependencies": {
    "ui-components": "workspace:*"
  }
}
```

### 9.3 开发环境问题

**Q: SPA 中无法加载组件？**

A: 检查：
1. 组件是否已构建（`yarn build:components`）
2. 组件路径配置是否正确
3. 浏览器控制台是否有错误信息

**Q: 如何快速切换测试的组件？**

A: 两种方式：
1. 在页面下拉选择器中选择
2. 通过 URL 参数：`?component=ComponentName`

### 9.4 代码规范问题

**Q: 提交时被 Husky 拦截？**

A: 
1. 检查 ESLint 错误：`yarn lint:fix`
2. 检查代码格式：`yarn format`
3. 检查提交信息格式是否符合规范

**Q: 如何跳过 Git Hooks？**

A: （不推荐，仅紧急情况）
```bash
git commit --no-verify -m "message"
```

### 9.5 文档问题

**Q: 文档生成失败？**

A: 
1. 确保组件有正确的 TypeScript 类型定义
2. 检查 `react-docgen-typescript` 是否正确安装
3. 查看脚本错误信息，检查组件路径

**Q: Storybook 无法启动？**

A: 
1. 检查 Node.js 版本是否符合要求
2. 删除 `node_modules` 和 `yarn.lock`，重新安装
3. 检查 `.storybook` 配置是否正确

### 9.6 Monorepo 管理问题

**Q: Lerna 和 Nx 可以同时使用吗？**

A: 不推荐，选择其中一种即可。如果项目已经使用 Yarn Workspaces，Lerna 更简单。

**Q: 如何发布组件库？**

A: 
```bash
# 使用 Lerna
yarn lerna:publish

# 或手动发布
cd packages/ui-components
npm publish
```

### 9.7 性能优化

**Q: 构建速度慢怎么办？**

A: 
1. 使用 Nx 的缓存功能
2. 只构建变更的组件
3. 使用 webpack 的缓存配置
4. 考虑使用 esbuild 替代 ts-loader

**Q: 如何减少打包体积？**

A: 
1. 确保 React 和 Antd 配置为 external
2. 使用 Tree Shaking
3. 按需引入 Antd 组件
4. 压缩构建产物

### 9.8 最佳实践建议

1. **组件开发**：
   - 每个组件保持独立，不相互依赖
   - 使用 TypeScript 严格模式
   - 编写清晰的 Props 类型定义

2. **代码组织**：
   - 遵循既定的目录结构
   - 保持代码风格一致
   - 及时更新文档

3. **版本管理**：
   - 使用语义化版本
   - 遵循提交信息规范
   - 及时打 Tag

4. **测试**：
   - 在 SPA 中充分测试组件
   - 测试 UMD 和 ESM 两种格式
   - 测试不同浏览器兼容性

---

## 附录

### A. 组件开发模板

创建新组件时，可以参考以下模板快速开始：

```bash
# 组件目录结构
ComponentName/
├── index.ts              # export { default } from './pages';
├── pages/index.tsx       # 组件主逻辑
├── config/index.ts       # 组件配置
├── i18n/
│   ├── index.ts
│   ├── zh.ts
│   └── en.ts
├── data/index.ts
├── utils/index.ts
├── README.md
└── CODE_TEMPLATE.md
```

### B. 相关资源

- [React 官方文档](https://react.dev/)
- [Ant Design 文档](https://ant.design/)
- [TypeScript 文档](https://www.typescriptlang.org/)
- [Webpack 文档](https://webpack.js.org/)
- [Lerna 文档](https://lerna.js.org/)
- [Nx 文档](https://nx.dev/)
- [Storybook 文档](https://storybook.js.org/)

### C. 技术支持

如遇到问题，可以：
1. 查看项目 Issues
2. 查阅相关工具文档
3. 检查控制台错误信息
4. 使用调试工具排查

---

**文档完！祝开发顺利！** 🚀

