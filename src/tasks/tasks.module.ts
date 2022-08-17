import { Logger, Module, OnApplicationBootstrap } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { StationsModule } from 'src/stations/stations.module';
import { SchedulerRegistry } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { EnvConfig } from 'src/config/configuration';

@Module({
  providers: [TasksService],
  controllers: [TasksController],
  imports: [StationsModule],
})
export class TasksModule implements OnApplicationBootstrap {
  private readonly logger = new Logger(TasksModule.name);

  constructor(
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
