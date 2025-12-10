/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  InputNumber,
  Select,
  DatePicker,
  App,
  Tag,
  Popconfirm,
  Card,
  Typography,
  Divider,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  MinusCircleOutlined,
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi, suppliersApi, productsApi } from '../api';
import type { Order, ArrivalStatus } from '../types/entities';
import { formatDate } from '../utils/dateFormatter';
import { useAuthStore } from '../store/authStore';
import type { ColumnsType } from 'antd/es/table';
import dayjs, { Dayjs } from 'dayjs';
import { AppColors } from '../constants/colors';

const { Title, Text } = Typography;

type OrderLinePayload = {
  productId: string;
  quantityOrdered: number;
  priceAtOrder: number;
};

type CreateOrderPayload = {
  orderDate: string;
  arrivalTime?: string | null;
  orderArrivalStatus: number;
  supplierId: string;
  orderLines: OrderLinePayload[];
};

type UpdateOrderPayload = CreateOrderPayload;

export default function Orders() {
  const { message: messageApi } = App.useApp();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [selectedSupplier, setSelectedSupplier] = useState<string | null>(null);
  const [editSupplier, setEditSupplier] = useState<string | null>(null);
  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const canManageOrders = user?.role === 'Admin' || user?.role === 'Moderator';


  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: ordersApi.getAll,
  });

  const { data: suppliers } = useQuery({
    queryKey: ['suppliers'],
    queryFn: suppliersApi.getAll,
  });

  const { data: products } = useQuery({
    queryKey: ['products'],
    queryFn: productsApi.getAll,
  });

  const filteredProducts = products?.filter(p => p.supplierId === selectedSupplier);
  const filteredEditProducts = products?.filter(p => p.supplierId === editSupplier);

  const statusMap: Record<ArrivalStatus, number> = {
    Pending: 0,
    Ordered: 1,
    Shipping: 2,
    Arrived: 3,
  };

  const statusLabelByNumber: Record<number, string> = {
    0: 'Pending',
    1: 'Ordered',
    2: 'Shipping',
    3: 'Arrived',
  };

  const createMutation = useMutation({
    mutationFn: (payload: CreateOrderPayload) => ordersApi.create(payload as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      messageApi.success('Order created successfully!');
      setIsAddModalOpen(false);
      addForm.resetFields();
      setSelectedSupplier(null);
    },
    onError: (error: any) => {
      console.error('Create error:', error);
      messageApi.error(
        error?.response?.data?.message ||
          error?.response?.data?.title ||
          'Failed to create order'
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateOrderPayload }) =>
      ordersApi.update(id, payload as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      messageApi.success('Order updated successfully!');
      setIsEditModalOpen(false);
      setEditingOrder(null);
      editForm.resetFields();
      setEditSupplier(null);
    },
    onError: (error: any) => {
      console.error('Update error:', error);
      messageApi.error(
        error?.response?.data?.message ||
          error?.response?.data?.title ||
          'Failed to update order'
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => ordersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      messageApi.success('Order deleted successfully!');
    },
    onError: (error: any) => {
      console.error('Delete error:', error);
      messageApi.error(
        error?.response?.data?.message ||
          error?.response?.data?.title ||
          'Failed to delete order'
      );
    },
  });

  const handleDeleteOrder = (id: string) => deleteMutation.mutate(id);

  const buildPayloadFromFormValues = (values: any): CreateOrderPayload => {
    const orderDateIso = values.orderDate instanceof dayjs
      ? (values.orderDate as Dayjs).toISOString()
      : new Date(values.orderDate).toISOString();
    const arrivalTimeIso =
      values.arrivalTime &&
      (values.arrivalTime instanceof dayjs
        ? (values.arrivalTime as Dayjs).toISOString()
        : new Date(values.arrivalTime).toISOString());

    const statusKey = values.orderArrivalStatus as ArrivalStatus;
    const numericStatus = statusMap[statusKey] ?? 0;

    const lines: OrderLinePayload[] = (values.orderLines || []).map((line: any) => ({
      productId: line.productId,
      quantityOrdered: Number(line.quantityOrdered) || 0,
      priceAtOrder: Number(line.priceAtOrder) || 0,
    }));

    return {
      orderDate: orderDateIso,
      arrivalTime: arrivalTimeIso ?? null,
      orderArrivalStatus: numericStatus,
      supplierId: values.supplierId,
      orderLines: lines,
    };
  };

  const handleAddSubmit = (values: any) => {
    try {
      const payload = buildPayloadFromFormValues(values);
      createMutation.mutate(payload);
    } catch (err) {
      console.error('Failed to build payload', err);
      messageApi.error('Invalid form values');
    }
  };

  const handleEditSubmit = (values: any) => {
    if (!editingOrder) return;
    try {
      const payload = {
        id: editingOrder.id,
        ...buildPayloadFromFormValues(values),
      };
      updateMutation.mutate({ id: editingOrder.id, payload });
    } catch (err) {
      console.error('Failed to build payload', err);
      messageApi.error('Invalid form values');
    }
  };

  const getStatusLabel = (val: any) => {
    if (typeof val === 'string') return val;
    if (typeof val === 'number') return statusLabelByNumber[val] ?? String(val);
    return String(val);
  };

  const getStatusColor = (val: any) => {
    const label = getStatusLabel(val);
    switch (label) {
      case 'Pending':
        return 'orange';
      case 'Ordered':
        return 'blue';
      case 'Arrived':
        return 'green';
      case 'Shipping':
        return 'gold';
      default:
        return 'default';
    }
  };

  const columns: ColumnsType<Order> = [
    {
      title: 'Supplier',
      dataIndex: 'supplierId',
      key: 'supplier',
      render: (supplierId: string) => {
        const supplier = suppliers?.find((s) => s.id === supplierId);
        return <Text>{supplier?.name || 'Unknown Supplier'}</Text>;
      },
    },
    {
      title: 'Order Date',
      dataIndex: 'orderDate',
      key: 'orderDate',
      render: (date: string) => <Text>{formatDate(date)}</Text>,
    },
    {
      title: 'Arrival Time',
      dataIndex: 'arrivalTime',
      key: 'arrivalTime',
      render: (date: string) => <Text>{formatDate(date)}</Text>,
    },
    {
      title: 'Status',
      dataIndex: 'orderArrivalStatus',
      key: 'orderArrivalStatus',
      render: (status: any) => <Tag color={getStatusColor(status)}>{getStatusLabel(status)}</Tag>,
    },
    {
      title: 'Created',
      dataIndex: 'orderDate',
      key: 'createdDate',
      render: (date: string) => <Text type="secondary">{formatDate(date)}</Text>,
    },
    ...(canManageOrders
      ? [
          {
            title: 'Actions',
            key: 'actions',
            render: (_: any, record: Order) => (
              <Space size="small">
                <Button
                  type="primary"
                  
                  style={{ backgroundColor: AppColors.success,borderColor: AppColors.success,}}
                  icon={<EditOutlined />}
                  onClick={() => {
                    setEditingOrder(record);
                    setIsEditModalOpen(true);
                    setEditSupplier(record.supplierId);

                    const statusValue =
                      typeof record.orderArrivalStatus === 'number'
                        ? (statusLabelByNumber[record.orderArrivalStatus as any] as ArrivalStatus)
                        : (record.orderArrivalStatus as ArrivalStatus);

                    editForm.setFieldsValue({
                      orderDate: record.orderDate ? dayjs(record.orderDate) : undefined,
                      arrivalTime: record.arrivalTime ? dayjs(record.arrivalTime) : undefined,
                      orderArrivalStatus: statusValue,
                      supplierId: record.supplierId,
                      orderLines:
                        record.orderLines?.map(l => ({
                          productId: l.productId,
                          quantityOrdered: l.quantityOrdered,
                          priceAtOrder: l.priceAtOrder,
                        })) || [],
                    });
                  }}
                >
                  Edit
                </Button>

                <Popconfirm
                  title="Delete Order"
                  description="Are you sure you want to delete this order?"
                  onConfirm={() => handleDeleteOrder(record.id)}
                  okText="Confirm"
                  cancelText="Cancel"
                  okButtonProps={{ danger: true }}
                  icon={<ExclamationCircleOutlined style={{ color: 'red' }} />}
                >
                  <Button danger icon={<DeleteOutlined />}>
                    Delete
                  </Button>
                </Popconfirm>
              </Space>
            ),
          },
        ]
      : []),
  ];

  const OrderFormFields = () => (
    <>
      <Form.Item
        label="Supplier"
        name="supplierId"
        rules={[{ required: true, message: 'Please select a supplier' }]}
      >
        {isEditModalOpen ? (
          <Select
            disabled
            options={suppliers?.map(s => ({ label: s.name, value: s.id }))}
          />
        ) : (
          <Select
            placeholder="Select a supplier"
            options={suppliers?.map(s => ({ label: s.name, value: s.id }))}
            onChange={(value) => {
              setSelectedSupplier(value);
              addForm.setFieldValue("orderLines", []);
            }}
          />
        )}
      </Form.Item>
      <Form.Item
        label="Order Date"
        name="orderDate"
        
                  className="custom-button-default"
        rules={[{ required: true, message: 'Please select order date' }]}
      >
        <DatePicker style={{ width: '100%' }}  showTime={{ format: 'HH:mm' }} />
      </Form.Item>

      <Form.Item
        label="Arrival Time"
        name="arrivalTime"
        rules={[{ required: false }]}
      >
        <DatePicker style={{ width: '100%' }} showTime={{ format: 'HH:mm' }} />
      </Form.Item>
      <Form.Item
        label="Order Arrival Status"
        name="orderArrivalStatus"
        rules={[{ required: true, message: 'Please select arrival status' }]}
      >
        <Select>
          <Select.Option value="Pending">Pending</Select.Option>
          <Select.Option value="Ordered">Ordered</Select.Option>
          <Select.Option value="Shipping">Shipping</Select.Option>
          <Select.Option value="Arrived">Arrived</Select.Option>
        </Select>
      </Form.Item>

      <Divider>Order Lines</Divider>

      <Form.List name="orderLines">
        {(fields, { add, remove }) => (
          <>
            {fields.map(({ key, name, ...restField }) => (
              <Space key={key} align="baseline">
                <Form.Item
                  {...restField}
                  name={[name, 'productId']}
                  rules={[{ required: true, message: 'Select product' }]}
                >
                  <Select
                    placeholder="Select product"
                    options={(isEditModalOpen ? filteredEditProducts : filteredProducts)?.map(p => ({
                      label: p.name,
                      value: p.id,
                    }))}
                    style={{ width: 200 }}
                  />
                </Form.Item>

                <Form.Item
                  {...restField}
                  name={[name, 'quantityOrdered']}
                  rules={[{ required: true, message: 'Enter quantity' }]}
                >
                  <InputNumber placeholder="Qty" min={1} />
                </Form.Item>

                <Form.Item
                  {...restField}
                  name={[name, 'priceAtOrder']}
                  rules={[{ required: true, message: 'Enter price' }]}
                >
                  <InputNumber placeholder="Price" min={0} step={0.01} />
                </Form.Item>

                <MinusCircleOutlined onClick={() => remove(name)} />
              </Space>
            ))}
            <Form.Item>
              <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />} 
                  className="custom-button-default">
                Add Order Line
              </Button>
            </Form.Item>
          </>
        )}
      </Form.List>
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
    `}</style>


      <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Title level={2}>Orders</Title>
                <Text type="secondary">
                  Manage purchase orders
                  {canManageOrders && <Tag color="red">Admin</Tag>}
                </Text>
              </div>
              {canManageOrders && (
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => {
                    addForm.resetFields();
                    setSelectedSupplier(null);
                    setIsAddModalOpen(true);
                  }}
                  style={{ backgroundColor: AppColors.success,borderColor: AppColors.success,}}
                >
                  Add Order
                </Button>
              )}
            </div>
          </Card>

          <Card>
            <Table
              columns={columns}
              dataSource={orders}
              rowKey="id"
              loading={isLoading}
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </Space>

        <Modal
          title="Add Order"
          open={isAddModalOpen}
          onCancel={() => setIsAddModalOpen(false)}
          footer={null}
          width={800}
        >
          <Form form={addForm} layout="vertical" onFinish={handleAddSubmit}>
            <OrderFormFields />
            <Form.Item>
              <Space style={{ justifyContent: 'flex-end', width: '100%' }}>
                <Button onClick={() => setIsAddModalOpen(false)} className='custom-button-default'>Cancel</Button>
                <Button type="primary" htmlType="submit" loading={createMutation.isPending} 
                  style={{ backgroundColor: AppColors.success,borderColor: AppColors.success,}}>
                  Create
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>

        <Modal
          title="Edit Order"
          open={isEditModalOpen}
          onCancel={() => setIsEditModalOpen(false)}
          footer={null}
          width={800}
        >
          <Form form={editForm} layout="vertical" onFinish={handleEditSubmit}>
            <OrderFormFields />
            <Form.Item>
              <Space style={{ justifyContent: 'flex-end', width: '100%' }}>
                <Button onClick={() => setIsEditModalOpen(false)} className='custom-button-default'>Cancel</Button>
                <Button type="primary" htmlType="submit" loading={updateMutation.isPending}
                  style={{ backgroundColor: AppColors.success,borderColor: AppColors.success,}}>
                  Update
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
}
