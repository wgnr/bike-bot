import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EnvConfig } from '../config/configuration';
import { ScrapedStationsResponseDTO } from './dto/scrap-stations.dto';
import {
  StationHistory,
  StationHistoryDocument,
} from './schemas/station-history.schema';
import { Station, StationDocument } from './schemas/station.schema';

@Injectable()
export class StationsService {
  private readonly logger = new Logger(StationsService.name);

  constructor(
    @InjectModel(Station.name)
    private readonly stationModel: Model<StationDocument>,
    @InjectModel(StationHistory.name)
    private readonly stationHistoryModel: Model<StationHistoryDocument>,
    private readonly config: ConfigService<EnvConfig>,
  ) {}

  async findAll() {
    return this.stationModel.find().exec();
  }

  async findByStationId(stationId: number) {
    return this.stationModel.findOne({ stationId }).exec();
  }

  async scrapStations() {
    const targets = this.config.get('station.scrap', { infer: true });
    const [{ method, url }] = targets;
    const request = await fetch(url);
    const {
      data: { stations: fetchedStations },
    } = (await request.json()) as ScrapedStationsResponseDTO;

    const keyFields = ['tandem', 'withBackseat', 'anchor', 'bikes'];

    await Promise.all(
      fetchedStations.map(async (fetchedStation) => {
        const savedStation = await this.findByStationId(fetchedStation.id);

        if (!savedStation) {
          const newStation = await this.stationModel.create({
            ...fetchedStation,
            stationId: fetchedStation.id,
          });

          await this.stationHistoryModel.create({
            ...fetchedStation,
            station: newStation.id,
          });

          this.logger.log(`Scrapper | New Station: ${fetchedStation.id} added`);
          return;
        }

        if (
          keyFields.some(
            (field) => savedStation[field] !== fetchedStation[field],
          )
        ) {
          keyFields.forEach(
            (field) => (savedStation[field] = fetchedStation[field]),
          );

          await Promise.all([
            this.stationHistoryModel.create({
              ...fetchedStation,
              station: savedStation.id,
            }),
            savedStation.save(),
          ]);

          this.logger.log(`Scrapper | Station: ${fetchedStation.id} updated.`);
          return;
        }
      }),
    );
  }
}
