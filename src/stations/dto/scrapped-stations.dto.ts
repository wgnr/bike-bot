export class ScrapedStationDTO {
  id: number;
  name: string;
  address: string;
  station_code: number;
  status: string;
  last_connection_date: number;
  location: {
    name: string;
    latitude: string;
    longitude: string;
  };
  favorite: boolean;
  tandem: number;
  withBackseat: number;
  anchor: number;
  bikes: number;
}

export class ScrapedStationsResponseDTO {
  status: boolean;
  data: {
    stations: ScrapedStationDTO[];
  };
}
