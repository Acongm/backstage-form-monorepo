import Component from './pages';

// Factory 模式：接收 runtime 依赖，返回组件
export default function factory(runtime?: any) {
  // runtime 包含 { React, ReactDOM, antd }
  // 这里可以使用 runtime 中的依赖，但目前组件已经通过 external 处理了
  // 所以直接返回组件即可
  return Component;
}

// 同时导出原始组件（用于非 factory 场景）
export { default as Component } from './pages';
export * from './config';
export * from './i18n';
export * from './data';
export * from './utils';