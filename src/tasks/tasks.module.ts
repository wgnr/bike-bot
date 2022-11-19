import { Module, OnApplicationBootstrap } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PinoLogger, InjectPinoLogger } from 'nestjs-pino';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { StationsModule } from 'src/stations/stations.module';
import { SchedulerRegistry } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { EnvConfig } from 'src/config/configuration';

@Module({
  providers: [TasksService],
  controllers: [TasksController],
  imports: [StationsModule, HttpModule],
})
export class TasksModule implements OnApplicationBootstrap {
  constructor(
    @InjectPinoLogger(TasksModule.name)
    private readonly logger: PinoLogger,
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly config: ConfigService<EnvConfig>,
  ) {}

  onApplicationBootstrap() {
    if (this.config.get('cron.stop', { infer: true })) {
      const tasks = this.schedulerRegistry.getCronJobs();
      tasks.forEach((task) => task.stop());
      this.logger.warn(
        `All cron jobs (${tasks.size}) has been stopped by config.`,
      );
    }
  }
}
