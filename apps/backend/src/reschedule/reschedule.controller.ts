import { Controller, Post, Get, Body } from '@nestjs/common';
import { RescheduleService } from './reschedule.service';
import { RescheduleResult } from '@production-orders/types';

@Controller('orders')
export class RescheduleController {
  constructor(private readonly rescheduleService: RescheduleService) {}

  @Post('reschedule')
  async rescheduleConflicts(): Promise<RescheduleResult> {
    return this.rescheduleService.rescheduleConflicts();
  }

  @Get('reschedule/dry-run')
  async dryRunReschedule(): Promise<RescheduleResult> {
    return this.rescheduleService.dryRunReschedule();
  }
}
