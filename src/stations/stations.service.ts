import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EnvConfig } from '../config/configuration';
import {
  ScrapedStationDTO,
  ScrapedStationsResponseDTO,
} from './dto/scrap-stations.dto';
import {
  StationHistory,
  StationHistoryDocument,
} from './schemas/station-history.schema';
import {
  StationMetaHistory,
  StationMetaHistoryDocument,
} from './schemas/station-meta-history.schema';
import { Station, StationDocument } from './schemas/station.schema';

@Injectable()
export class StationsService {
  private readonly logger = new Logger(StationsService.name);

  constructor(
    @InjectModel(Station.name)
    private readonly stationModel: Model<StationDocument>,
    @InjectModel(StationHistory.name)
    private readonly stationHistoryModel: Model<StationHistoryDocument>,
    @InjectModel(StationMetaHistory.name)
    private readonly stationMetaHistoryModel: Model<StationMetaHistoryDocument>,
    private readonly config: ConfigService<EnvConfig>,
  ) {}

  async findAll() {
    return this.stationModel.find().exec();
  }

  async findByStationId(stationId: number) {
    return this.stationModel.findOne({ stationId }).exec();
  }

  async findNearestByLocation({
    latitude,
    longitude,
  }: {
    latitude: number;
    longitude: number;
  }) {
    const stations = await this.fetchStations();

    stations.forEach((station) => {
      const {
        location: { latitude: stationLatitude, longitude: stationLongitude },
      } = station;
      station['distance'] = Math.sqrt(
        Math.abs(Number(stationLatitude) - latitude) +
          Math.abs(Number(stationLongitude) - longitude),
      );
    });

    stations.sort((s1, s2) => s1['distance'] - s2['distance']);

    return stations[0];
  }
  async fetchStations(): Promise<ScrapedStationDTO[]> {
    try {
      const url = this.config.get('dataURL', { infer: true });
      const request = await fetch(url);
      const {
        data: { stations },
      } = (await request.json()) as ScrapedStationsResponseDTO;

      return stations;
    } catch (e) {
      this.logger.error('There was an error fethiching data...');
      this.logger.error(e);
    }
  }

  async scrapStations() {
    const keyFields = ['tandem', 'withBackseat', 'anchor', 'bikes'];
    const keyMetaFields = [
      'favorite',
      'name',
      'address',
      'station_code',
      'status',
      'last_connection_date',
    ];

    const fetchedStations = await this.fetchStations();
    const promises = fetchedStations.map(async (fetchedStation) => {
      const savedStation = await this.findByStationId(fetchedStation.id);

      if (!savedStation) {
        const newStation = {
          ...fetchedStation,
          stationId: fetchedStation.id,
        };

        await Promise.all([
          this.stationModel.create(newStation),
          this.stationHistoryModel.create(newStation),
          this.stationMetaHistoryModel.create(newStation),
        ]);

        this.logger.verbose(
          `Scrapper | New Station: ${fetchedStation.id} added`,
        );
        return;
      }

      const updatePromises = [];

      if (
        keyFields.some(
          (kField) => savedStation[kField] !== fetchedStation[kField],
        )
      ) {
        keyFields.forEach(
          (kField) => (savedStation[kField] = fetchedStation[kField]),
        );

        updatePromises.push(
          this.stationHistoryModel.create({
            ...fetchedStation,
            stationId: savedStation.stationId,
          }),
        );
      }

      if (
        keyMetaFields.some(
          (kMField) => savedStation[kMField] !== fetchedStation[kMField],
        )
      ) {
        const updatedFields = {};

        keyMetaFields.forEach((kMField) => {
          if (savedStation[kMField] !== fetchedStation[kMField]) {
            updatedFields[kMField] = fetchedStation[kMField];
            savedStation[kMField] = fetchedStation[kMField];
          }
        });

        updatePromises.push(
          this.stationMetaHistoryModel.create({
            ...updatedFields,
            stationId: savedStation.stationId,
          }),
        );
      }

      if (updatePromises.length) {
        await Promise.all([...updatePromises, savedStation.save()]);

        this.logger.verbose(
          `Scrapper | Station: ${fetchedStation.id} updated.`,
        );
      }
    });

    await Promise.all(promises);
  }
}
