import React, { useState, useEffect } from 'react';
import { Select, Button, Card, Form } from 'antd';
import * as antd from 'antd';
import ReactDOM from 'react-dom';
import { getCurrentComponentName } from '../config/component';

export  const componentUrl = 'http://localhost:8080/umd';

// 准备 runtime 依赖（用于 factory 模式）
export const runtime = {
  React,
  ReactDOM,
  antd,
};

// 确保全局依赖可用（用于 UMD 模式）
if (typeof window !== 'undefined') {
  (window as any).React = React;
  (window as any).ReactDOM = ReactDOM;
  (window as any).antd = antd;
}

const useFetchUmdFactoryJs  =()=>{
   const [componentName, setComponentName] = useState(getCurrentComponentName());
  const [Component, setComponent] = useState<React.ComponentType<any> | null>(null);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleSubmit = (values: any) => {
    console.log('表单提交:', values);
    alert('表单数据: ' + JSON.stringify(values, null, 2));
  };

  useEffect(() => {
    loadComponent(componentName);
  }, []);

  const loadComponent = async (name: string) => {
    setLoading(true);
    try {
      // 方式1: UMD 格式（推荐）- 从全局获取依赖
      const scriptId = `component-${name}`;
      
      // 移除旧的 script 标签
      const oldScript = document.getElementById(scriptId);
      if (oldScript) {
        oldScript.remove();
      }

      // 创建新的 script 标签加载 UMD 组件
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = `${componentUrl}/${name}/index.js`;
      
      await new Promise<void>((resolve, reject) => {
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Failed to load ${name}`));
        document.head.appendChild(script);
      });

      // UMD 模块会挂载到 window[name + 'FormPlugin']
      const globalName = `${name}FormPlugin`;
      const module = (window as any)[globalName];
      
      if (!module) {
        throw new Error(`Component ${globalName} not found on window`);
      }

      // Factory 模式：调用 factory 函数并传入 runtime
      const factory = module.default || module;
      const ComponentClass = factory(runtime);
      
      setComponent(() => ComponentClass);
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


  return {
    loading,
    componentName,
    Component,
    loadComponent,
  }
}

export default useFetchUmdFactoryJs;