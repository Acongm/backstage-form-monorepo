import React from 'react';
import { Select, Button, Card } from 'antd';
import { AVAILABLE_COMPONENTS } from '../config/component';



// 动态加载组件（UMD 方式）
const Layout: React.FC<{ loading: boolean, componentName: string, onComponentChange: (name: string) => void, children?: React.ReactNode }> = ({ loading, componentName, onComponentChange, children }) => {

  return (
    <div style={{ padding: '20px' }}>
      <Card>
        <div style={{ marginBottom: '20px' }}>
          <Select
            value={componentName}
            style={{ width: 200, marginRight: '10px' }}
            onChange={onComponentChange}
            loading={loading}
          >
            {AVAILABLE_COMPONENTS.map(comp => (
              <Select.Option key={comp.name} value={comp.name}>
                {comp.name}
              </Select.Option>
            ))}
          </Select>
          <Button onClick={() => window.open('/umd.html', '_blank')}>
            打开 UMD 测试页
          </Button>
          <Button onClick={() => window.open('/esm.html', '_blank')}>
            打开 ESM 测试页
          </Button>
        </div>
        {children}
      </Card>
    </div>
  );
};

export default Layout;