import { Controller } from '@nestjs/common';
import { BotService } from './bot.service';

@Controller('bot')
export class BotController {
  constructor(private readonly botService: BotService) {}

  // @Get('stop')
  async stop() {
    return this.botService.stop();
  }

  // @Get('start')
  async start() {
    return this.botService.start();
  }
}
