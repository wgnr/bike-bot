import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { PinoLogger, InjectPinoLogger } from 'nestjs-pino';
import { Context, Telegraf } from 'telegraf';
import type { Location } from 'typegram';
import { Command, Help, InjectBot, On, Start, Update } from 'nestjs-telegraf';
import { Cache } from 'cache-manager';
import { StationsService } from 'src/stations/stations.service';
import type { Bike, StationDTO } from 'src/stations/dto/station.dto';
import { BotStationDTO } from './dto/bot-station.dto';

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
  ) {}

  async setUserStations(userId: string | number, stations: BotStationDTO[]) {
    await this.cache.set<BotStationDTO[]>(userIdTag(userId), stations, {
      ttl: 60,
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
    await ctx.reply('Under development...');
  }

  @Help()
  async helpCommand(ctx: Context) {
    await ctx.reply(`Under development...`);
  }

  @On('location')
  async onLocation(ctx: Context) {
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
  @Command('aciento')
  @Command('tandem')
  async onCommand(ctx: Context) {
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
      case 'aciento':
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
      '/aciento 👶',
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
}
