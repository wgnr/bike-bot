import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TelegrafModule } from 'nestjs-telegraf';
import { EnvConfig } from 'src/config/configuration';
import { BotService } from './bot.service';

@Module({
  imports: [
    TelegrafModule.forRootAsync({
      useFactory: (configService: ConfigService<EnvConfig>) => ({
        token: configService.get('bot.token', { infer: true }),
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [BotService],
})
export class BotModule {}
