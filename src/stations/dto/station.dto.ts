import { ScrapedStationDTO } from './scrapped-stations.dto';

export type Bike = 'tandem' | 'withBackseat' | 'anchor' | 'bikes';

export interface IStationBikeHistory extends Record<Bike, number> {
  date: Date;
  id: number;
  tandem: number;
  withBackseat: number;
  anchor: number;
  bikes: number;
}

export interface IStationHistory {
  date: Date;
  id: number;
  name: string;
  address: string;
  station_code: number;
  status: string;
  last_connection_date: number;
  /** [latitude, longitude] */
  location: [number, number];
  favorite: boolean;
}

export interface IStation extends IStationBikeHistory, IStationHistory {}

export class StationDTO implements IStation {
  id: number;
  name: string;
  address: string;
  station_code: number;
  status: string;
  last_connection_date: number;
  location: [number, number];
  favorite: boolean;
  tandem: number;
  withBackseat: number;
  anchor: number;
  bikes: number;
  date: Date;

  constructor({ location, ...init }: ScrapedStationDTO) {
    Object.assign(this, init);
    this.location = [+location.latitude, +location.longitude];
  }
}
