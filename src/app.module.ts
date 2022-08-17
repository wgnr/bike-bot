import { Connection } from 'mongoose';
import { Module, OnApplicationShutdown } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  InjectConnection,
  MongooseModule,
  MongooseModuleOptions,
} from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { EnvConfig, envConfig } from './config/configuration';
import { TasksModule } from './tasks/tasks.module';
import { StationsModule } from './stations/stations.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BotModule } from './bot/bot.module';
import { InjectBot } from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [envConfig],
    }),
    ScheduleModule.forRoot(),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (
        configService: ConfigService<EnvConfig>,
      ): MongooseModuleOptions => ({
        uri: configService.get('db.uri', {
          infer: true,
        }),
        dbName: 'mbtb',
      }),
    }),
    TasksModule,
    StationsModule,
    BotModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements OnApplicationShutdown {
  constructor(
    @InjectConnection() private connection: Connection,
    @InjectBot() private readonly bot: Telegraf,
  ) {}

  async onApplicationShutdown(signal?: string) {
    this.bot.stop();
    await this.connection.close();
  }
}
