import {
  Module,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import { PinoLogger, InjectPinoLogger } from 'nestjs-pino';
import { ConfigService } from '@nestjs/config';
import { TelegrafModule } from 'nestjs-telegraf';
import { EnvConfig } from 'src/config/configuration';
import { StationsModule } from 'src/stations/stations.module';
import { BotService } from './bot.service';
import { BotController } from './bot.controller';

@Module({
  imports: [
    TelegrafModule.forRootAsync({
      useFactory: (configService: ConfigService<EnvConfig>) => ({
        token: configService.get('bot.token', { infer: true }),
        launchOptions: { dropPendingUpdates: true },
      }),
      inject: [ConfigService],
    }),
    StationsModule,
  ],
  providers: [BotService],
  controllers: [BotController],
})
export class BotModule
  implements OnApplicationShutdown, OnApplicationBootstrap
{
  constructor(
    @InjectPinoLogger(BotModule.name)
    private readonly logger: PinoLogger,
    private readonly botService: BotService,
    private readonly config: ConfigService<EnvConfig>,
  ) {}

  onApplicationBootstrap() {
    if (this.config.get('bot.disable', { infer: true })) {
      this.botService.stop();
      this.logger.warn('Telegram bot stopped by config');
    }
  }

  async onApplicationShutdown(signal?: string) {
    this.botService.stop();
    console.log('Telegram bot stopped on shutdown');
    this.logger.info('Telegram bot stopped on shutdown');
  }
}
