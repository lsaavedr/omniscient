import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ProductionOrder, CreateProductionOrderDto, UpdateProductionOrderDto } from '@production-orders/types';

@Injectable()
export class DirectusService implements OnModuleInit {
  private readonly logger = new Logger(DirectusService.name);
  private readonly baseUrl: string;
  private token: string = '';

  constructor() {
    this.baseUrl = process.env.DIRECTUS_URL || 'http://localhost:8055';
    this.logger.log(`Directus client initialized with URL: ${this.baseUrl}`);
  }

  async onModuleInit(): Promise<void> {
    await this.login();
  }

  private async login(): Promise<void> {
    const email = process.env.DIRECTUS_ADMIN_EMAIL || 'admin@gmail.com';
    const password = process.env.DIRECTUS_ADMIN_PASSWORD || 'admin123';
    
    try {
      const response = await fetch(`${this.baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      if (response.ok) {
        const data = await response.json();
        this.token = data.data.access_token;
        this.logger.log('Authenticated with Directus');
      } else {
        this.logger.error(`Failed to login to Directus: ${response.statusText}`);
      }
    } catch (error) {
      this.logger.error('Failed to connect to Directus for login', error);
    }
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    while (!this.token) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    const url = `${this.baseUrl}${path}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.token}`,
      ...((options.headers as Record<string, string>) || {}),
    };

    let response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401 || response.status === 403) {
      this.logger.log('Token expired, re-authenticating...');
      await this.login();
      headers.Authorization = `Bearer ${this.token}`;
      response = await fetch(url, {
        ...options,
        headers,
      });
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Directus request failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return {} as T;
    }

    return response.json();
  }

  async getOrders(): Promise<ProductionOrder[]> {
    try {
      const response = await this.request<{ data: ProductionOrder[] }>('/items/production_orders?sort=-createdAt&fields=*');
      return response.data || [];
    } catch (error) {
      this.logger.error('Failed to fetch orders', error);
      throw error;
    }
  }

  async getOrderById(id: string): Promise<ProductionOrder | null> {
    try {
      const response = await this.request<ProductionOrder>(`/items/production_orders/${id}`);
      return response;
    } catch (error) {
      this.logger.error(`Failed to fetch order ${id}`, error);
      return null;
    }
  }

  async createOrder(dto: CreateProductionOrderDto): Promise<ProductionOrder> {
    try {
      const orderData = {
        ...dto,
        status: dto.status || 'planned',
      };
      const response = await this.request<{ data: ProductionOrder }>('/items/production_orders', {
        method: 'POST',
        body: JSON.stringify(orderData),
      });
      return response.data;
    } catch (error) {
      this.logger.error('Failed to create order', error);
      throw error;
    }
  }

  async updateOrder(id: string, dto: UpdateProductionOrderDto): Promise<ProductionOrder> {
    try {
      const response = await this.request<{ data: ProductionOrder }>(`/items/production_orders/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(dto),
      });
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to update order ${id}`, error);
      throw error;
    }
  }

  async deleteOrder(id: string): Promise<boolean> {
    try {
      await this.request(`/items/production_orders/${id}`, {
        method: 'DELETE',
      });
      return true;
    } catch (error) {
      this.logger.error(`Failed to delete order ${id}`, error);
      return false;
    }
  }
}
