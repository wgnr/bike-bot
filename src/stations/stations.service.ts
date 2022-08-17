import { isEqual } from 'lodash';
import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { PinoLogger, InjectPinoLogger } from 'nestjs-pino';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EnvConfig } from '../config/configuration';
import { StationDTO } from './dto/station.dto';
import { ScrapedStationsResponseDTO } from './dto/scrapped-stations.dto';
import {
  BikeHistory,
  BikeHistoryDocument,
} from './schemas/bike-history.schema';
import {
  StationHistory,
  StationHistoryDocument,
} from './schemas/station-meta-history.schema';
import { Station, StationDocument } from './schemas/station.schema';
import { Cache } from 'cache-manager';

const CACHE_STATIONS = 'stations';
const CACHE_STATIONS_TTL = 30; // seconds

@Injectable()
export class StationsService {
  constructor(
    @InjectPinoLogger(StationsService.name)
    private readonly logger: PinoLogger,
    @InjectModel(Station.name)
    private readonly stationModel: Model<StationDocument>,
    @InjectModel(BikeHistory.name)
    private readonly stationHistoryModel: Model<BikeHistoryDocument>,
    @InjectModel(StationHistory.name)
    private readonly stationMetaHistoryModel: Model<StationHistoryDocument>,
    private readonly config: ConfigService<EnvConfig>,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
  ) {}

  async fetchStations(invalidate?: boolean): Promise<StationDTO[]> {
    if (!invalidate) {
      const stations = await this.cache.get<StationDTO[]>(CACHE_STATIONS);

      if (stations) {
        this.logger.debug(`Using cached value from '${CACHE_STATIONS}'`);
        return stations;
      }
    }

    try {
      const url = this.config.get('dataURL', { infer: true });
      const request = await fetch(url);
      const {
        data: { stations },
      } = (await request.json()) as ScrapedStationsResponseDTO;

      const stationsDTO = stations.map((station) => new StationDTO(station));

      return this.cache.set(CACHE_STATIONS, stationsDTO, CACHE_STATIONS_TTL);
    } catch (e) {
      this.logger.error(e, 'There was an error fethiching data...');
      throw e;
    }
  }

  async findAll() {
    return this.stationModel.find().exec();
  }

  async findByStationId(stationId: number) {
    return this.stationModel.findOne({ id: stationId }).exec();
  }

  async findNearestByLocation({
    latitude: myLatitude,
    longitude: myLongitude,
  }: {
    latitude: number;
    longitude: number;
  }) {
    const stations = await this.fetchStations();

    stations.forEach((station) => {
      const {
        location: [stationLatitude, stationLongitude],
      } = station;
      station['distance'] = Math.sqrt(
        Math.abs(Number(stationLatitude) - myLatitude) +
          Math.abs(Number(stationLongitude) - myLongitude),
      );
    });

    stations.sort((s1, s2) => s1['distance'] - s2['distance']);

    return stations[0];
  }

  async scrapStations() {
    const bikeFields = ['tandem', 'withBackseat', 'anchor', 'bikes'];
    const metaFields = [
      'address',
      'favorite',
      'last_connection_date',
      'name',
      'station_code',
      'status',
    ];

    const fetchedStations = await this.fetchStations();
    const promises = fetchedStations.map(async (fetchedStation) => {
      const savedStation = await this.findByStationId(fetchedStation.id);

      if (!savedStation) {
        await Promise.all([
          this.stationModel.create(fetchedStation),
          this.stationHistoryModel.create(fetchedStation),
          this.stationMetaHistoryModel.create(fetchedStation),
        ]);

        this.logger.trace(`Scrapper | New Station: ${fetchedStation.id} added`);
        return;
      }

      const updatePromises = [];

      if (
        bikeFields.some(
          (bikeField) => savedStation[bikeField] !== fetchedStation[bikeField],
        )
      ) {
        bikeFields.forEach(
          (bikeField) => (savedStation[bikeField] = fetchedStation[bikeField]),
        );

        updatePromises.push(this.stationHistoryModel.create(fetchedStation));
      }

      if (
        metaFields.some(
          (mField) => !isEqual(savedStation[mField], fetchedStation[mField]),
        )
      ) {
        const updatedFields = {};

        metaFields.forEach((mField) => {
          if (!isEqual(savedStation[mField], fetchedStation[mField])) {
            updatedFields[mField] = fetchedStation[mField];
            savedStation[mField] = fetchedStation[mField];
          }
        });

        updatePromises.push(
          this.stationMetaHistoryModel.create({
            ...updatedFields,
            id: savedStation.id,
          }),
        );
      }

      if (updatePromises.length) {
        await Promise.all([...updatePromises, savedStation.save()]);

        this.logger.trace(`Scrapper | Station: ${fetchedStation.id} updated.`);
      }
    });

    await Promise.all(promises);
  }
}
