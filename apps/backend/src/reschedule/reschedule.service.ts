import { Injectable, Logger } from '@nestjs/common';
import { DirectusService } from '../directus/directus.service';
import { ProductionOrder, RescheduleResult } from '@production-orders/types';
import { rescheduleOrders as performReschedule } from '../lib/reschedule';

@Injectable()
export class RescheduleService {
  private readonly logger = new Logger(RescheduleService.name);

  constructor(private readonly directusService: DirectusService) {}

  async rescheduleConflicts(): Promise<RescheduleResult> {
    this.logger.log('Starting conflict resolution...');

    const orders = await this.directusService.getOrders();
    this.logger.log(`Fetched ${orders.length} orders`);

    const result = performReschedule(orders);

    if (result.rescheduled > 0) {
      this.logger.log(`Rescheduling ${result.rescheduled} orders`);

      for (const order of result.orders) {
        const originalOrder = orders.find((o: ProductionOrder) => o.id === order.id);
        if (originalOrder && (
          originalOrder.startDate !== order.startDate ||
          originalOrder.endDate !== order.endDate
        )) {
          await this.directusService.updateOrder(order.id, {
            startDate: order.startDate,
            endDate: order.endDate,
            status: order.status,
          });
        }
      }
    }

    return result;
  }

  async dryRunReschedule(): Promise<RescheduleResult> {
    const orders = await this.directusService.getOrders();
    return performReschedule(orders);
  }
}
