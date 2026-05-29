import type { ProductionOrder, CreateProductionOrderDto, UpdateProductionOrderDto, RescheduleResult } from '../types/index';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface ApiError {
  message: string;
  statusCode?: number;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error: ApiError = {
      message: response.statusText,
      statusCode: response.status,
    };
    throw error;
  }
  return response.json();
}

export const apiClient = {
  async getOrders(): Promise<ProductionOrder[]> {
    const response = await fetch(`${API_URL}/orders`);
    return handleResponse<ProductionOrder[]>(response);
  },

  async getOrder(id: string): Promise<ProductionOrder> {
    const response = await fetch(`${API_URL}/orders/${id}`);
    return handleResponse<ProductionOrder>(response);
  },

  async createOrder(data: CreateProductionOrderDto): Promise<ProductionOrder> {
    const response = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<ProductionOrder>(response);
  },

  async updateOrder(id: string, data: UpdateProductionOrderDto): Promise<ProductionOrder> {
    const response = await fetch(`${API_URL}/orders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<ProductionOrder>(response);
  },

  async deleteOrder(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/orders/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw { message: response.statusText, statusCode: response.status };
    }
  },

  async rescheduleConflicts(): Promise<RescheduleResult> {
    const response = await fetch(`${API_URL}/orders/reschedule`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    return handleResponse<RescheduleResult>(response);
  },

  async dryRunReschedule(): Promise<RescheduleResult> {
    const response = await fetch(`${API_URL}/orders/reschedule/dry-run`);
    return handleResponse<RescheduleResult>(response);
  },
};
