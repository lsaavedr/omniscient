import { Injectable } from '@nestjs/common';
import { DirectusService } from '../directus/directus.service';
import { ProductionOrder } from '@production-orders/types';
import { CreateOrderDto, UpdateOrderDto } from './dto/order.dto';

@Injectable()
export class OrdersService {
  constructor(private readonly directusService: DirectusService) {}

  async findAll(): Promise<ProductionOrder[]> {
    return this.directusService.getOrders();
  }

  async findOne(id: string): Promise<ProductionOrder | null> {
    return this.directusService.getOrderById(id);
  }

  async create(dto: CreateOrderDto): Promise<ProductionOrder> {
    return this.directusService.createOrder(dto);
  }

  async update(id: string, dto: UpdateOrderDto): Promise<ProductionOrder> {
    return this.directusService.updateOrder(id, dto);
  }

  async remove(id: string): Promise<boolean> {
    return this.directusService.deleteOrder(id);
  }
}
