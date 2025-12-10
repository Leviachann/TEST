import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Button, Dropdown, Avatar, Space, Typography } from 'antd';
import {
  DashboardOutlined,
  AppstoreOutlined,
  ShoppingOutlined,
  ShopOutlined,
  EnvironmentOutlined,
  InboxOutlined,
  FileTextOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  PlusSquareOutlined 
} from '@ant-design/icons';
import { useAuthStore } from '../store/authStore';
import { authApi } from '../api';
import type { MenuProps } from 'antd';
import { AppColors } from '../constants/colors';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      logout();
      navigate('/login');
    }
  };

  const menuItems: MenuProps['items'] = [
    {
      key: '/',
      icon: <DashboardOutlined style={{ fontSize: '18px' }} />,
      label: 'Dashboard',
      onClick: () => navigate('/'),
    },
    {
      key: '/categories',
      icon: <AppstoreOutlined style={{ fontSize: '18px' }} />,
      label: 'Categories',
      onClick: () => navigate('/categories'),
    },
    {
      key: '/products',
      icon: <ShoppingOutlined style={{ fontSize: '18px' }} />,
      label: 'Products',
      onClick: () => navigate('/products'),
    },
    {
      key: '/suppliers',
      icon: <ShopOutlined style={{ fontSize: '18px' }} />,
      label: 'Suppliers',
      onClick: () => navigate('/suppliers'), 
    },
    {
      key: '/locations',
      icon: <EnvironmentOutlined style={{ fontSize: '18px' }} />,
      label: 'Locations',
      onClick: () => navigate('/locations'),
    },
    {
      key: '/blueprints',
      icon: <PlusSquareOutlined  style={{ fontSize: '18px' }} />,
      label: 'Blueprints',
      onClick: () => navigate('/blueprints'),
    },

    {
      key: '/inventory',
      icon: <InboxOutlined style={{ fontSize: '18px' }} />,
      label: 'Inventory',
      onClick: () => navigate('/inventories'),
    }, 
    ...(user?.role !== 'WareHouseMan'
    ? [
        {
          key: '/orders',
          icon: <FileTextOutlined style={{ fontSize: '18px' }} />,
          label: 'Orders',
          onClick: () => navigate('/orders'),
        },
      ]
    : []),
  ];

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      danger: true,
      onClick: handleLogout,
    },
  ];

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Admin':
        return '#f5222d';
      case 'Moderator':
        return '#1890ff';
      case 'WareHouseMan':
        return '#52c41a';
      default:
        return '#8c8c8c';
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>

          <style>{`
        .ant-menu-dark {
          background: #0d2222ff !important;
        }

        .ant-menu-dark .ant-menu-item {
          color: #d9d9d9 !important;
        }

        .ant-menu-dark .ant-menu-item-icon {
          color: #d9d9d9 !important;
        }

        .ant-menu-dark .ant-menu-item:hover {
          background: rgba(4, 92, 90, 0.35) !important;
          color: #ffffff !important;
        }

        .ant-menu-dark .ant-menu-item-selected {
          background: #045C5A !important;
          color: #ffffff !important;
        }

        .ant-menu-dark .ant-menu-item-selected .ant-menu-item-icon {
          color: #ffffff !important;
        }

        .ant-tooltip-inner {
          background: #045C5A !important;
        }
        .ant-tooltip-arrow {
          border-color: #045C5A !important;
        }

        .ant-btn-text:hover {
          color: #045C5A !important;
        }
        `}</style>




<Sider
  collapsible
  collapsed={collapsed}
  onCollapse={setCollapsed}
  trigger={null}
  width={250}
  style={{
    overflow: 'auto',
    height: '100vh',
    position: 'fixed',
    left: 0,
    top: 0,
    bottom: 0,
    background: AppColors.primaryDark,
  }}
>

  <Menu
    theme="dark"
    mode="inline"
    selectedKeys={[location.pathname]}
    items={menuItems}
    style={{
      fontSize: '16px',
      background: AppColors.primaryDark,
    }}
    inlineCollapsed={collapsed}
  />
</Sider>



      <Layout style={{ marginLeft: collapsed ? 80 : 250, transition: 'all 0.2s' }}>
        <Header
          style={{
            padding: '0 24px',
            background: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            position: 'sticky',
            top: 0,
            zIndex: 1,
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: '18px',
              width: 48,
              height: 48,
            }}
          />

          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Space style={{ cursor: 'pointer' }}>
              <Avatar
                style={{ backgroundColor: getRoleColor(user?.role || '') }}
                icon={<UserOutlined />}
              />
              <div style={{ textAlign: 'right' }}>
                <div>
                  <Text strong style={{ fontSize: '15px' }}>
                    {user?.firstName} {user?.lastName}
                  </Text>
                </div>
                <div>
                </div>
              </div>
            </Space>
          </Dropdown>
        </Header>

        <Content style={{ overflow: 'initial' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}