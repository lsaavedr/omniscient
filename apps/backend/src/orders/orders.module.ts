import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { DirectusModule } from '../directus/directus.module';

@Module({
  imports: [DirectusModule],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
