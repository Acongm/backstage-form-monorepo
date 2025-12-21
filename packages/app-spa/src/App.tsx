import React, { useState, useEffect } from 'react';
import { Button, Form, Card, } from 'antd';
import Layout from './view/Layout';
// import useFetchUmdJs from './hooks/useFetchUmdJs';
// import useFetchUmdFactoryJs from './hooks/useFetchUmdFactoryJs';
import useFetchEsm from './hooks/useFetchEsm';


// 动态加载组件（UMD 方式）
const App: React.FC = () => {
  const [form] = Form.useForm();
  // const { componentName, Component, loadComponent } = useFetchUmdJs();
  const { loading, componentName, Component, loadComponent } = useFetchEsm();

  const handleSubmit = (values: any) => {
    console.log('表单提交:', values);
    alert('表单数据: ' + JSON.stringify(values, null, 2));
  };
  const handleComponentChange = (value: string) => {
    loadComponent(value);
  };

  useEffect(() => {
    loadComponent(componentName);
  }, []);

  return (
    <Layout
      componentName={componentName}
      onComponentChange={handleComponentChange}
      loading={loading}
    >
      <Form form={form} onFinish={handleSubmit} layout="vertical">
        {Component && (
          <Card title={`组件: ${componentName}`}>
            <Component
              onSubmit={(values: any) => {
                console.log('表单提交:', values);
                alert('表单数据: ' + JSON.stringify(values, null, 2));
              }}
              locale="zh"
            />
            <Form.Item>
              <Button type="primary" htmlType="submit">
                提交
              </Button>
            </Form.Item>
          </Card>
        )}

      </Form>
    </Layout>
  );
};

export default App;