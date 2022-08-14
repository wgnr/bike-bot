import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { EnvConfig } from 'src/config/configuration';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(private readonly config: ConfigService<EnvConfig>) {}

  @Cron(CronExpression.EVERY_10_MINUTES, { name: 'keepServiceAlive' })
  async keepServiceAlive() {
    const { url } = this.config.get('hosting', { infer: true });

    try {
      await fetch(url);
      this.logger.verbose('keep-alive: ok');
    } catch (e) {
      this.logger.warn(
        'There was an error keeping alive keroku',
        JSON.stringify(e),
      );
    }
  }
}
