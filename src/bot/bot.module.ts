import { Logger, Module, OnApplicationShutdown } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectBot, TelegrafModule } from 'nestjs-telegraf';
import { EnvConfig } from 'src/config/configuration';
import { StationsModule } from 'src/stations/stations.module';
import { BotService } from './bot.service';
import { Telegraf } from 'telegraf';

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
})
export class BotModule implements OnApplicationShutdown {
  private readonly logger = new Logger(BotModule.name);

  constructor(@InjectBot() private readonly bot: Telegraf) {}

  async onApplicationShutdown(signal?: string) {
    this.bot.stop();
    this.logger.verbose('Telegram bot stopped on shutdown');
  }
}
