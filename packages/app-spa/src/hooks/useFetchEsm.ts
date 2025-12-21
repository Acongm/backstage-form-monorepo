import React, { useState, useEffect } from 'react';
import { Form } from 'antd';
import * as antd from 'antd';
import ReactDOM from 'react-dom';
import { getCurrentComponentName } from '../config/component';

export const componentUrl = 'http://localhost:8080/esm';

// 准备 runtime 依赖（用于 factory 模式）
export const runtime = {
  React,
  ReactDOM,
  antd,
};


// 确保全局依赖可用（用于 ESM 模块中的 import）
if (typeof window !== 'undefined') {
  (window as any).React = React;
  (window as any).ReactDOM = ReactDOM;
  (window as any).antd = antd;
}

const useFetchEsm = () => {
  const [componentName, setComponentName] = useState(getCurrentComponentName());
  const [Component, setComponent] = useState<React.ComponentType<any> | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadComponent(componentName);
  }, []);

  const loadComponent = async (name: string) => {
    setLoading(true);
    try {
      // 确保 importmap 已注入（一次即可）
      // if (!document.getElementById('esm-import-map')) {
      //   // ...同上，注入 importmap 指向 /runtime/*.js
      // }

      const moduleUrl = `${componentUrl}/${name}/index.js?t=${Date.now()}`;
      console.log(`Loaded ESM module from ${moduleUrl}`);

      // 直接 import ESM 模块（浏览器会通过 importmap 解析 react/antd）
      const module = await import(/* webpackIgnore: true */ moduleUrl);
      console.log(`Loaded ESM module from ${moduleUrl}`, module);

      const factory = module.default;
      const ComponentClass = factory(runtime);
      if (!ComponentClass) {
        console.log(`Loaded ESM module from !ComponentClass ${ComponentClass}`);
        throw new Error(`ESM module ${name} has no default export`);
      }

      setComponent(() => ComponentClass);
      setComponentName(name);
      localStorage.setItem('currentComponent', name);
    } catch (error) {
      console.error('加载 ESM 组件失败:', error);
    } finally {
      setLoading(false);
    }
  };
  return {
    componentName,
    Component,
    loading,
    loadComponent,
  };
};

export default useFetchEsm;
