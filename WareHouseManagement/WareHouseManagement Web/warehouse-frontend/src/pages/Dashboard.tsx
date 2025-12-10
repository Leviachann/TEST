import { Card, Typography, Space, Descriptions, Tag, Row, Col, Statistic, Spin, Alert, Button } from 'antd';
import { 
  DashboardOutlined,
  ShoppingOutlined,
  EnvironmentOutlined,
  InboxOutlined,
  AppstoreOutlined,
  UserOutlined,
  WarningOutlined,
  LayoutOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { dashboardApi } from '../api';

const { Title, Text } = Typography;

export default function Dashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const { data: stats, isLoading, error, refetch } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: dashboardApi.getStats,
    refetchInterval: 30000, 
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Admin':
        return 'red';
      case 'Moderator':
        return 'blue';
      case 'WareHouseMan':
        return 'green';
      default:
        return 'default';
    }
  };

  if (isLoading) {
    return (
      <div
        style={{
          padding: '24px',
          background: '#f0f2f5',
          minHeight: 'calc(100vh - 64px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Spin size="large" tip="Loading dashboard..." />
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          padding: '24px',
          background: '#f0f2f5',
          minHeight: 'calc(100vh - 64px)',
        }}
      >
        <Alert
          message="Error Loading Dashboard"
          description="Failed to load dashboard statistics. Please try again."
          type="error"
          showIcon
          action={
            <Typography.Link onClick={() => refetch()}>
              Retry
            </Typography.Link>
          }
        />
      </div>
    );
  }

  return (
    <div
      style={{
        padding: '24px',
        background: '#f0f2f5',
        minHeight: 'calc(100vh - 64px)',
      }}
    >
      <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Card>
            <Title level={2} style={{ margin: 0, marginBottom: '8px' }}>
              Welcome back, {user?.firstName}! 
            </Title>
            <Text type="secondary" style={{ fontSize: '16px' }}>
              Here's what's happening in your warehouse today
            </Text>
          </Card>

          <Row gutter={[24, 24]}>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Total Products"
                  value={stats?.totalProducts || 0}
                  prefix={<ShoppingOutlined />}
                  valueStyle={{ color: '#3f8600' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Low Stock Products"
                  value={stats?.lowStockProducts || 0}
                  prefix={<WarningOutlined />}
                  valueStyle={{ color: stats?.lowStockProducts ? '#faad14' : '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Total Blueprints"
                  value={stats?.totalBlueprints || 0}
                  prefix={<LayoutOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Total Locations"
                  value={stats?.totalLocations || 0}
                  prefix={<EnvironmentOutlined />}
                  valueStyle={{ color: '#722ed1' }}
                />
              </Card>
            </Col>
          </Row>

          <Row gutter={[24, 24]}>
            <Col xs={24} lg={10}>
              <Card 
                title={
                  <span style={{ fontSize: '20px' }}>
                    <UserOutlined style={{ marginRight: '8px' }} />
                    User Information
                  </span>
                }
              >
                <Descriptions bordered column={1} size="middle">
                  <Descriptions.Item 
                    label={<span style={{ fontSize: '16px' }}>Full Name</span>}
                    labelStyle={{ width: '180px' }}
                  >
                    <Text strong style={{ fontSize: '16px' }}>
                      {user?.firstName} {user?.lastName}
                    </Text>
                  </Descriptions.Item>
                  <Descriptions.Item 
                    label={<span style={{ fontSize: '16px' }}>Username</span>}
                  >
                    <Text style={{ fontSize: '16px' }}>{user?.username}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item 
                    label={<span style={{ fontSize: '16px' }}>Email</span>}
                  >
                    <Text style={{ fontSize: '16px' }}>{user?.email}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item 
                    label={<span style={{ fontSize: '16px' }}>Role</span>}
                  >
                    <Tag color={getRoleColor(user?.role || '')} style={{ fontSize: '16px', padding: '4px 12px' }}>
                      {user?.role}
                    </Tag>
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </Col>

            <Col xs={24} lg={14}>
              <Card 
                title={
                  <span style={{ fontSize: '20px' }}>
                    <DashboardOutlined style={{ marginRight: '8px' }} />
                    Quick Navigation
                  </span>
                }
              >
                <Space direction="vertical" style={{ width: '100%' }} size="large">
                  <div>
                    <Text style={{ fontSize: '16px', display: 'block', marginBottom: '16px' }}>
                      Quick access to your most-used warehouse pages:
                    </Text>
                  </div>

                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12}>
                      <Card 
                        hoverable 
                        style={{ height: '100%', cursor: 'pointer' }}
                        bodyStyle={{ padding: '20px' }}
                        onClick={() => navigate('/products')}
                      >
                        <Space direction="vertical" style={{ width: '100%' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <ShoppingOutlined style={{ fontSize: '32px', color: '#52c41a' }} />
                            <ArrowRightOutlined style={{ fontSize: '16px', color: '#999' }} />
                          </div>
                          <Title level={4} style={{ margin: 0 }}>Products</Title>
                          <Text type="secondary">
                            View and manage your product catalog
                          </Text>
                        </Space>
                      </Card>
                    </Col>

                    <Col xs={24} sm={12}>
                      <Card 
                        hoverable 
                        style={{ height: '100%', cursor: 'pointer' }}
                        bodyStyle={{ padding: '20px' }}
                        onClick={() => navigate('/blueprints')}
                      >
                        <Space direction="vertical" style={{ width: '100%' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <LayoutOutlined style={{ fontSize: '32px', color: '#1890ff' }} />
                            <ArrowRightOutlined style={{ fontSize: '16px', color: '#999' }} />
                          </div>
                          <Title level={4} style={{ margin: 0 }}>Blueprints</Title>
                          <Text type="secondary">
                            View warehouse floor plans and layouts
                          </Text>
                        </Space>
                      </Card>
                    </Col>

                   <Col xs={24} sm={12}>
                  <Card 
                    hoverable 
                    style={{ height: '100%', cursor: 'pointer' }}
                    bodyStyle={{ padding: '20px' }}
                    onClick={() => navigate('/suppliers')}
                  >
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <InboxOutlined style={{ fontSize: '32px', color: '#722ed1' }} />
                        <ArrowRightOutlined style={{ fontSize: '16px', color: '#999' }} />
                      </div>
                      <Title level={4} style={{ margin: 0 }}>Suppliers</Title>
                      <Text type="secondary">
                        View and manage all warehouse suppliers
                      </Text>
                    </Space>
                  </Card>
                </Col>


                    <Col xs={24} sm={12}>
                      <Card 
                        hoverable 
                        style={{ height: '100%', cursor: 'pointer' }}
                        bodyStyle={{ padding: '20px' }}
                        onClick={() => navigate('/locations')}
                      >
                        <Space direction="vertical" style={{ width: '100%' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <EnvironmentOutlined style={{ fontSize: '32px', color: '#eb2f96' }} />
                            <ArrowRightOutlined style={{ fontSize: '16px', color: '#999' }} />
                          </div>
                          <Title level={4} style={{ margin: 0 }}>Locations</Title>
                          <Text type="secondary">
                            Track inventory across storage locations
                          </Text>
                        </Space>
                      </Card>
                    </Col>

                  </Row>
                </Space>
              </Card>
            </Col>
          </Row>

          <Card size="small">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <Text type="secondary" style={{ fontSize: '14px' }}>
                <span style={{ color: '#52c41a', marginRight: '8px' }}>●</span>
                All systems operational • Session active • Last updated: {new Date().toLocaleString()}
              </Text>
              <Text type="secondary" style={{ fontSize: '14px' }}>
                Version 1.0.0 • Auto-refresh: 30s
              </Text>
            </div>
          </Card>
        </Space>
      </div>
    </div>
  );
}