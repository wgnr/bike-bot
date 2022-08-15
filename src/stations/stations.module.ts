import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  StationHistory,
  StationHistorySchema,
} from './schemas/station-history.schema';
import { Station, StationSchema } from './schemas/station.schema';
import { StationsService } from './stations.service';
import { StationsController } from './stations.controller';
import {
  StationMetaHistory,
  StationMetaHistorySchema,
} from './schemas/station-meta-history.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Station.name, schema: StationSchema },
      { name: StationHistory.name, schema: StationHistorySchema },
      { name: StationMetaHistory.name, schema: StationMetaHistorySchema },
    ]),
  ],
  providers: [StationsService],
  exports: [StationsService],
  controllers: [StationsController],
})
export class StationsModule {}
