import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Station, StationDocument } from './schemas/station.schema';

@Injectable()
export class StationsService {
  constructor(
    @InjectModel(Station.name)
    private readonly stationModel: Model<StationDocument>,
  ) {}

  async create() {
    const createdStation = new this.stationModel({
      name: 'hola',
    });
    return createdStation.save();
  }

  async findAll(): Promise<Station[]> {
    return this.stationModel.find().exec();
  }
}
