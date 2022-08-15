import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  StationHistory,
  StationHistorySchema,
} from './schemas/station-history.schema';
import { Station, StationSchema } from './schemas/station.schema';
import { StationsService } from './stations.service';
import { StationsController } from './stations.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Station.name, schema: StationSchema },
      { name: StationHistory.name, schema: StationHistorySchema },
    ]),
  ],
  providers: [StationsService],
  exports: [StationsService],
  controllers: [StationsController],
})
export class StationsModule {}
