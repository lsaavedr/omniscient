import { IsString, IsNumber, IsOptional, IsDateString, Min, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { OrderStatus } from '@production-orders/types';

export class CreateOrderDto {
  @IsString()
  reference: string;

  @IsString()
  product: string;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  quantity: number;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsOptional()
  @IsIn(['planned', 'scheduled', 'in_progress', 'completed'])
  status?: OrderStatus;
}

export class UpdateOrderDto {
  @IsOptional()
  @IsString()
  reference?: string;

  @IsOptional()
  @IsString()
  product?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  quantity?: number;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsIn(['planned', 'scheduled', 'in_progress', 'completed'])
  status?: OrderStatus;
}