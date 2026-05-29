'use client';

import { useState, useEffect, useCallback } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, DatePicker, Space, Tag, message, Spin, Select } from 'antd';
import { PlusOutlined, SyncOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs, { Dayjs } from 'dayjs';
import type { ProductionOrder, CreateProductionOrderDto, OrderStatus } from '../types/index';
import { apiClient } from '../lib/api';



const STATUS_COLORS: Record<OrderStatus, string> = {
  planned: 'blue',
  scheduled: 'orange',
  in_progress: 'cyan',
  completed: 'green',
};

interface OrderFormValues {
  reference: string;
  product: string;
  quantity: number;
  startDate: Dayjs | null;
  endDate: Dayjs | null;
  status: OrderStatus;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<ProductionOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingOrder, setEditingOrder] = useState<ProductionOrder | null>(null);
  const [form] = Form.useForm<OrderFormValues>();
  const [messageApi, contextHolder] = message.useMessage();

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiClient.getOrders();
      setOrders(data);
    } catch (error) {
      messageApi.error('Failed to fetch orders');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [messageApi]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleReschedule = async () => {
    try {
      setSubmitting(true);
      const result = await apiClient.rescheduleConflicts();
      messageApi.success(`Rescheduled ${result.rescheduled} orders`);
      await fetchOrders();
    } catch (error) {
      messageApi.error('Failed to reschedule orders');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const openModal = (order?: ProductionOrder) => {
    setEditingOrder(order || null);
    if (order) {
      form.setFieldsValue({
        ...order,
        startDate: dayjs(order.startDate),
        endDate: dayjs(order.endDate),
      });
    } else {
      form.resetFields();
      form.setFieldsValue({ status: 'planned', quantity: 1 });
    }
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingOrder(null);
    form.resetFields();
  };

  const handleSubmit = async (values: OrderFormValues) => {
    try {
      setSubmitting(true);
      const orderData: CreateProductionOrderDto = {
        reference: values.reference,
        product: values.product,
        quantity: values.quantity,
        startDate: values.startDate?.format('YYYY-MM-DD') || '',
        endDate: values.endDate?.format('YYYY-MM-DD') || '',
        status: values.status,
      };

      if (editingOrder) {
        await apiClient.updateOrder(editingOrder.id, orderData);
        messageApi.success('Order updated successfully');
      } else {
        await apiClient.createOrder(orderData);
        messageApi.success('Order created successfully');
      }
      closeModal();
      await fetchOrders();
    } catch (error) {
      messageApi.error(editingOrder ? 'Failed to update order' : 'Failed to create order');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiClient.deleteOrder(id);
      messageApi.success('Order deleted successfully');
      await fetchOrders();
    } catch (error) {
      messageApi.error('Failed to delete order');
      console.error(error);
    }
  };

  const columns: ColumnsType<ProductionOrder> = [
    {
      title: 'Reference',
      dataIndex: 'reference',
      key: 'reference',
      width: 150,
    },
    {
      title: 'Product',
      dataIndex: 'product',
      key: 'product',
      width: 200,
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
    },
    {
      title: 'Start Date',
      dataIndex: 'startDate',
      key: 'startDate',
      width: 120,
      render: (date: string) => dayjs(date).format('YYYY-MM-DD'),
    },
    {
      title: 'End Date',
      dataIndex: 'endDate',
      key: 'endDate',
      width: 120,
      render: (date: string) => dayjs(date).format('YYYY-MM-DD'),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: OrderStatus) => (
        <Tag color={STATUS_COLORS[status]}>{status.replace('_', ' ')}</Tag>
      ),
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_: unknown, record: ProductionOrder) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => openModal(record)}
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          />
        </Space>
      ),
    },
  ];

  return (
    <main style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      {contextHolder}
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>Production Orders</h1>
        <Space>
          <Button
            type="primary"
            icon={<SyncOutlined />}
            onClick={handleReschedule}
            loading={submitting}
          >
            Reschedule Conflicts
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
            Create Order
          </Button>
        </Space>
      </div>

      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={orders}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Spin>

      <Modal
        title={editingOrder ? 'Edit Order' : 'Create Order'}
        open={modalVisible}
        onCancel={closeModal}
        footer={null}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ status: 'planned', quantity: 1 }}
        >
          <Form.Item
            name="reference"
            label="Reference"
            rules={[{ required: true, message: 'Reference is required' }]}
          >
            <Input placeholder="e.g., ORD-001" />
          </Form.Item>

          <Form.Item
            name="product"
            label="Product"
            rules={[{ required: true, message: 'Product is required' }]}
          >
            <Input placeholder="e.g., Widget A" />
          </Form.Item>

          <Form.Item
            name="quantity"
            label="Quantity"
            rules={[
              { required: true, message: 'Quantity is required' },
              { type: 'number', min: 1, message: 'Must be a positive integer' },
            ]}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>

          <Space style={{ display: 'flex' }}>
            <Form.Item
              name="startDate"
              label="Start Date"
              rules={[{ required: true, message: 'Start date is required' }]}
              style={{ flex: 1 }}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              name="endDate"
              label="End Date"
              rules={[{ required: true, message: 'End date is required' }]}
              style={{ flex: 1 }}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </Space>

          <Form.Item name="status" label="Status">
            <Select>
              <Select.Option value="planned">planned</Select.Option>
              <Select.Option value="scheduled">scheduled</Select.Option>
              <Select.Option value="in_progress">in_progress</Select.Option>
              <Select.Option value="completed">completed</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, marginTop: '24px' }}>
            <Space style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button onClick={closeModal}>Cancel</Button>
              <Button type="primary" htmlType="submit" loading={submitting}>
                {editingOrder ? 'Update' : 'Create'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </main>
  );
}
