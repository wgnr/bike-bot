import { Logger, Module, OnApplicationShutdown } from '@nestjs/common';
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
      }),
      inject: [ConfigService],
    }),
    StationsModule,
  ],
  providers: [BotService],
  controllers: [BotController],
})
export class BotModule implements OnApplicationShutdown {
  private readonly logger = new Logger(BotModule.name);

  constructor(private readonly botService: BotService) {}

  async onApplicationShutdown(signal?: string) {
    this.botService.stop();
    this.logger.verbose('Telegram bot stopped on shutdown');
  }
}
