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
  App
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined,
  ExclamationCircleOutlined,
  AppstoreOutlined
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoriesApi } from '../api';
import type { Category, CategoryFormData } from '../types/entities';
import { useAuthStore } from '../store/authStore';
import type { ColumnsType } from 'antd/es/table';
import { AppColors } from '../constants/colors';

const { Title, Text } = Typography;

const formatDate = (date: string, showNever = false): string => {
  if (!date) return showNever ? 'Never' : '-';
  
  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime()) || dateObj.getFullYear() < 1900) {
      return showNever ? 'Never' : '-';
    }
    
    return dateObj.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return showNever ? 'Never' : '-';
  }
};

export default function Categories() {
  const { message: messageApi } = App.useApp();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === 'Admin';

  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: categoriesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      messageApi.success('Category created successfully!');
      setIsAddModalOpen(false);
      addForm.resetFields();
    },
    onError: (error: any) => {
      console.error('Create error:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.title ||
                          'Failed to create category';
      messageApi.error(errorMessage);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CategoryFormData }) =>
      categoriesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      messageApi.success('Category updated successfully!');
      setIsEditModalOpen(false);
      setEditingCategory(null);
      editForm.resetFields();
    },
    onError: (error: any) => {
      console.error('Update error:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.title ||
                          'Failed to update category';
      messageApi.error(errorMessage);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: categoriesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      messageApi.success('Category deleted successfully!');
    },
    onError: (error: any) => {
      console.error('Delete error:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.title ||
                          'Failed to delete category';
      messageApi.error(errorMessage);
    },
  });

  const handleAddCategory = () => {
    setIsAddModalOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    editForm.setFieldsValue({
      name: category.name,
    });
    setIsEditModalOpen(true);
  };

  const handleDeleteCategory = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleAddSubmit = async (values: CategoryFormData) => {
    console.log('Creating category with values:', values);
    createMutation.mutate(values);
  };

  const handleEditSubmit = async (values: CategoryFormData) => {
    if (editingCategory) {
      console.log('Updating category:', editingCategory.id, 'with values:', values);
      updateMutation.mutate({ id: editingCategory.id, data: values });
    }
  };

  const handleAddCancel = () => {
    setIsAddModalOpen(false);
    addForm.resetFields();
  };

  const handleEditCancel = () => {
    setIsEditModalOpen(false);
    setEditingCategory(null);
    editForm.resetFields();
  };

  const columns: ColumnsType<Category> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: '40%',
      render: (text: string) => <Text strong style={{ fontSize: '16px' }}>{text}</Text>,
    },
    {
      title: 'Created',
      dataIndex: 'createdDate',
      key: 'createdDate',
      width: '25%',
      render: (date: string) => (
        <Text type="secondary" style={{ fontSize: '14px' }}>
          {formatDate(date)}
        </Text>
      ),
    },
    {
      title: 'Updated',
      dataIndex: 'updatedDate',
      key: 'updatedDate',
      width: '25%',
      render: (date: string) => (
        <Text type="secondary" style={{ fontSize: '14px' }}>
          {formatDate(date, true)}
        </Text>
      ),
    },
    ...(isAdmin
      ? [
          {
            title: 'Actions',
            key: 'actions',
            width: '20%',
            render: (_: any, record: Category) => (
              <Space size="small">
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={() => handleEditCategory(record)}
                  style={{ borderRadius: '6px', backgroundColor: AppColors.success, borderColor: AppColors.success }}
                >
                  Edit
                </Button>
                <Popconfirm
                  title="Delete Category"
                  description="Are you sure you want to delete this category?"
                  onConfirm={() => handleDeleteCategory(record.id)}
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

  const CategoryFormFields = () => (
    <>
      <Form.Item
        label="Category Name"
        name="name"
        rules={[
          { required: true, message: 'Please enter category name' },
          { min: 2, message: 'Name must be at least 2 characters' },
          { max: 100, message: 'Name must not exceed 100 characters' },
        ]}
      >
        <Input
          placeholder="Category Name"
          prefix={<AppstoreOutlined />}
        />
      </Form.Item>
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

        .ant-input:hover,
        .ant-input:focus,
        .ant-input-affix-wrapper:hover,
        .ant-input-affix-wrapper:focus-within {
          border-color: ${AppColors.primary} !important;
          box-shadow: 0 0 0 2px ${AppColors.primary}20 !important;
        }
      `}</style>

      <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Title level={2} style={{ margin: 0 }}>Categories</Title>
                <Text type="secondary" style={{ fontSize: '16px' }}>
                  Manage product categories
                  {isAdmin && (
                    <Tag color="red" style={{ marginLeft: '12px', fontSize: '14px' }}>
                      Admin
                    </Tag>
                  )}
                </Text>
              </div>
              {isAdmin && (
                <Button
                  type="primary"
                  size="large"
                  icon={<PlusOutlined />}
                  onClick={handleAddCategory}
                  style={{
                    height: '48px',
                    fontSize: '16px',
                    borderRadius: '8px',
                    paddingLeft: '24px',
                    paddingRight: '24px',
                    backgroundColor: AppColors.success,
                    borderColor: AppColors.success,
                  }}
                >
                  Add Category
                </Button>
              )}
            </div>
          </Card>

          <Card>
            <Table
              columns={columns}
              dataSource={categories}
              rowKey="id"
              loading={isLoading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Total ${total} categories`,
              }}
              style={{ fontSize: '16px' }}
            />
          </Card>
        </Space>

        <Modal
          title="Add Category"
          open={isAddModalOpen}
          onCancel={handleAddCancel}
          footer={null}
          width={600}
          destroyOnHidden
        >
          <Form
            form={addForm}
            layout="vertical"
            onFinish={handleAddSubmit}
            style={{ marginTop: '24px' }}
          >
            <CategoryFormFields />

            <Form.Item style={{ marginBottom: 0, marginTop: '32px' }}>
              <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                <Button size="large" onClick={handleAddCancel} className="custom-button-default">
                  Cancel
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  loading={createMutation.isPending}
                  icon={<PlusOutlined />}
                  style={{
                    backgroundColor: AppColors.success,
                    borderColor: AppColors.success,
                  }}
                >
                  Create Category
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>

        <Modal
          title="Edit Category"
          open={isEditModalOpen}
          onCancel={handleEditCancel}
          footer={null}
          width={600}
          destroyOnHidden
        >
          <Form
            form={editForm}
            layout="vertical"
            onFinish={handleEditSubmit}
            style={{ marginTop: '24px' }}
          >
            <CategoryFormFields />

            <Form.Item style={{ marginBottom: 0, marginTop: '32px' }}>
              <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                <Button size="large" onClick={handleEditCancel} className="custom-button-default">
                  Cancel
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  loading={updateMutation.isPending}
                  icon={<EditOutlined />}
                  style={{
                    backgroundColor: AppColors.success,
                    borderColor: AppColors.success,
                  }}
                >
                  Update Category
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
}