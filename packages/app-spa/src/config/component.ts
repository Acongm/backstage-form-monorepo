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
  {
    name: 'DemoPage',
    umdPath: '/dist/DemoPage.umd.js',
    esmPath: '/dist/DemoPage.esm.js',
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