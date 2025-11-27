/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo } from 'react';
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  InputNumber,
  Select,
  App,
  Tag,
  Popconfirm,
  Card,
  Typography,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  WarningOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoriesApi, productsApi, locationsApi } from '../api';
import type { Inventory, InventoryFormData } from '../types/entities';
import { formatDate } from '../utils/dateFormatter';
import { useAuthStore } from '../store/authStore';
import type { ColumnsType } from 'antd/es/table';
import { AppColors } from '../constants/colors';

const { Title, Text } = Typography;

export default function Inventories() {
  const { message: messageApi } = App.useApp();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingInventory, setEditingInventory] = useState<Inventory | null>(null);
  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === 'Admin';

  const { data: inventories, isLoading } = useQuery({
    queryKey: ['inventories'],
    queryFn: inventoriesApi.getAll,
  });

  const { data: products } = useQuery({
    queryKey: ['products'],
    queryFn: productsApi.getAll,
  });

  const { data: locations } = useQuery({
    queryKey: ['locations'],
    queryFn: locationsApi.getAll,
  });

  const locationIdToRackName = useMemo(() => {
    const map: Record<string, string> = {};
    locations?.forEach((loc) => {
      map[loc.id] = loc.rack?.name || '';
    });
    return map;
  }, [locations]);

  const createMutation = useMutation({
    mutationFn: (data: InventoryFormData) => inventoriesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventories'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      messageApi.success('Inventory created successfully!');
      setIsAddModalOpen(false);
      addForm.resetFields();
    },
    onError: (error: any) => {
      console.error('Create error:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.title ||
        'Failed to create inventory';
      messageApi.error(errorMessage);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: InventoryFormData }) =>
      inventoriesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventories'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      messageApi.success('Inventory updated successfully!');
      setIsEditModalOpen(false);
      setEditingInventory(null);
      editForm.resetFields();
    },
    onError: (error: any) => {
      console.error('Update error:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.title ||
        'Failed to update inventory';
      messageApi.error(errorMessage);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: inventoriesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventories'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      messageApi.success('Inventory deleted successfully!');
    },
    onError: (error: any) => {
      console.error('Delete error:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.title ||
        'Failed to delete inventory';
      messageApi.error(errorMessage);
    },
  });

  const handleDeleteInventory = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleAddSubmit = async (values: InventoryFormData) => {
    createMutation.mutate(values);
  };

  const handleEditSubmit = async (values: InventoryFormData) => {
    if (editingInventory) {
      updateMutation.mutate({
        id: editingInventory.id,
        data: { ...values, id: editingInventory.id },
      });
    }
  };

  const handleAddCancel = () => {
    setIsAddModalOpen(false);
    addForm.resetFields();
  };

  const handleEditCancel = () => {
    setIsEditModalOpen(false);
    setEditingInventory(null);
    editForm.resetFields();
  };

  const columns: ColumnsType<Inventory> = [
    {
      title: 'Product Name',
      dataIndex: 'productId',
      key: 'productName',
      width: '15%',
      render: (productId: string) => {
        const product = products?.find((p) => p.id === productId);
        return <Text strong style={{ fontSize: '16px' }}>{product?.name || 'Unknown Product'}</Text>;
      },
    },
    {
      title: 'SKU',
      dataIndex: 'productId',
      key: 'productSku',
      width: '10%',
      render: (productId: string) => {
        const product = products?.find((p) => p.id === productId);
        return <code>{product?.sku || 'N/A'}</code>;
      },
    },
    {
      title: 'Quantity',
      dataIndex: 'currentStock', 
      key: 'currentStock',
      width: '12%',
      render: (currentStock: number, record: Inventory) => {
        const isLow = currentStock <= record.reorderLevel;
        return (
          <Space>
            <Tag color={isLow ? 'red' : 'green'}>
              {currentStock} units
            </Tag>
            {isLow && <WarningOutlined style={{ color: '#ff4d4f' }} />}
          </Space>
        );
      },
    },
    {
      title: 'Rack',
      dataIndex: 'locationId',
      key: 'rack',
      width: '15%',
    render: (locationId: string) => {
      const rackName = locationIdToRackName[locationId];
      return <Text>{rackName ? rackName : ''}</Text>;
    },
    },
    {
      title: 'Reorder Level',
      dataIndex: 'reorderLevel',
      key: 'reorderLevel',
      width: '10%',
      render: (level: number) => <Text type="secondary">{level} units</Text>,
    },
    {
      title: 'Reorder Qty',
      dataIndex: 'reorderLevel',
      key: 'reorderLevel',
      width: '10%',
      render: (qty: number) => <Text type="secondary">{qty} units</Text>,
    },
    {
      title: 'Created',
      dataIndex: 'createdDate',
      key: 'createdDate',
      width: '10%',
      render: (date: string) => <Text type="secondary">{formatDate(date)}</Text>,
    },
    {
      title: 'Updated',
      dataIndex: 'updatedDate',
      key: 'updatedDate',
      width: '10%',
      render: (date: string) => <Text type="secondary">{formatDate(date, true)}</Text>,
    },
    ...(isAdmin
      ? [
          {
            title: 'Actions',
            key: 'actions',
            width: '15%',
            render: (_: any, record: Inventory) => (
              <Space size="small">
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={() => {
                    setEditingInventory(record);
                    setIsEditModalOpen(true);
                    editForm.setFieldsValue({
                      productId: record.productId,
                      currentStock: record.currentStock,
                      locationId: record.locationId,
                      reorderLevel: record.reorderLevel,
                    });
                  }}
                  style={{ borderRadius: '6px', backgroundColor: AppColors.success,borderColor: AppColors.success}}
                >
                  Edit
                </Button>
                <Popconfirm
                  title="Delete Inventory"
                  description="Are you sure you want to delete this inventory record?"
                  onConfirm={() => handleDeleteInventory(record.id)}
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

  const InventoryFormFields = () => (
    <>
      <Form.Item
        label="Product"
        name="productId"
        rules={[{ required: true, message: 'Please select a product' }]}
      >
        <Select
          placeholder="Select a product"
          showSearch
          optionFilterProp="children"
          filterOption={(input, option) =>
            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
          }
          options={products?.map((product) => ({
            value: product.id,
            label: `${product.name} (${product.sku})`,
          }))}
        />
      </Form.Item>

      <Form.Item
        label="Quantity"
        name="currentStock"
        rules={[
          { required: true, message: 'Please enter quantity' },
          { type: 'number', min: 0, message: 'Quantity must be 0 or greater' },
        ]}
      >
        <InputNumber
          style={{ width: '100%' }}
          placeholder="Enter quantity"
          min={0}
        />
      </Form.Item>

      <Form.Item
        label="Location"
        name="locationId"
        rules={[{ required: true, message: 'Please select a location' }]}
        tooltip="Select the warehouse location"
      >
        <Select
          placeholder="Select a location"
          showSearch
          optionFilterProp="children"
          filterOption={(input, option) =>
            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
          }
          options={locations?.map((location) => {
            const namePart = location.name ? location.name : '';
            const rackPart = location.rack?.name ? ` - ${location.rack.name}` : '';
            return {
              value: location.id,
              label: `${namePart}${rackPart} (Row ${location.row}, Grid ${location.grid})`,
            };
          })}
        />
      </Form.Item>


      <Form.Item
        label="Reorder Level"
        name="reorderLevel"
        rules={[
          { required: true, message: 'Please enter reorder level' },
          { type: 'number', min: 0, message: 'Reorder level must be 0 or greater' },
        ]}
        tooltip="Alert when quantity falls to or below this level"
      >
        <InputNumber
          style={{ width: '100%' }}
          placeholder="Enter reorder level"
          min={0}
        />
      </Form.Item>

      <Form.Item
        label="Reorder Quantity"
        name="reorderLevel"
        rules={[
          { required: true, message: 'Please enter reorder quantity' },
          { type: 'number', min: 1, message: 'Reorder quantity must be at least 1' },
        ]}
        tooltip="How many units to order when restocking"
      >
        <InputNumber
          style={{ width: '100%' }}
          placeholder="Enter reorder quantity"
          min={1}
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
                <Title level={2}>Inventories</Title>
                <Text type="secondary">
                  Manage inventory stock levels and locations
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
                  Add Inventory
                </Button>
              )}
            </div>
          </Card>

          <Card>
            <Table
              columns={columns}
              dataSource={inventories}
              rowKey="id"
              loading={isLoading}
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </Space>

        <Modal
          title="Add Inventory"
          open={isAddModalOpen}
          onCancel={handleAddCancel}
          footer={null}
        >
          <Form form={addForm} layout="vertical" onFinish={handleAddSubmit}>
            <InventoryFormFields />
            <Form.Item>
              <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                <Button onClick={handleAddCancel} className="custom-button-default">Cancel</Button>
                <Button type="primary" htmlType="submit" loading={createMutation.isPending} 
                  style={{ backgroundColor: AppColors.success,borderColor: AppColors.success,}}>
                  Create Inventory
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>

        <Modal
          title="Edit Inventory"
          open={isEditModalOpen}
          onCancel={handleEditCancel}
          footer={null}
        >
          <Form form={editForm} layout="vertical" onFinish={handleEditSubmit}>
            <InventoryFormFields />
            <Form.Item>
              <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                <Button onClick={handleEditCancel} className="custom-button-default">Cancel</Button>
                <Button type="primary" htmlType="submit" loading={updateMutation.isPending}
                  style={{ backgroundColor: AppColors.success,borderColor: AppColors.success,}}>
                  Update Inventory
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
}
