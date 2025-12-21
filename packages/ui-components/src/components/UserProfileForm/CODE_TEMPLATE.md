# 代码范式

## Props 接口定义

```typescript
interface ComponentProps {
  onSubmit?: (values: any) => void;
  locale?: 'zh' | 'en';
}
```

## 使用示例

```tsx
<UserProfileForm onSubmit={handleSubmit} locale="zh" />
```