import { Injectable } from '@nestjs/common';
import { PinoLogger, InjectPinoLogger } from 'nestjs-pino';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { EnvConfig } from 'src/config/configuration';
import { StationsService } from 'src/stations/stations.service';

@Injectable()
export class TasksService {
  constructor(
    @InjectPinoLogger(TasksService.name)
    private readonly logger: PinoLogger,
    private readonly config: ConfigService<EnvConfig>,
    private readonly stationService: StationsService,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {}

  @Cron(CronExpression.EVERY_10_MINUTES, { name: 'keepServiceAlive' })
  async keepServiceAlive() {
    const { url } = this.config.get('hosting', { infer: true });

    try {
      await fetch(url);
      this.logger.info('keep-alive finished');
    } catch (e) {
      this.logger.warn(e, 'There was an error keeping alive keroku');
      throw e;
    }
  }

  @Cron(CronExpression.EVERY_MINUTE, { name: 'stationScrapping' })
  async scrapStation() {
    await this.stationService.scrapStations();
    this.logger.info('Scrap Stations finished');
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
