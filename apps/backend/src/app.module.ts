import { Module } from '@nestjs/common';
import { OrdersModule } from './orders/orders.module';
import { RescheduleModule } from './reschedule/reschedule.module';

@Module({
  imports: [OrdersModule, RescheduleModule],
})
export class AppModule {}
