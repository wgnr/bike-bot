import { Injectable } from '@nestjs/common';
import { Command, Hears, Help, On, Start, Update } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { StationsService } from 'src/stations/stations.service';

@Update()
@Injectable()
export class BotService {
  constructor(private readonly stationsService: StationsService) {}

  getData(): { message: string } {
    return { message: 'Intial message. Welcome to server!' };
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