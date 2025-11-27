/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { 
  Table, 
  Button, 
  Space, 
  Modal, 
  Form, 
  Input, 
  Card,
  Typography,
  Tag,
  Popconfirm,
  App,
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined,
  ExclamationCircleOutlined,
  ShopOutlined,
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { suppliersApi } from '../api';
import type { Supplier, SupplierFormData } from '../types/entities';
import { useAuthStore } from '../store/authStore';
import type { ColumnsType } from 'antd/es/table';
import { AppColors } from '../constants/colors';

const { Title, Text } = Typography;
const { TextArea } = Input;

export default function Suppliers() {
  const { message: messageApi } = App.useApp();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === 'Admin';

  const { data: suppliers, isLoading } = useQuery({
    queryKey: ['suppliers'],
    queryFn: suppliersApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: (data: SupplierFormData) => suppliersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      messageApi.success('Supplier created successfully!');
      setIsAddModalOpen(false);
      addForm.resetFields();
    },
    onError: (error: any) => {
      console.error('Create error:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.title ||
                          'Failed to create supplier';
      messageApi.error(errorMessage);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: SupplierFormData }) =>
      suppliersApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      messageApi.success('Supplier updated successfully!');
      setIsEditModalOpen(false);
      setEditingSupplier(null);
      editForm.resetFields();
    },
    onError: (error: any) => {
      console.error('Update error:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.title ||
                          'Failed to update supplier';
      messageApi.error(errorMessage);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: suppliersApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      messageApi.success('Supplier deleted successfully!');
    },
    onError: (error: any) => {
      console.error('Delete error:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.title ||
                          'Failed to delete supplier';
      messageApi.error(errorMessage);
    },
  });

  const handleDeleteSupplier = (id: string) => {
    deleteMutation.mutate(id);
  };

const handleAddSubmit = async (values: SupplierFormData) => {
  createMutation.mutate({
    ...values,
    adress: values.adress,
    country: values.country,
    productIds: [],   
    ordersIds: [],    
  });
};

const handleEditSubmit = async (values: SupplierFormData) => {
  if (editingSupplier) {
    updateMutation.mutate({
      id: editingSupplier.id,
      data: {
        ...values,
        id: editingSupplier.id,
        adress: values.adress,
        country: values.country,
        productIds: editingSupplier.productIds || [],
        ordersIds: editingSupplier.ordersIds || [],
      },
    });
  }
};


  const handleAddCancel = () => {
    setIsAddModalOpen(false);
    addForm.resetFields();
  };

  const handleEditCancel = () => {
    setIsEditModalOpen(false);
    setEditingSupplier(null);
    editForm.resetFields();
  };

  const columns: ColumnsType<Supplier> = [
    {
      title: 'Supplier Name',
      dataIndex: 'name',
      key: 'name',
      width: '20%',
      render: (text: string) => <Text strong style={{ fontSize: '16px' }}>{text}</Text>,
    },
    {
      title: 'Contact Info',
      dataIndex: 'email',
      key: 'email',
      width: '20%',
      render: (text: string) => <Text>{text}</Text>,
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
      width: '15%',
      render: (text: string) => <Text>{text}</Text>,
    },
    {
      title: 'Address',
      dataIndex: 'adress',
      key: 'adress',
      width: '25%',
      render: (text: string) => <Text type="secondary">{text}</Text>,
    },
    {
      title: 'Country',
      dataIndex: 'country',
      key: 'country',
      width: '12%',
      render: (text: string) => <Tag color="blue">{text}</Tag>,
    },
    ...(isAdmin
      ? [
          {
            title: 'Actions',
            key: 'actions',
            width: '15%',
            render: (_: any, record: Supplier) => (
              <Space size="small">
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={() => {
                    setEditingSupplier(record);
                    setIsEditModalOpen(true);
                    editForm.setFieldsValue({
                      id: record.id,
                      name: record.name,
                      email: record.email,
                      phone: record.phone,
                      adress: record.adress,
                      country: record.country,
                      productIds: record.productIds,
                      ordersIds: record.ordersIds,
                    });
                  }}
                  style={{ borderRadius: '6px',backgroundColor: AppColors.success,borderColor: AppColors.success}}
                >
                  Edit
                </Button>
                <Popconfirm
                  title="Delete Supplier"
                  description="Are you sure you want to delete this supplier?"
                  onConfirm={() => handleDeleteSupplier(record.id)}
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

  const SupplierFormFields = () => (
    <>
      <Form.Item
        label="Supplier Name"
        name="name"
        rules={[
          { required: true, message: 'Please enter supplier name' },
          { min: 2, message: 'Name must be at least 2 characters' },
        ]}
      >
        <Input placeholder="Supplier Name" prefix={<ShopOutlined />} />
      </Form.Item>

      <Form.Item
        label="Email"
        name="email"
        rules={[
          { required: true, message: 'Please enter email' },
          { type: 'email', message: 'Invalid email' },
        ]}
      >
        <Input placeholder="Email" />
      </Form.Item>

      <Form.Item
        label="Phone"
        name="phone"
        rules={[{ required: true, message: 'Please enter phone' }]}
      >
        <Input placeholder="Phone" />
      </Form.Item>

      <Form.Item
        label="Address"
        name="adress"
        rules={[{ required: true, message: 'Please enter address' }]}
      >
        <TextArea rows={2} placeholder="Address" />
      </Form.Item>

      <Form.Item
        label="Country"
        name="country"
        rules={[{ required: true, message: 'Please enter country' }]}
      >
        <Input placeholder="Country" />
      </Form.Item>

    </>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f5', padding: '24px' }}>
    <style>{`
      .ant-input-affix-wrapper:hover,
      .ant-input-affix-wrapper:focus-within {
        border-color: ${AppColors.primary} !important;
        box-shadow: 0 0 0 2px ${AppColors.primary}20 !important;
      }
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

      /* Footer buttons (default) */
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
        background-color: ${AppColors.primary}Light !important; /* fallback if you define a named light; if not, will be ignored */
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

      /* Arrows (prev month, next month) */
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Title level={2}>Suppliers</Title>
                <Text type="secondary">
                  Manage supplier information
                  {isAdmin && <Tag color="red">Admin</Tag>}
                </Text>
              </div>
              {isAdmin && (
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setIsAddModalOpen(true)}
                  
                  style={{ backgroundColor: AppColors.success,borderColor: AppColors.success,}}
                >
                  Add Supplier
                </Button>
              )}
            </div>
          </Card>

          <Card>
            <Table
              columns={columns}
              dataSource={suppliers}
              rowKey="id"
              loading={isLoading}
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </Space>

        <Modal
          title="Add Supplier"
          open={isAddModalOpen}
          onCancel={handleAddCancel}
          footer={null}
        >
          <Form form={addForm} layout="vertical" onFinish={handleAddSubmit}>
            <SupplierFormFields />
            <Form.Item>
              <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                <Button onClick={handleAddCancel} className='custom-button-default'>Cancel</Button>
                <Button type="primary" htmlType="submit" loading={createMutation.isPending} 
                  style={{ backgroundColor: AppColors.success,borderColor: AppColors.success,}}>
                  Create Supplier
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>

        <Modal
          title="Edit Supplier"
          open={isEditModalOpen}
          onCancel={handleEditCancel}
          footer={null}
        >
          <Form form={editForm} layout="vertical" onFinish={handleEditSubmit}>
            <SupplierFormFields />
            <Form.Item>
              <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                <Button onClick={handleEditCancel} className='custom-button-default'>Cancel</Button>
                <Button type="primary" htmlType="submit" loading={updateMutation.isPending} 
                  style={{ backgroundColor: AppColors.success,borderColor: AppColors.success,}}>
                  Update Supplier
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
}
