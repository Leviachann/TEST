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
  InputNumber,
  Select,
  DatePicker,
  Card,
  Typography,
  Tag,
  Popconfirm,
  App,
  Row,
  Col,
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsApi, categoriesApi, suppliersApi, inventoriesApi} from '../api';
import type { Product, ProductFormData } from '../types/entities';
import { useAuthStore } from '../store/authStore';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { AppColors } from '../constants/colors';

const { Title, Text } = Typography;
const formatDate = (date: string, showNever = false): string => {
  if (!date) return showNever ? 'Never' : '-';
  
  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime()) || dateObj.getFullYear() < 1900) {
      return showNever ? 'Never' : '-';
    }
    
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return showNever ? 'Never' : '-';
  }
};

export default function Products() {
  const { message: messageApi } = App.useApp();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === 'Admin';

  const { data: inventories } = useQuery({
  queryKey: ['inventories'],
  queryFn: inventoriesApi.getAll,
  });
  const { data: products, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: productsApi.getAll,
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.getAll,
  });

  const { data: suppliers } = useQuery({
    queryKey: ['suppliers'],
    queryFn: suppliersApi.getAll,
  });
  const inventoryMap = inventories?.reduce((acc, inv) => {
  acc[inv.productId] = inv;
    return acc;
  }, {} as Record<string, { currentStock: number; reorderLevel: number }>);
  const createMutation = useMutation({
    mutationFn: productsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      messageApi.success('Product created successfully!');
      setIsAddModalOpen(false);
      addForm.resetFields();
    },
    onError: (error: any) => {
      console.error('Create error:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.title ||
                          'Failed to create product';
      messageApi.error(errorMessage);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ProductFormData }) =>
      productsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      messageApi.success('Product updated successfully!');
      setIsEditModalOpen(false);
      setEditingProduct(null);
      editForm.resetFields();
    },
    onError: (error: any) => {
      console.error('Update error:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.title ||
                          'Failed to update product';
      messageApi.error(errorMessage);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: productsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      messageApi.success('Product deleted successfully!');
    },
    onError: (error: any) => {
      console.error('Delete error:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.title ||
                          'Failed to delete product';
      messageApi.error(errorMessage);
    },
  });

  const handleAddProduct = () => {
    setIsAddModalOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    editForm.setFieldsValue({
      name: product.name,
      description: product.description,
      sku: product.sku,
      price: product.price,
      salePrice: product.salePrice,
      height: product.height,
      width: product.width,
      length: product.length,
      weight: product.weight,
      countryOfOrigin: product.countryOfOrigin,
      productionDate: product.productionDate ? dayjs(product.productionDate) : null,
      expirationDate: product.expirationDate ? dayjs(product.expirationDate) : null,
      categoryId: product.categoryId,
      supplierId: product.supplierId,
    });
    setIsEditModalOpen(true);
  };

  const handleDeleteProduct = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleAddSubmit = async (values: any) => {
    const formData: ProductFormData = {
      ...values,
      productionDate: values.productionDate ? values.productionDate.toISOString() : null,
      expirationDate: values.expirationDate ? values.expirationDate.toISOString() : null,
      orderLineIds: [],
    };
    createMutation.mutate(formData);
  };

  const handleEditSubmit = async (values: any) => {
    if (editingProduct) {
      const formData: ProductFormData = {
        ...values,
        id: editingProduct.id,
        productionDate: values.productionDate ? values.productionDate.toISOString() : null,
        expirationDate: values.expirationDate ? values.expirationDate.toISOString() : null,
        orderLineIds: [],
        
      };
      updateMutation.mutate({ id: editingProduct.id, data: formData });

    }
  };

  const handleAddCancel = () => {
    setIsAddModalOpen(false);
    addForm.resetFields();
  };

  const handleEditCancel = () => {
    setIsEditModalOpen(false);
    setEditingProduct(null);
    editForm.resetFields();
  };

  const columns: ColumnsType<Product> = [
    {
      title: 'SKU',
      dataIndex: 'sku',
      key: 'sku',
      width: '10%',
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: 'Product Name',
      dataIndex: 'name',
      key: 'name',
      width: '20%',
      render: (text: string) => <Text strong style={{ fontSize: '16px' }}>{text}</Text>,
    },
    {
      title: 'Category',
      key: 'category',
      width: '12%',
      render: (_: any, record: Product) => {
        const category = categories?.find(cat => cat.id === record.categoryId);
        return <Tag color="blue">{category?.name || 'N/A'}</Tag>;
      },
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      width: '10%',
      render: (price: number) => (
        <Text strong style={{ color: '#52c41a' }}>
          ${price.toFixed(2)}
        </Text>
      ),
    },
    {
      title: 'Sale Price',
      dataIndex: 'salePrice',
      key: 'salePrice',
      width: '10%',
      render: (salePrice: number, record: Product) => {
        const isOnSale = salePrice < record.price;
        return (
          <Text strong style={{ color: isOnSale ? '#ff4d4f' : '#8c8c8c' }}>
            ${salePrice.toFixed(2)}
            {isOnSale && <Tag color="red" style={{ marginLeft: 4 }}>SALE</Tag>}
          </Text>
        );
      },
    },
    {
      title: 'Stock',
      key: 'stock',
      width: '8%',
      render: (_, record: Product) => {
        const inv = inventoryMap?.[record.id];
        const quantity = inv?.currentStock ?? 0;
        const reorderPoint = inv?.reorderLevel ?? 0;
        const isLow = quantity <= reorderPoint;
        return (
          <Tag color={isLow ? 'orange' : 'green'}>
            {quantity} {isLow && isLow ? '⚠️' : ''}
          </Tag>
        );
      },
    },
    {
      title: 'Expiration',
      dataIndex: 'expirationDate',
      key: 'expirationDate',
      width: '12%',
      render: (date: string) => {
        if (!date) return <Text type="secondary">-</Text>;
        const expirationDate = new Date(date);
        const today = new Date();
        const isExpired = expirationDate < today;
        const isValid = !isNaN(expirationDate.getTime()) && expirationDate.getFullYear() >= 1900;
        
        if (!isValid) return <Text type="secondary">-</Text>;
        
        return (
          <Text type={isExpired ? 'danger' : 'secondary'}>
            {formatDate(date)}
            {isExpired && <Tag color="red" style={{ marginLeft: 4 }}>EXPIRED</Tag>}
          </Text>
        );
      },
    },
    ...(isAdmin
      ? [
          {
            title: 'Actions',
            key: 'actions',
            width: '18%',
            render: (_: any, record: Product) => (
              <Space size="small">
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={() => handleEditProduct(record)}
                  style={{ borderRadius: '6px', backgroundColor: AppColors.success,borderColor: AppColors.success}}
                >
                  Edit
                </Button>
                <Popconfirm
                  title="Delete Product"
                  description="Are you sure you want to delete this product?"
                  onConfirm={() => handleDeleteProduct(record.id)}
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

  const ProductFormFields = () => (
    <>
      
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Product Name"
            name="name"
            rules={[
              { required: true, message: 'Please enter product name' },
              { min: 2, message: 'Name must be at least 2 characters' },
            ]}
          >
            <Input placeholder="Enter product name" size="large" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="SKU"
            name="sku"
            rules={[
              { required: true, message: 'Please enter SKU' },
            ]}
          >
            <Input placeholder="Enter SKU" size="large" />
          </Form.Item>
        </Col>
      </Row>

      
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Price"
            name="price"
            rules={[
              { required: true, message: 'Please enter price' },
              { type: 'number', min: 0, message: 'Price must be positive' },
            ]}
          >
            <InputNumber
              placeholder="0.00"
              size="large"
              style={{ width: '100%' }}
              precision={2}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="Sale Price"
            name="salePrice"
            rules={[
              { required: true, message: 'Please enter sale price' },
              { type: 'number', min: 0, message: 'Sale price must be positive' },
            ]}
          >
            <InputNumber
              placeholder="0.00"
              size="large"
              style={{ width: '100%' }}
              precision={2}
            />
          </Form.Item>
        </Col>
      </Row>

      
      <Row gutter={16}>
        <Col span={12}>
          <Row gutter={8}>
            <Col span={8}>
              <Form.Item
                label="Height"
                name="height"
                rules={[{ required: true, message: 'Required' }]}
              >
                <InputNumber
                  placeholder="cm"
                  size="large"
                  style={{ width: '100%' }}
                  min={0}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Width"
                name="width"
                rules={[{ required: true, message: 'Required' }]}
              >
                <InputNumber
                  placeholder="cm"
                  size="large"
                  style={{ width: '100%' }}
                  min={0}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Length"
                name="length"
                rules={[{ required: true, message: 'Required' }]}
              >
                <InputNumber
                  placeholder="cm"
                  size="large"
                  style={{ width: '100%' }}
                  min={0}
                />
              </Form.Item>
            </Col>
          </Row>
        </Col>
        <Col span={12}>
          <Form.Item
            label="Weight (kg)"
            name="weight"
            rules={[{ required: true, message: 'Please enter weight' }]}
          >
            <InputNumber
              placeholder="kg"
              size="large"
              style={{ width: '100%' }}
              min={0}
              precision={2}
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={24}>
          <Form.Item
            label="Country of Origin"
            name="countryOfOrigin"
            rules={[{ required: true, message: 'Please enter country of origin' }]}
          >
            <Input placeholder="Enter country of origin" size="large" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Production Date"
            name="productionDate"
            rules={[{ required: true, message: 'Please select production date' }]}
          >
            <DatePicker 
              style={{ width: '100%' }} 
              size="large"
              format="YYYY-MM-DD"
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="Expiration Date"
            name="expirationDate"
          >
            <DatePicker 
              style={{ width: '100%' }} 
              size="large"
              format="YYYY-MM-DD"
            />
          </Form.Item>
        </Col>
      </Row>
      
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Category"
            name="categoryId"
            rules={[{ required: true, message: 'Please select category' }]}
          >
            <Select
              placeholder="Select category"
              size="large"
              showSearch
              optionFilterProp="children"
            >
              {categories?.map(category => (
                <Select.Option key={category.id} value={category.id}>
                  {category.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="Supplier"
            name="supplierId"
            rules={[{ required: true, message: 'Please select supplier' }]}
          >
            <Select
              placeholder="Select supplier"
              size="large"
              showSearch
              optionFilterProp="children"
            >
              {suppliers?.map(supplier => (
                <Select.Option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>
    </>
  );

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f0f2f5',
        padding: '24px',
      }}
    >
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
              .ant-input-affix-wrapper:hover,
      .ant-input-affix-wrapper:focus-within {
        border-color: ${AppColors.primary} !important;
        box-shadow: 0 0 0 2px ${AppColors.primary}20 !important;
      }

      .ant-input-textarea:hover .ant-input,
      .ant-input-textarea:focus-within .ant-input {
        border-color: ${AppColors.primary} !important;
        box-shadow: 0 0 0 2px ${AppColors.primary}20 !important;
      }

      .ant-input-number:hover,
      .ant-input-number:focus,
      .ant-input-number-focused {
        border-color: ${AppColors.primary} !important;
        box-shadow: 0 0 0 2px ${AppColors.primary}33 !important;
      }

      .ant-input-number-input:hover {
        border-color: ${AppColors.primary} !important;
      }

      .ant-input-number-handler:hover {
        color: ${AppColors.primary} !important;
        border-color: ${AppColors.primary} !important;
      }

      .ant-form-item-has-error .ant-input-number {
        border-color: red !important;
      }

      .ant-input-number-input {
        caret-color: ${AppColors.primary} !important;
      }

      .ant-input-number-outlined:hover,
      .ant-input-number:hover:not(.ant-input-number-disabled) {
        border-color: ${AppColors.primary} !important;
      }

      .ant-input-number-outlined.ant-input-number-focused,
      .ant-input-number.ant-input-number-focused {
        border-color: ${AppColors.primary} !important;
        box-shadow: 0 0 0 2px ${AppColors.primary}20 !important;
      }

      .ant-input-number-input {
        caret-color: ${AppColors.primary} !important;
      }

      .ant-input-number-handler-wrap .ant-input-number-handler:hover .ant-input-number-handler-up-inner,
      .ant-input-number-handler-wrap .ant-input-number-handler:hover .ant-input-number-handler-down-inner {
        color: ${AppColors.primary} !important;
      }


      .ant-input-number-status-success,
      .ant-input-number-status-warning,
      .ant-input-number-status-error {
        box-shadow: none !important;
      }

      .ant-input-number-input:not(:placeholder-shown) {
        border-color: ${AppColors.primary} !important;
        box-shadow: 0 0 0 2px ${AppColors.primary}20 !important;
      }
      .ant-input-number-input:not(:placeholder-shown),
      .ant-input-number:not(.ant-input-number-focused):not(:hover) .ant-input-number-input:not(:placeholder-shown) {
        border-color: ${AppColors.primary} !important;
        box-shadow: 0 0 0 2px ${AppColors.primary}20 !important;
      }
      .ant-input-number-input {
        border-color: ${AppColors.primary} !important;
        box-shadow: 0 0 0 2px ${AppColors.primary}20 !important;
        caret-color: ${AppColors.primary} !important;
      }

      .ant-input-number-input:focus {
        border-color: ${AppColors.primary} !important;
        box-shadow: 0 0 0 2px ${AppColors.primary}33 !important;
      }

      .ant-input-number-focused {
        border-color: ${AppColors.primary} !important;
        box-shadow: 0 0 0 2px ${AppColors.primary}33 !important;
      }

      .ant-input-number:hover,
      .ant-input-number:focus {
        border-color: ${AppColors.primary} !important;
        box-shadow: 0 0 0 2px ${AppColors.primary}33 !important;
      }


    `}</style>
      <div style={{ maxWidth: '1800px', margin: '0 auto' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Card>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <Title level={2} style={{ margin: 0 }}>
                  Products
                </Title>
                <Text type="secondary" style={{ fontSize: '16px' }}>
                  Manage product inventory
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
                  onClick={handleAddProduct}
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
                  Add Product
                </Button>
              )}
            </div>
          </Card>

          <Card>
            <Table
              columns={columns}
              dataSource={products}
              rowKey="id"
              loading={isLoading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Total ${total} products`,
              }}
              scroll={{ x: 1400 }}
            />
          </Card>
        </Space>

        <Modal
          title={
            <span style={{ fontSize: '20px', fontWeight: 600 }}>
              <PlusOutlined style={{ marginRight: '8px', color:AppColors.primary}} />
              Add New Product
            </span>
          }
          open={isAddModalOpen}
          onCancel={handleAddCancel}
          footer={null}
          width={900}
          destroyOnHidden
        >
          <Form
            form={addForm}
            layout="vertical"
            onFinish={handleAddSubmit}
            style={{ marginTop: '24px' }}
          >
            <ProductFormFields />

            <Form.Item style={{ marginBottom: 0, marginTop: '32px' }}>
              <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                <Button size="large" onClick={handleAddCancel} className='custom-button-default'>
                  Cancel
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  loading={createMutation.isPending}
                  icon={<PlusOutlined />}
                  style={{ backgroundColor: AppColors.success,borderColor: AppColors.success,}}
                >
                  Create Product
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>

        <Modal
          title={
            <span style={{ fontSize: '20px', fontWeight: 600 }}>
              <EditOutlined style={{ marginRight: '8px', color:AppColors.primary }} />
              Edit Product
            </span>
          }
          open={isEditModalOpen}
          onCancel={handleEditCancel}
          footer={null}
          width={900}
          destroyOnHidden
        >
          <Form
            form={editForm}
            layout="vertical"
            onFinish={handleEditSubmit}
            style={{ marginTop: '24px' }}
          >
            <ProductFormFields />

            <Form.Item style={{ marginBottom: 0, marginTop: '32px' }}>
              <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                <Button size="large" onClick={handleEditCancel} className='custom-button-default'>
                  Cancel
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  loading={updateMutation.isPending}
                  icon={<EditOutlined />}
                  
                  style={{ backgroundColor: AppColors.success,borderColor: AppColors.success,}}
                >
                  Update Product
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
}