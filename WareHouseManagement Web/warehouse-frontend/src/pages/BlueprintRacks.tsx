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
  Breadcrumb,
} from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  AppstoreOutlined,
  HomeOutlined,
  LayoutOutlined,
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { blueprintService } from '../api/blueprintService';
import { racksApi } from '../api/racks';
import type { Rack } from '../types/entities';
import { formatDate } from '../utils/dateFormatter';
import { locationsApi } from '../api';
import { useAuthStore } from '../store/authStore';
import type { ColumnsType } from 'antd/es/table';
import { useParams, useNavigate } from 'react-router-dom';
import { AppColors } from '../constants/colors';

const { Title, Text } = Typography;

type RackFormData = {
  id?: string;
  name: string;
  positionX: number;
  positionY: number;
  width: number;
  height: number;
  rows: number;
  grids: number;
};

export default function BlueprintRacks() {
  const { blueprintId } = useParams<{ blueprintId: string }>();
  const navigate = useNavigate();
  const { message: messageApi } = App.useApp();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRack, setEditingRack] = useState<Rack | null>(null);
  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === 'Admin';

  const { data: blueprint } = useQuery({
    queryKey: ['blueprints', blueprintId],
    queryFn: () => blueprintService.getById(blueprintId!),
    enabled: !!blueprintId,
  });

  const { data: racks, isLoading } = useQuery({
    queryKey: ['racks', blueprintId],
    queryFn: () => racksApi.getByBlueprintId(blueprintId!),
    enabled: !!blueprintId,
  });

  const createMutation = useMutation({
    mutationFn: (data: RackFormData) =>
      racksApi.create({ ...data, blueprintId: blueprintId! } as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['racks', blueprintId] });
      queryClient.invalidateQueries({ queryKey: ['blueprints'] });
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      messageApi.success('Rack created successfully! Locations auto-generated.');
      setIsAddModalOpen(false);
      addForm.resetFields();
    },
    onError: (error: any) => {
      console.error('Create error:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.title ||
        'Failed to create rack';
      messageApi.error(errorMessage);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: RackFormData }) =>
      racksApi.update(id, data as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['racks', blueprintId] });
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      messageApi.success('Rack updated successfully! Locations regenerated.');
      setIsEditModalOpen(false);
      setEditingRack(null);
      editForm.resetFields();
    },
    onError: (error: any) => {
      console.error('Update error:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.title ||
        'Failed to update rack';
      messageApi.error(errorMessage);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: racksApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['racks', blueprintId] });
      queryClient.invalidateQueries({ queryKey: ['blueprints'] });
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      messageApi.success('Rack deleted successfully!');
    },
    onError: (error: any) => {
      console.error('Delete error:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.title ||
        'Failed to delete rack';
      messageApi.error(errorMessage);
    },
  });

  const handleDeleteRack = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleAddSubmit = async (values: RackFormData) => {
    createMutation.mutate(values);
  };

  const handleEditSubmit = async (values: RackFormData) => {
    if (editingRack) {
      updateMutation.mutate({
        id: editingRack.id,
        data: { ...values, id: editingRack.id },
      });
    }
  };
  const { data: locations } = useQuery({
    queryKey: ['locations', blueprintId],
    queryFn: () => locationsApi.getAll(), 
    enabled: !!blueprintId,
  });

const racksWithLocationCount = racks?.map((rack) => {
  const count = locations?.filter((loc) => loc.rackId === rack.id).length || 0;
  return { ...rack, locationCount: count };
});

  const handleAddCancel = () => {
    setIsAddModalOpen(false);
    addForm.resetFields();
  };

  const handleEditCancel = () => {
    setIsEditModalOpen(false);
    setEditingRack(null);
    editForm.resetFields();
  };

  const columns: ColumnsType<Rack> = [
    {
      title: 'Rack Name',
      dataIndex: 'name',
      key: 'name',
      width: '15%',
      render: (text: string) => <Text strong style={{ fontSize: '16px' }}>{text}</Text>,
    },
    {
      title: 'Position',
      key: 'position',
      width: '12%',
      render: (_: any, record: Rack) => (
        <Text type="secondary">
          ({record.positionX.toFixed(1)}, {record.positionY.toFixed(1)})
        </Text>
      ),
    },
    {
      title: 'Dimensions',
      key: 'dimensions',
      width: '12%',
      render: (_: any, record: Rack) => (
        <Text type="secondary">
          {record.width.toFixed(1)}m × {record.height.toFixed(1)}m
        </Text>
      ),
    },
    {
      title: 'Storage',
      key: 'storage',
      width: '12%',
      render: (_: any, record: Rack) => (
        <Space>
          <Tag color="blue">{record.rows} rows</Tag>
          <Tag color="cyan">{record.grids} grids</Tag>
        </Space>
      ),
    },
    {
      title: 'Locations',
      dataIndex: 'locationCount',
      key: 'locationCount',
      width: '12%',
      render: (count: number) => <Tag color="green">{count} locations</Tag>,
    },
    {
      title: 'Created',
      dataIndex: 'createdDate',
      key: 'createdDate',
      width: '12%',
      render: (date: string) => <Text type="secondary">{formatDate(date)}</Text>,
    },
    ...(isAdmin
      ? [
          {
            title: 'Actions',
            key: 'actions',
            width: '15%',
            render: (_: any, record: Rack) => (
              <Space size="small">
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={() => {
                    setEditingRack(record);
                    setIsEditModalOpen(true);
                    editForm.setFieldsValue({
                      name: record.name,
                      positionX: record.positionX,
                      positionY: record.positionY,
                      width: record.width,
                      height: record.height,
                      rows: record.rows,
                      grids: record.grids,
                    });
                  }}
                  style={{ borderRadius: '6px', backgroundColor: AppColors.success,borderColor: AppColors.success}}
                >
                  Edit
                </Button>
                <Popconfirm
                  title="Delete Rack"
                  description="Are you sure? This will delete all locations in this rack!"
                  onConfirm={() => handleDeleteRack(record.id)}
                  okText="Confirm"
                  cancelText="Cancel"
                  okButtonProps={{ danger: true }}
                  icon={<ExclamationCircleOutlined style={{ color: 'red' }} />}
                >
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    style={{ borderRadius: '6px' }}
                  >
                    Delete
                  </Button>
                </Popconfirm>
              </Space>
            ),
          },
        ]
      : []),
  ];

  const RackFormFields = () => (
    <>
      <Form.Item
        label="Rack Name"
        name="name"
        rules={[
          { required: true, message: 'Please enter rack name' },
          { min: 2, message: 'Name must be at least 2 characters' },
        ]}
      >
        <Input placeholder="e.g., Pallet Rack A1" prefix={<AppstoreOutlined />} />
      </Form.Item>

      <Space style={{ width: '100%' }} size="large">
        <Form.Item
          label="Position X (m)"
          name="positionX"
          rules={[
            { required: true, message: 'Please enter X position' },
            { type: 'number', min: 0, message: 'Position must be positive' },
          ]}
          style={{ flex: 1 }}
          tooltip="Horizontal position on the blueprint"
        >
          <InputNumber placeholder="X" min={0} step={0.5} style={{ width: '100%' }} addonAfter="m" />
        </Form.Item>

        <Form.Item
          label="Position Y (m)"
          name="positionY"
          rules={[
            { required: true, message: 'Please enter Y position' },
            { type: 'number', min: 0, message: 'Position must be positive' },
          ]}
          style={{ flex: 1 }}
          tooltip="Vertical position on the blueprint"
        >
          <InputNumber placeholder="Y" min={0} step={0.5} style={{ width: '100%' }} addonAfter="m" />
        </Form.Item>
      </Space>

      <Space style={{ width: '100%' }} size="large">
        <Form.Item
          label="Width (m)"
          name="width"
          rules={[
            { required: true, message: 'Please enter width' },
            { type: 'number', min: 0.5, message: 'Width must be at least 0.5m' },
          ]}
          style={{ flex: 1 }}
        >
          <InputNumber placeholder="Width" min={0.5} step={0.5} style={{ width: '100%' }} addonAfter="m" />
        </Form.Item>

        <Form.Item
          label="Height (m)"
          name="height"
          rules={[
            { required: true, message: 'Please enter height' },
            { type: 'number', min: 0.5, message: 'Height must be at least 0.5m' },
          ]}
          style={{ flex: 1 }}
        >
          <InputNumber placeholder="Height" min={0.5} step={0.5} style={{ width: '100%' }} addonAfter="m" />
        </Form.Item>
      </Space>

      <Space style={{ width: '100%' }} size="large">
        <Form.Item
          label="Rows"
          name="rows"
          rules={[
            { required: true, message: 'Please enter rows' },
            { type: 'number', min: 1, message: 'Rows must be at least 1' },
            { type: 'number', max: 20, message: 'Rows cannot exceed 20' },
          ]}
          style={{ flex: 1 }}
          tooltip="Number of vertical shelves (generates locations automatically)"
        >
          <InputNumber placeholder="Rows" min={1} max={20} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          label="Grids"
          name="grids"
          rules={[
            { required: true, message: 'Please enter grids' },
            { type: 'number', min: 1, message: 'Grids must be at least 1' },
            { type: 'number', max: 30, message: 'Grids cannot exceed 30' },
          ]}
          style={{ flex: 1 }}
          tooltip="Number of horizontal positions (generates locations automatically)"
        >
          <InputNumber placeholder="Grids" min={1} max={30} style={{ width: '100%' }} />
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

      .custom-button-default:hover {
        color: ${AppColors.primary} !important;
        border-color: ${AppColors.primary} !important;
      }

      .ant-select-selector:hover,
      .ant-picker:hover,
      .ant-input-number:hover,
      .ant-input:hover {
        border-color: ${AppColors.primary} !important;
      }

      .ant-select-focused .ant-select-selector,
      .ant-select-selector:focus,
      .ant-picker-focused,
      .ant-input-number-focused,
      .ant-input:focus {
        border-color: ${AppColors.primary} !important;
        box-shadow: 0 0 0 2px ${AppColors.primary}20 !important;
        outline: none !important;
      }

      .ant-input:focus {
        box-shadow: 0 0 0 2px ${AppColors.primary}20 !important;
      }

      .ant-select-dropdown .ant-select-item-option-active:not(.ant-select-item-option-disabled) {
        background-color: ${AppColors.primary}10 !important;
      }
      .ant-select-dropdown .ant-select-item-option-selected:not(.ant-select-item-option-disabled) {
        background-color: ${AppColors.primary}20 !important;
        color: ${AppColors.primary} !important;
      }

      .ant-picker-panel .ant-picker-footer,
      .ant-picker-dropdown .ant-picker-footer {
        padding: 8px 12px !important;
      }

      .ant-picker-footer .ant-btn {
        border-color: ${AppColors.primary} !important;
        color: ${AppColors.primary} !important;
        background: transparent !important;
      }

      .ant-picker-footer .ant-btn.ant-btn-primary,
      .ant-picker-footer .ant-btn-primary {
        background-color: ${AppColors.primary} !important;
        border-color: ${AppColors.primary} !important;
        color: #fff !important;
        box-shadow: none !important;
      }

      .ant-picker-footer .ant-btn:hover,
      .ant-picker-footer .ant-btn:focus {
        border-color: ${AppColors.primary} !important;
        color: ${AppColors.primary} !important;
        background: ${AppColors.primary}05 !important;
      }

      .ant-picker-footer .ant-btn.ant-btn-primary:hover,
      .ant-picker-footer .ant-btn.ant-btn-primary:focus {
        background-color: ${AppColors.primary}Light !important;
        background-color: ${AppColors.primary} !important;
        filter: brightness(1.05) !important;
        border-color: ${AppColors.primary} !important;
      }

      .ant-time-picker-panel .ant-btn,
      .ant-picker-panel .ant-btn {
        border-color: ${AppColors.primary} !important;
        color: ${AppColors.primary} !important;
      }

      .ant-time-picker-panel .ant-btn-primary,
      .ant-picker-panel .ant-btn-primary {
        background-color: ${AppColors.primary} !important;
        border-color: ${AppColors.primary} !important;
        color: #fff !important;
      }

      .ant-picker-footer .ant-btn:focus {
        box-shadow: 0 0 0 3px ${AppColors.primary}20 !important;
        outline: none !important;
      }

        .ant-picker-header-view button {
        color: ${AppColors.primary} !important;
        font-weight: 600 !important;
      }

      .ant-picker-header-view button:hover {
        color: ${AppColors.primary} !important;
        background: ${AppColors.primary}10 !important;
        border-radius: 6px;
      }

      .ant-picker-header-next-btn,
      .ant-picker-header-super-next-btn,
      .ant-picker-header-prev-btn,
      .ant-picker-header-super-prev-btn {
        color: ${AppColors.primary} !important;
      }

      .ant-picker-header-next-btn:hover,
      .ant-picker-header-super-next-btn:hover,
      .ant-picker-header-prev-btn:hover,
      .ant-picker-header-super-prev-btn:hover {
        color: ${AppColors.primary} !important;
        background: ${AppColors.primary}10 !important;
        border-radius: 4px;
      }
      .ant-picker-time-panel-column > li:hover {
        background: ${AppColors.primary}10 !important;
      }

      .ant-picker-time-panel-column > li.ant-picker-time-panel-cell-selected,
      .ant-picker-time-panel-cell-inner-selected {
        background: ${AppColors.primary} !important;
        color: white !important;
      }

      .ant-picker-time-panel-cell.ant-picker-time-panel-cell-active .ant-picker-time-panel-cell-inner {
        background: ${AppColors.primary}20 !important;
        color: ${AppColors.primary} !important;
      }


      .ant-picker-cell-inner:hover {
        background: ${AppColors.primary}10 !important;
      }

      .ant-picker-cell-selected .ant-picker-cell-inner {
        background: ${AppColors.primary} !important;
        border-color: ${AppColors.primary} !important;
        color: white !important;
      }

      .ant-picker-cell-in-view.ant-picker-cell-range-hover-start .ant-picker-cell-inner,
      .ant-picker-cell-in-view.ant-picker-cell-range-hover-end .ant-picker-cell-inner,
      .ant-picker-cell-in-view.ant-picker-cell-range-hover .ant-picker-cell-inner {
        background: ${AppColors.primary}10 !important;
      }
    `}</style>
      <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Card>
            <Breadcrumb
              items={[
                {
                  title: (
                    <span onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
                      <HomeOutlined /> Home
                    </span>
                  ),
                },
                {
                  title: (
                    <span onClick={() => navigate('/blueprints')} style={{ cursor: 'pointer' }}>
                      <LayoutOutlined /> Blueprints
                    </span>
                  ),
                },
                {
                  title: blueprint?.name || 'Loading...',
                },
              ]}
              style={{ marginBottom: '16px' }}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Title level={2}>Racks in {blueprint?.name}</Title>
                <Text type="secondary">
                  Blueprint: {blueprint?.width}m × {blueprint?.height}m | Grid: {blueprint?.gridSize}cm
                  {isAdmin && <Tag color="red" style={{ marginLeft: '8px' }}>Admin</Tag>}
                </Text>
              </div>
            </div>
          </Card>

          <Card>
        <Table
          columns={columns}
          dataSource={racksWithLocationCount}
          rowKey="id"
          loading={isLoading}
          pagination={{ pageSize: 10 }}
        />
          </Card>
        </Space>

        <Modal
          title="Add Rack"
          open={isAddModalOpen}
          onCancel={handleAddCancel}
          footer={null}
          width={700}
        >
          <Form 
            form={addForm} 
            layout="vertical" 
            onFinish={handleAddSubmit}
            initialValues={{ rows: 4, grids: 8, width: 3.5, height: 4.0, positionX: 5, positionY: 5 }}
          >
            <RackFormFields />
            <Form.Item>
              <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                <Button onClick={handleAddCancel} className='custom-button-default'>Cancel</Button>
                <Button type="primary" htmlType="submit" loading={createMutation.isPending} 
                  style={{ borderRadius: '6px' , backgroundColor: AppColors.success,borderColor: AppColors.success,}}>
                  Create Rack
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>

        <Modal
          title="Edit Rack"
          open={isEditModalOpen}
          onCancel={handleEditCancel}
          footer={null}
          width={700}
        >
          <Form form={editForm} layout="vertical" onFinish={handleEditSubmit}>
            <RackFormFields />
            <Form.Item style={{ marginTop: '16px' }}>
              <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                <Button onClick={handleEditCancel} className='custom-button-default'>Cancel</Button>
                <Button type="primary" htmlType="submit" loading={updateMutation.isPending} 
                  style={{ borderRadius: '6px' , backgroundColor: AppColors.success,borderColor: AppColors.success,}}>
                  Update Rack
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
}