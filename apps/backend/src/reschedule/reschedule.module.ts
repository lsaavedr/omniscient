import { Module } from '@nestjs/common';
import { RescheduleController } from './reschedule.controller';
import { RescheduleService } from './reschedule.service';
import { DirectusModule } from '../directus/directus.module';

@Module({
  imports: [DirectusModule],
  controllers: [RescheduleController],
  providers: [RescheduleService],
})
export class RescheduleModule {}
