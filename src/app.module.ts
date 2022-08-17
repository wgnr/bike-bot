import { Connection } from 'mongoose';
import { Logger, Module, OnApplicationShutdown } from '@nestjs/common';
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
  private readonly logger = new Logger(AppModule.name);

  constructor(@InjectConnection() private connection: Connection) {}

  async onApplicationShutdown(signal?: string) {
    await this.connection.close();
    this.logger.verbose('DB connection closed on shutdown');
  }
}
