# 用户资料表单

## 业务说明
用于用户注册或资料编辑，支持多语言。

## 工单key

- UserAiForm

## 字段定义

| 字段中文 | 字段英文 | key    | 必填 | 类型   | 枚举/规则       |
|----------|----------|--------|------|--------|------------------|
| 姓名     | Name     | name   | 是   | text   | -                |
| 邮箱     | Email    | email  | 是   | email  | 标准邮箱格式     |
| 年龄     | Age      | age    | 否   | number | 0-150            |

## 创建代码模板
```bash
yarn create:form UserAiForm
```
## 代码生成规范

- 组件必须放在 `{{FormName}}/pages/index.tsx` 目录
- 使用 Ant Design 5 Form
- props 必须包含：`lang`, `value`, `onChange`, `staticData`, `disabled`
- 多语言通过 `{{FormName}}/i18n/index.ts` 静态对象实现
- 下拉数据从 `props.staticData` 传入，若未传则用 `{{FormName}}/data/index.ts` 默认值
- utils 函数放 `{{FormName}}/utils/index.ts`，如格式化、校验
- 导出通过 `{{FormName}}/index.ts` 统一管理

## 输出要求
请生成以下文件内容：
- `{{FormName}}/config/index.ts`
- `{{FormName}}/i18n/index.ts`
- `{{FormName}}/i18n/zh.ts`
- `{{FormName}}/i18n/en.ts`
- `{{FormName}}/data/index.ts`
- `{{FormName}}/utils/index.ts`（可选）
- `{{FormName}}/index.ts`
- `{{FormName}}/README.md`