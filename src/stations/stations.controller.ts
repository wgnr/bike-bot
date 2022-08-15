import { Controller, Get, Post } from '@nestjs/common';
import { StationsService } from './stations.service';

@Controller('stations')
export class StationsController {
  constructor(private readonly stationService: StationsService) {}

  @Post()
  create() {
    return this.stationService.create();
  }

  @Get()
  getAll() {
    return this.stationService.findAll();
  }
}
