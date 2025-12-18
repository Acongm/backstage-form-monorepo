import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { ConfigProvider, Tabs } from 'antd';
import zhCN from 'antd/locale/zh_CN';

// 开发环境直接导入组件
const loadForm = async (formName: string) => {
  if (formName === 'UserProfileForm') {
    const { default: factory } = await import('ui-components/pages/UserProfileForm/UserProfileForm');
    const antd = await import('antd');
    return factory({ React, antd });
  }
  return null;
};

const App = () => {
  const [activeKey, setActiveKey] = useState('user');
  const [components, setComponents] = useState<any>({});

  useEffect(() => {
    const init = async () => {
      const userForm = await loadForm('UserProfileForm');
      setComponents({ user: userForm });
    };
    init();
  }, []);

  const handleSubmit = (values: any) => {
    console.log('表单提交:', values);
    alert('提交成功!');
  };

  return (
    <ConfigProvider locale={zhCN}>
      <div style={{ padding: 20, maxWidth: 800, margin: '0 auto' }}>
        <h1>表单预览</h1>
        <Tabs activeKey={activeKey} onChange={setActiveKey}>
          <Tabs.TabPane tab="用户表单" key="user">
            {components.user ? (
              React.createElement(components.user, { onSubmit: handleSubmit })
            ) : (
              <div>加载中...</div>
            )}
          </Tabs.TabPane>
        </Tabs>
      </div>
    </ConfigProvider>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
