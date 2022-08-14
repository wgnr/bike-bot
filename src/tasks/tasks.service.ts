import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  @Cron(CronExpression.EVERY_MINUTE, { name: 'keepServiceAlive' })
  async keepServiceAlive() {
    try {
      await fetch('MOCKED_URL');
    } catch (e) {
      this.logger.warn(
        'There was an error keeping alive keroku',
        JSON.stringify(e),
      );
    }
  }
}
