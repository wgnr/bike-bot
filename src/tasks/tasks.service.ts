import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosError } from 'axios';
import { PinoLogger, InjectPinoLogger } from 'nestjs-pino';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { EnvConfig } from 'src/config/configuration';
import { StationsService } from 'src/stations/stations.service';
import { catchError, firstValueFrom } from 'rxjs';

@Injectable()
export class TasksService {
  constructor(
    @InjectPinoLogger(TasksService.name)
    private readonly logger: PinoLogger,
    private readonly config: ConfigService<EnvConfig>,
    private readonly stationService: StationsService,
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly httpService: HttpService,
  ) {}

  @Cron('0 */4 * * * *', { name: 'keepServiceAlive' })
  async keepServiceAlive() {
    const { url } = this.config.get('hosting', { infer: true });

    await firstValueFrom(
      this.httpService.get<unknown>(url).pipe(
        catchError((error: AxiosError) => {
          this.logger.error(
            error,
            `There was an error keeping alive the service. ${error.response.data}`,
          );
          throw error;
        }),
      ),
    );
    this.logger.info('keep-alive finished');
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
