import { Controller, Get, Post, Put, Delete, Param, Body, HttpCode, HttpStatus, BadRequestException } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { ProductionOrder } from '@production-orders/types';
import { CreateOrderDto, UpdateOrderDto } from './dto/order.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  async findAll(): Promise<ProductionOrder[]> {
    return this.ordersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ProductionOrder | null> {
    return this.ordersService.findOne(id);
  }

  @Post()
  async create(@Body() dto: CreateOrderDto): Promise<ProductionOrder> {
    this.validateDateRange(dto.startDate, dto.endDate);
    return this.ordersService.create(dto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateOrderDto): Promise<ProductionOrder> {
    if (dto.startDate && dto.endDate) {
      this.validateDateRange(dto.startDate, dto.endDate);
    }
    return this.ordersService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.ordersService.remove(id);
  }

  private validateDateRange(startDate: string, endDate: string): void {
    if (new Date(endDate) < new Date(startDate)) {
      throw new BadRequestException('endDate must be greater than or equal to startDate');
    }
  }
}
