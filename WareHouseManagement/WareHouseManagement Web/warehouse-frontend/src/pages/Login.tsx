/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, Typography, Alert, Space } from 'antd';
import { UserOutlined, LockOutlined, WarningOutlined } from '@ant-design/icons';
import { useAuthStore } from '../store/authStore';
import { authApi } from '../api';
import { AppColors } from '../constants/colors';
import type { LoginRequest } from '../types/entities';

const { Title, Text } = Typography;

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const onFinish = async (values: LoginRequest) => {
    setLoading(true);
    setError('');

    try {
      console.log('Attempting login with:', values.username);
      const response = await authApi.login(values);
      console.log('FULL API RESPONSE:', response);
      console.log('Response keys:', Object.keys(response));
      console.log('User object:', response.user);
      console.log('User (capital U):', (response as any).User);
      console.log('Access token:', response.accessToken);
      console.log('AccessToken (capital A):', (response as any).AccessToken);
      
      let user = response.user;
      let accessToken = response.accessToken;
      let refreshToken = response.refreshToken;
      
      if (!user && (response as any).User) {
        console.log('Found User with capital U');
        user = (response as any).User;
      }
      
      if (!accessToken && (response as any).AccessToken) {
        console.log('Found AccessToken with capital A');
        accessToken = (response as any).AccessToken;
      }
      
      if (!refreshToken && (response as any).RefreshToken) {
        console.log('Found RefreshToken with capital R');
        refreshToken = (response as any).RefreshToken;
      }
      
      if (!user) {
        console.error('USER OBJECT IS MISSING from API response!');
        console.error('Available keys:', Object.keys(response));
        setError('Login succeeded but user data is missing from server response. Check console for details.');
        return;
      }
      
      console.log('Login successful:', user);
      
      login(user, accessToken, refreshToken);
      
      navigate('/');
    } catch (err: any) {
      console.error('Login error:', err);
      console.error('Error response:', err.response?.data);
      
      if (err.response?.status === 401) {
        setError('Invalid username or password');
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        background: `linear-gradient(135deg, ${AppColors.primaryLight} 0%, ${AppColors.primaryDark} 100%)`,
      }}
    >
      <div style={{ 
        width: '50%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '60px 80px',
      }}>
        <div style={{ color: 'white', maxWidth: '600px' }}>
          <div style={{ marginBottom: '48px' }}>
            <Title level={1} style={{ color: 'white', fontSize: '52px', marginBottom: '24px', fontWeight: 700 }}>
              RackFlow
            </Title>
            <Title level={4} style={{ color: 'rgba(255, 255, 255, 0.9)', fontWeight: 400, marginBottom: '48px', lineHeight: '1.6' }}>
              Optimize your warehouse operations with real-time tracking, smarter inventory management, and automated workflows.
            </Title>
          </div>

          <Space direction="vertical" size={24} style={{ fontSize: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ 
                width: '32px', 
                height: '32px', 
                borderRadius: '50%', 
                background: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px'
              }}>
                ✓
              </div>
              <Text style={{ color: 'white', fontSize: '18px' }}>
                Real-time inventory tracking
              </Text>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ 
                width: '32px', 
                height: '32px', 
                borderRadius: '50%', 
                background: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px'
              }}>
                ✓
              </div>
              <Text style={{ color: 'white', fontSize: '18px' }}>
                Order management & processing
              </Text>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ 
                width: '32px', 
                height: '32px', 
                borderRadius: '50%', 
                background: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px'
              }}>
                ✓
              </div>
              <Text style={{ color: 'white', fontSize: '18px' }}>
                Supplier & location management
              </Text>
            </div>
            
          </Space>
        </div>
      </div>

      <div style={{ 
        width: '50%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '60px',
        background: 'rgba(255, 255, 255, 0.05)',
      }}>
        <Card
          style={{
            width: '100%',
            maxWidth: '520px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            borderRadius: '16px',
          }}
        >
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <Title level={2} style={{ margin: 0, fontSize: '32px', fontWeight: 600 }}>
                Welcome Back
              </Title>
              <Text type="secondary" style={{ fontSize: '16px' }}>
                Sign in to access your dashboard
              </Text>
            </div>

            {error && (
              <Alert
                message="Login Failed"
                description={error}
                type="error"
                showIcon
                icon={<WarningOutlined />}
                closable
                onClose={() => setError('')}
                style={{ marginBottom: '8px' }}
              />
            )}

            <Form
              name="login"
              onFinish={onFinish}
              autoComplete="off"
              layout="vertical"
              size="large"
            >
              <Form.Item
                label={<span style={{ fontSize: '16px', fontWeight: 500 }}>Username</span>}
                name="username"
                rules={[
                  { required: true, message: 'Please enter your username' },
                  { min: 3, message: 'Username must be at least 3 characters' },
                ]}
              >
                <Input
                  prefix={<UserOutlined style={{ fontSize: '18px', color: '#bfbfbf' }} />}
                  placeholder="Enter your username"
                  autoComplete="username"
                  style={{ height: '50px', fontSize: '16px' ,}}
                />
              </Form.Item>

              <Form.Item
                label={<span style={{ fontSize: '16px', fontWeight: 500 }}>Password</span>}
                name="password"
                rules={[
                  { required: true, message: 'Please enter your password' },
                  { min: 6, message: 'Password must be at least 6 characters' },
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined style={{ fontSize: '18px', color: '#bfbfbf' }} />}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  style={{ height: '50px', fontSize: '16px' }}
                />
              </Form.Item>

              <Form.Item style={{ marginBottom: 0, marginTop: '32px' }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  block
                  style={{ 
                    height: '52px', 
                    fontSize: '18px',
                    fontWeight: 600,    
                    backgroundColor: AppColors.primary,
                  }}
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
              </Form.Item>
            </Form>

            <div style={{ textAlign: 'center', marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #f0f0f0' }}>
              <Text type="secondary" style={{ fontSize: '14px' }}>
                Warehouse Management System v1.0
              </Text>
              <br />
            </div>
          </Space>
        </Card>
      </div>
    </div>
  );
}