/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  InputNumber,
  App,
  Tag,
  Popconfirm,
  Card,
  Typography,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  LayoutOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { blueprintService } from '../api/blueprintService';
import type { Blueprint } from '../types/entities';
import { formatDate } from '../utils/dateFormatter';
import { racksApi } from '../api/racks';
import { useAuthStore } from '../store/authStore';
import type { ColumnsType } from 'antd/es/table';
import { useNavigate } from 'react-router-dom';
import { AppColors } from '../constants/colors';

const { Title, Text } = Typography;

type BlueprintFormData = {
  id?: string;
  name: string;
  width: number;
  height: number;
  gridSize: number;
};

export default function Blueprints() {
  const { message: messageApi } = App.useApp();
  const navigate = useNavigate();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingBlueprint, setEditingBlueprint] = useState<Blueprint | null>(null);
  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === 'Admin';

  const { data: blueprints, isLoading } = useQuery({
    queryKey: ['blueprints'],
    queryFn: blueprintService.getAll,
  });

  const createMutation = useMutation({
    mutationFn: (data: BlueprintFormData) => blueprintService.create(data as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blueprints'] });
      messageApi.success('Blueprint created successfully!');
      setIsAddModalOpen(false);
      addForm.resetFields();
    },
    onError: (error: any) => {
      console.error('Create error:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.title ||
        'Failed to create blueprint';
      messageApi.error(errorMessage);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: BlueprintFormData }) =>
      blueprintService.update(id, data as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blueprints'] });
      messageApi.success('Blueprint updated successfully!');
      setIsEditModalOpen(false);
      setEditingBlueprint(null);
      editForm.resetFields();
    },
    onError: (error: any) => {
      console.error('Update error:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.title ||
        'Failed to update blueprint';
      messageApi.error(errorMessage);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: blueprintService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blueprints'] });
      messageApi.success('Blueprint deleted successfully!');
    },
    onError: (error: any) => {
      console.error('Delete error:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.title ||
        'Failed to delete blueprint';
      messageApi.error(errorMessage);
    },
  });

  const handleDeleteBlueprint = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleAddSubmit = async (values: BlueprintFormData) => {
    createMutation.mutate(values);
  };

  const handleEditSubmit = async (values: BlueprintFormData) => {
    if (editingBlueprint) {
      updateMutation.mutate({
        id: editingBlueprint.id,
        data: { ...values, id: editingBlueprint.id },
      });
    }
  };
  const racksCountByBlueprint = useQuery({
    queryKey: ['racks-count'],
    queryFn: async () => {
      if (!blueprints) return {};
      const counts: Record<string, number> = {};
      await Promise.all(
        blueprints.map(async (bp) => {
          const racks = await racksApi.getByBlueprintId(bp.id);
          counts[bp.id] = racks?.length || 0;
        })
      );
      return counts;
    },
    enabled: !!blueprints, 
  });
  const handleAddCancel = () => {
    setIsAddModalOpen(false);
    addForm.resetFields();
  };

  const handleEditCancel = () => {
    setIsEditModalOpen(false);
    setEditingBlueprint(null);
    editForm.resetFields();
  };

  const columns: ColumnsType<Blueprint> = [
    {
      title: 'Blueprint Name',
      dataIndex: 'name',
      key: 'name',
      width: '20%',
      render: (text: string) => <Text strong style={{ fontSize: '16px' }}>{text}</Text>,
    },
    {
      title: 'Dimensions',
      key: 'dimensions',
      width: '15%',
      render: (_: any, record: Blueprint) => (
        <Text type="secondary">
          {record.width}m × {record.height}m
        </Text>
      ),
    },
    {
      title: 'Grid Size',
      dataIndex: 'gridSize',
      key: 'gridSize',
      width: '12%',
      render: (size: number) => <Tag color="blue">{size}cm</Tag>,
    },
    {
      title: 'Racks',
      key: 'rackCount',
      width: '10%',
      render: (_: any, record: Blueprint) => {
        const count = racksCountByBlueprint.data?.[record.id] ?? 0;
        return <Tag color="green">{count} racks</Tag>;
      },
    },
    {
      title: 'Created',
      dataIndex: 'createdDate',
      key: 'createdDate',
      width: '12%',
      render: (date: string) => <Text type="secondary">{formatDate(date)}</Text>,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: '22%',
      render: (_: any, record: Blueprint) => (
        <Space size="small">
          {isAdmin && (
            <Button
              type="primary"
              icon={<LayoutOutlined />}
              onClick={() => navigate(`/blueprints/${record.id}/designer`)}
              style={{ borderRadius: '6px', backgroundColor: AppColors.primary }}
            >
              Designer
            </Button>
          )}
          <Button
            type="default"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/blueprints/${record.id}/racks`)}
            style={{ borderRadius: '6px', backgroundColor: AppColors.success, color: '#fff' }}
          >
            Racks
          </Button>
          {isAdmin && (
            <>
              <Popconfirm
                title="Delete Blueprint"
                description="Are you sure? This will delete all racks and locations!"
                onConfirm={() => handleDeleteBlueprint(record.id)}
                okText="Confirm"
                cancelText="Cancel"
                okButtonProps={{ danger: true }}
                icon={<ExclamationCircleOutlined style={{ color: 'red' }} />}
              >
                <Button danger icon={<DeleteOutlined />} style={{ borderRadius: '6px' }}>
                  Delete
                </Button>
              </Popconfirm>
            </>
          )}
        </Space>
      ),
    },

  ];

  const BlueprintFormFields = () => (
    <>
      <Form.Item
        label="Blueprint Name"
        name="name"
        rules={[
          { required: true, message: 'Please enter blueprint name' },
          { min: 2, message: 'Name must be at least 2 characters' },
        ]}
      >
        <Input placeholder="e.g., Main Warehouse Layout" prefix={<LayoutOutlined />} />
      </Form.Item>

      <Space style={{ width: '100%' }} size="large">
        <Form.Item
          label="Width (meters)"
          name="width"
          rules={[
            { required: true, message: 'Please enter width' },
            { type: 'number', min: 10, message: 'Width must be at least 10m' },
            { type: 'number', max: 200, message: 'Width cannot exceed 200m' },
          ]}
          style={{ flex: 1 }}
        >
          <InputNumber placeholder="Width" min={10} max={200} style={{ width: '100%' }} addonAfter="m" />
        </Form.Item>

        <Form.Item
          label="Height (meters)"
          name="height"
          rules={[
            { required: true, message: 'Please enter height' },
            { type: 'number', min: 10, message: 'Height must be at least 10m' },
            { type: 'number', max: 200, message: 'Height cannot exceed 200m' },
          ]}
          style={{ flex: 1 }}
        >
          <InputNumber placeholder="Height" min={10} max={200} style={{ width: '100%' }} addonAfter="m" />
        </Form.Item>

        <Form.Item
          label="Grid Size (cm)"
          name="gridSize"
          rules={[
            { required: true, message: 'Please enter grid size' },
            { type: 'number', min: 50, message: 'Grid size must be at least 50cm' },
            { type: 'number', max: 200, message: 'Grid size cannot exceed 200cm' },
          ]}
          style={{ flex: 1 }}
          tooltip="Grid size for snapping racks (recommended: 100cm = 1 meter)"
          initialValue={100}
        >
          <InputNumber placeholder="Grid Size" min={50} max={200} style={{ width: '100%' }} addonAfter="cm" />
        </Form.Item>
      </Space>
    </>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f5', padding: '24px' }}>
      <style>{`
              .ant-pagination .ant-pagination-item-active {
                border-color: ${AppColors.primary} !important;
              }
              .ant-pagination .ant-pagination-item-active a {
                color: ${AppColors.primary} !important;
              }
            `}</style>
      <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Title level={2}>Warehouse Blueprints</Title>
                <Text type="secondary">
                  Manage warehouse layouts and floor plans
                  {isAdmin && <Tag color="red" style={{ marginLeft: '8px' }}>Admin</Tag>}
                </Text>
              </div>
              {isAdmin && (
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setIsAddModalOpen(true)}
                  size="large" 
                  style={{ backgroundColor: AppColors.success,borderColor: AppColors.success,}}
                >
                  Add Blueprint
                </Button>
              )}
            </div>
          </Card>

          <Card>
            <Table
              columns={columns}
              dataSource={blueprints}
              rowKey="id"
              loading={isLoading}
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </Space>

        <Modal
          title="Add Blueprint"
          open={isAddModalOpen}
          onCancel={handleAddCancel}
          footer={null}
          width={700}
        >
          <Form form={addForm} layout="vertical" onFinish={handleAddSubmit}>
            <BlueprintFormFields />
            <Form.Item>
              <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                <Button onClick={handleAddCancel}>Cancel</Button>
                <Button type="primary" htmlType="submit" loading={createMutation.isPending} 
                  style={{ backgroundColor: AppColors.success,borderColor: AppColors.success,}}>
                  Create Blueprint
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>

        <Modal
          title="Edit Blueprint"
          open={isEditModalOpen}
          onCancel={handleEditCancel}
          footer={null}
          width={700}
        >
          <Form form={editForm} layout="vertical" onFinish={handleEditSubmit}>
            <BlueprintFormFields />
            <Form.Item>
              <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                <Button onClick={handleEditCancel}>Cancel</Button>
                <Button type="primary" htmlType="submit" loading={updateMutation.isPending} 
                  style={{ backgroundColor: AppColors.success,borderColor: AppColors.success,}}>
                  Update Blueprint
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
}