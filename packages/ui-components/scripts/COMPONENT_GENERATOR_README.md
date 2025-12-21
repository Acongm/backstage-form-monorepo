# 组件生成器使用说明

## 功能说明

`generate-component.sh` 脚本用于快速基于 `UserProfileForm` 模板生成新的表单组件。

## 使用方法

### 基本用法

```bash
cd packages/ui-components/script
./generate-component.sh <ComponentName>
```

### 示例

```bash
# 进入脚本目录
cd packages/ui-components/script

# 生成公司信息表单组件
./generate-component.sh CompanyInfoForm

# 生成产品详情组件
./generate-component.sh ProductDetails

# 生成用户设置组件
./generate-component.sh UserSettings
```

## 命名规则

- 组件名称必须使用 **PascalCase** 格式（首字母大写）
- 只能包含字母和数字，不能包含特殊字符
- ✅ 正确示例：`CompanyInfoForm`, `UserSettings`, `ProductCard`
- ❌ 错误示例：`companyInfo`, `company-info`, `Company_Info`

## 脚本功能

脚本会自动完成以下操作：

1. ✅ 复制 `UserProfileForm` 模板目录
2. ✅ 重命名为新的组件名称
3. ✅ 替换所有文件中的 `UserProfileForm` 为新组件名
4. ✅ 更新组件配置信息
5. ✅ 在主 `index.ts` 文件中自动添加导出语句
6. ✅ 删除模板文档文件（CODE_TEMPLATE.md, README.md）

## 生成的组件结构

```
packages/ui-components/src/components/<ComponentName>/
├── config/
│   └── index.ts          # 组件配置
├── data/
│   └── index.ts          # 数据定义
├── i18n/
│   ├── zh.ts             # 中文翻译
│   ├── en.ts             # 英文翻译
│   └── index.ts          # 国际化导出
├── pages/
│   └── index.tsx         # 组件主体
├── utils/
│   └── index.ts          # 工具函数
└── index.ts              # 组件入口（Factory 模式）
```

## 生成后的步骤

组件生成后，需要手动修改以下文件：

### 1. 修改国际化文本

**文件**: `i18n/zh.ts` 和 `i18n/en.ts`

```typescript
// i18n/zh.ts
export default {
  title: '您的标题',
  field1: '字段1',
  field2: '字段2',
  // ...
};
```

### 2. 修改数据定义

**文件**: `data/index.ts`

```typescript
export const yourOptions = [
  { label: '选项1', value: 'option1' },
  { label: '选项2', value: 'option2' },
];
```

### 3. 实现组件逻辑

**文件**: `pages/index.tsx`

根据具体需求实现表单字段和逻辑。

### 4. 添加工具函数

**文件**: `utils/index.ts`

添加组件所需的工具函数。

### 5. 更新组件配置

**文件**: `config/index.ts`

```typescript
export const componentConfig = {
  name: 'YourComponent',
  version: '1.0.0',
  description: '组件描述',
};
```

## 验证

生成组件后，确认以下内容：

1. ✅ 组件目录已创建在 `packages/ui-components/src/components/` 下
2. ✅ 主 `index.ts` 文件中已添加导出语句
3. ✅ 所有文件中的组件名称已正确替换
4. ✅ 可以在其他地方导入使用：`import { ComponentName } from '@your/ui-components'`

## 注意事项

- 如果组件已存在，脚本会报错并退出，避免覆盖现有组件
- 脚本会自动处理 Windows/Linux/macOS 的兼容性问题
- 生成的组件使用 Factory 模式，支持运行时依赖注入

## 故障排除

### 权限问题

如果遇到权限错误：

```bash
cd packages/ui-components/script
chmod +x generate-component.sh
```

### 路径问题

确保在 script 目录下执行脚本：

```bash
cd packages/ui-components/script
./generate-component.sh ComponentName
```

脚本会自动处理相对路径，无需在项目根目录执行。

### 组件已存在

如果提示组件已存在，可以：
1. 使用不同的组件名称
2. 或手动删除现有组件后重新生成

```bash
rm -rf packages/ui-components/src/components/YourComponent
./generate-component.sh YourComponent
```
