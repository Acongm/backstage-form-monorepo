# Monorepo 项目创建步骤文档

## 目录

1. [项目初始化](#1-项目初始化)
2. [组件库搭建](#2-组件库搭建)
3. [SPA 调试环境搭建](#3-spa-调试环境搭建)
4. [文档站点搭建](#4-文档站点搭建)
5. [代码规范配置](#5-代码规范配置)
6. [Monorepo 管理工具配置](#6-monorepo-管理工具配置)

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

