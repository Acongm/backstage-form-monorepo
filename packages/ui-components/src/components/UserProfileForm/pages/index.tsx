import React from 'react';
import { Form, Input, Button } from 'antd';
import i18n from '../i18n';

interface UserProfileFormProps {
  locale?: 'zh' | 'en';
}

const UserProfileForm: React.FC<UserProfileFormProps> = ({
  locale = 'zh'
}) => {
  const t = i18n[locale];


  return (
    <>
      <Form.Item label={t.name} name="name" rules={[{ required: true }]}>
        <Input placeholder={`请输入${t.name}`} />
      </Form.Item>
      <Form.Item label={t.email} name="email" rules={[{ type: 'email' }]}>
        <Input placeholder={`请输入${t.email}`} />
      </Form.Item>
    </>
  );
};

export default UserProfileForm;