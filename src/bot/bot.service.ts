import { Injectable, Logger } from '@nestjs/common';
import {
  Command,
  Hears,
  Help,
  InjectBot,
  On,
  Start,
  Update,
} from 'nestjs-telegraf';
import { Context, Telegraf } from 'telegraf';
import { StationsService } from 'src/stations/stations.service';

@Update()
@Injectable()
export class BotService {
  private readonly logger = new Logger(BotService.name);

  constructor(
    private readonly stationsService: StationsService,
    @InjectBot() private readonly bot: Telegraf,
  ) {}

  stop() {
    this.bot.stop();
    this.logger.log('Bot stopped.');
  }

  start() {
    this.bot.launch();
    this.logger.log('Bot started.');
  }

  getData(): { message: string } {
    return { message: 'Bot under development.' };
  }

  @Start()
  async startCommand(ctx: Context) {
    await ctx.reply('Welcome');
  }

  @Help()
  async helpCommand(ctx: Context) {
    await ctx.reply('help command');
  }

  @On('location')
  async onSticker(ctx: Context) {
    const station = await this.stationsService.findNearestByLocation(
      ctx.message['location'],
    );

    const [lat, lon] = station.location;
    await ctx.replyWithLocation(lat, lon);
    await ctx.reply(`station:\n${JSON.stringify(station, null, 2)}`);
  }

  @Command('near')
  async location(ctx: Context) {
    await ctx.reply('Send me your location first!');
  }

  @Hears('hi')
  async hearsHi(ctx: Context) {
    await ctx.reply('Hey there');
  }
}
