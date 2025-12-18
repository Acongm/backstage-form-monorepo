import React from 'react';
import { Form, Input, Button } from 'antd';

export default function createForm(runtime: any) {
  const { Form, Input, Button } = runtime.antd;
  
  return ({ onSubmit }: { onSubmit: (values: any) => void }) => (
    <Form onFinish={onSubmit}>
      <Form.Item name="name" label="姓名" rules={[{ required: true, message: '请输入姓名' }]}>
        <Input />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit">提交</Button>
      </Form.Item>
    </Form>
  );
}
