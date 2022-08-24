import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { PinoLogger, InjectPinoLogger } from 'nestjs-pino';
import { Context, Telegraf } from 'telegraf';
import type { Location } from 'typegram';
import { Command, Help, InjectBot, On, Start, Update } from 'nestjs-telegraf';
import { Cache } from 'cache-manager';
import { StationsService } from 'src/stations/stations.service';
import type { Bike, StationDTO } from 'src/stations/dto/station.dto';
import { BotStationDTO } from './dto/bot-station.dto';
import {
  TelegramMessage,
  TelegramMessageDocument,
} from './schema/telegram-message.schema';
import { ConfigService } from '@nestjs/config';
import { EnvConfig } from 'src/config/configuration';

const userIdTag = (userId: string | number) => `bot:userId:${userId}`;

@Update()
@Injectable()
export class BotService {
  constructor(
    @InjectPinoLogger(BotService.name)
    private readonly logger: PinoLogger,
    private readonly stationsService: StationsService,
    @InjectBot() private readonly bot: Telegraf,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
    @InjectModel(TelegramMessage.name)
    private readonly telegramMessageModel: Model<TelegramMessageDocument>,
    private readonly config: ConfigService<EnvConfig>,
  ) {}

  async setUserStations(userId: string | number, stations: BotStationDTO[]) {
    await this.cache.set<BotStationDTO[]>(userIdTag(userId), stations, {
      ttl: this.config.get('bot.ttl', { infer: true }),
    });
    this.logger.info('Location stored for 1 minnute');
  }

  async getUserStations(
    userId: string | number,
  ): Promise<BotStationDTO[] | undefined> {
    return this.cache.get<BotStationDTO[]>(userIdTag(userId));
  }

  stop() {
    this.bot.stop();
    this.logger.info('Bot stopped.');
  }

  start() {
    this.bot.launch();
    this.logger.info('Bot started.');
  }

  @Start()
  async startCommand(ctx: Context) {
    Promise.allSettled([
      this.storeMessage(ctx.message),
      await ctx.reply('Comparte tu ubicación para comenzar! /help'),
    ]);
  }

  @Help()
  async helpCommand(ctx: Context) {
    Promise.allSettled([
      this.storeMessage(ctx.message),
      await ctx.reply(
        'Este bot está pensado para traerte la estación 🚏 más cercana a la ubicación que le compartas.\n\nUna vez compartida la ubicación, la app te mostrará cuántas bicicletas 🚲/👶/👥 tiene disponible junto a los anclajes ⚓ libres.\n\nSi la estación 🚏 más cercana no tiene lo que buscás, podés usar los comandos /dock /comun /asiento /tandem para buscar la estación más cercana que sí lo tenga.',
      ),
    ]);
  }

  @On('location')
  async onLocation(ctx: Context) {
    await this.storeMessage(ctx.message);
    const userId = ctx.message.from.id;
    const stations = await this.stationsService.fetchStations();
    const location = ctx.message['location'] as Location;
    const userStations = this.addDistance(stations, location);

    await this.setUserStations(userId, userStations);

    const nearestStation = userStations[0];

    await this.communicateStation(ctx, nearestStation);
  }

  @Command('estacion')
  @Command('dock')
  @Command('comun')
  @Command('asiento')
  @Command('tandem')
  async onCommand(ctx: Context) {
    await this.storeMessage(ctx.message);
    const [, command] = (ctx.message['text'].match(/^\/(\w+\b)/) ?? []) as [
      string,
      string,
    ];
    if (!command) {
      await ctx.reply('ERROR');
      this.logger.error(`Command not found: ${ctx.message['text']}`);
      return;
    }

    const userId = ctx.message.from.id;
    const stations = await this.getUserStations(userId);
    if (!stations || !stations.length) {
      await ctx.reply('Comparte tu ubicacion primero!');
      return;
    }

    let station: BotStationDTO;
    let bike: Bike;
    switch (command) {
      case 'dock':
        bike = 'anchor';
        break;
      case 'comun':
        bike = 'bikes';
        break;
      case 'asiento':
        bike = 'withBackseat';
        break;
      case 'tandem':
        bike = 'tandem';
        break;
      case 'estacion':
      default:
        break;
    }

    if (!bike) {
      station = stations[0];
    } else {
      station = stations.find(
        (station) => Number(station[bike] > 0) && station.status === 'active',
      );
    }

    await this.communicateStation(ctx, station);
  }

  private addDistance(
    stations: StationDTO[],
    location: Location,
  ): BotStationDTO[] {
    const { latitude: userLatitude, longitude: userLongitude } = location;

    const botStations = stations.map<BotStationDTO>((station) => {
      const {
        location: [stationLatitude, stationLongitude],
      } = station;

      const distance = Math.sqrt(
        Math.abs(Number(stationLatitude) - userLatitude) +
          Math.abs(Number(stationLongitude) - userLongitude),
      );

      return new BotStationDTO(station, distance);
    });

    botStations.sort(({ distance: d1 }, { distance: d2 }) => d1 - d2);

    return botStations;
  }

  private async communicateStation(ctx: Context, station?: BotStationDTO) {
    const menu = [
      '\n\nMas cercana:',
      '/estacion 🚏',
      '/dock ⚓',
      '/comun 🚲',
      '/asiento 👶',
      '/tandem 👥',
    ].join('\n');

    if (station) {
      const [lat, lon] = station.location;
      await ctx.replyWithLocation(lat, lon);
      await ctx.reply(station.toHTML().concat(menu), {
        parse_mode: 'HTML',
      });
    } else {
      await ctx.reply(
        'No se encontro una estacion cercana... intenta otra busqueda'.concat(
          menu,
        ),
      );
    }
  }

  private async storeMessage(message: Context['message']) {
    this.logger.trace(message);
    return this.telegramMessageModel.create(message);
  }
}

// app.telegram.sendMessage(chatId, "File content at: " + new Date() + " is: \n" + file);
// https://nestjs-telegraf.vercel.app/telegraf-methods
// https://telegraf.js.org/classes/Telegram.html#sendMessage
