import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { StationsModule } from 'src/stations/stations.module';

@Module({
  providers: [TasksService],
  controllers: [TasksController],
  imports: [StationsModule],
})
export class TasksModule {}
