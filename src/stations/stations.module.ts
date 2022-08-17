import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  BikeHistory,
  BikeHistorySchema,
} from './schemas/bike-history.schema';
import { Station, StationSchema } from './schemas/station.schema';
import { StationsService } from './stations.service';
import { StationsController } from './stations.controller';
import {
  StationHistory,
  StationHistorySchema,
} from './schemas/station-meta-history.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Station.name, schema: StationSchema },
      { name: BikeHistory.name, schema: BikeHistorySchema },
      { name: StationHistory.name, schema: StationHistorySchema },
    ]),
  ],
  providers: [StationsService],
  exports: [StationsService],
  controllers: [StationsController],
})
export class StationsModule {}
