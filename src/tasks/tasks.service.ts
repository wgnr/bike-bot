import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { EnvConfig } from 'src/config/configuration';
import { StationsService } from 'src/stations/stations.service';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    private readonly config: ConfigService<EnvConfig>,
    private readonly stationService: StationsService,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {}

  @Cron(CronExpression.EVERY_10_MINUTES, { name: 'keepServiceAlive' })
  async keepServiceAlive() {
    const { url } = this.config.get('hosting', { infer: true });

    try {
      await fetch(url);
      this.logger.log('keep-alive finished');
    } catch (e) {
      this.logger.warn(
        'There was an error keeping alive keroku',
        JSON.stringify(e),
      );
    }
  }

  @Cron(CronExpression.EVERY_MINUTE, { name: 'stationScrapping' })
  async scrapStation() {
    await this.stationService.scrapStations();
    this.logger.log('Scrap Stations finished');
  }

  getAll() {
    const tasks = this.schedulerRegistry.getCronJobs();

    return {
      tasks: [...tasks].map(([name, task]) => ({
        name,
        isRunning: task.running ?? false,
        lastExecutionDate: task.lastDate() ?? null,
        nextExecutionDate: task.nextDate(),
      })),
    };
  }
}
