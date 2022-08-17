import { Connection } from 'mongoose';
import { PinoLogger } from 'nestjs-pino';
// import { randomUUID } from 'node:crypto';
import { LoggerModule } from 'nestjs-pino';
import { CacheModule, Module, OnApplicationShutdown } from '@nestjs/common';
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
import { PrettyOptions } from 'pino-pretty';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [envConfig],
    }),
    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<EnvConfig>) => {
        return {
          pinoHttp: {
            level: configService.get('isProd', {
              infer: true,
            })
              ? 'info'
              : 'trace',
            customProps: (req, res) => ({
              context: 'HTTP',
            }),
            // genReqId: function (req) {
            //   const id = randomUUID();
            //   req.headers['My-Request-Id'] = id;
            //   return id;
            // },
            transport: {
              target: 'pino-pretty',
              options: {
                singleLine: true,
                levelFirst: true,
              } as PrettyOptions,
            },
          },
        };
      },
    }),
    CacheModule.register({
      isGlobal: true,
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
        dbName: 'mbtb-v2',
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
    private readonly logger: PinoLogger,
    @InjectConnection() private connection: Connection,
  ) {
    this.logger.setContext(AppModule.name);
  }

  async onApplicationShutdown(signal?: string) {
    await this.connection.close();
    console.log('DB connection closed on shutdown');
    this.logger.info('DB connection closed on shutdown');
  }
}
