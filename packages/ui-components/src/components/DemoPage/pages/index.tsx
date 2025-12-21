import React from 'react';

interface Runtime {
  antd: typeof import('antd');
  react: typeof import('react');
}

export default function createForm(runtime: Runtime) {
  // const { Form, Input, Button } = runtime.antd;

  return () => (
    <div>
      demo
    </div>
  );
}
