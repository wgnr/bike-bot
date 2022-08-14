import { Controller, Get } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';

@Controller('tasks')
export class TasksController {
  constructor(private readonly schedulerRegistry: SchedulerRegistry) {}

  @Get()
  getAllCrons() {
    const jobs = this.schedulerRegistry.getCronJobs();

    return {
      tasks: [...jobs].map(([name, task]) => ({
        name,
        isRunning: task.running ?? false,
        lastExecutionDate: task.lastDate() ?? null,
        nextExecutionDate: task.nextDate(),
      })),
    };
  }
}
