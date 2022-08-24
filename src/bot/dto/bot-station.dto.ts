import { IStation, StationDTO } from 'src/stations/dto/station.dto';

export class BotStationDTO implements IStation {
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
  distance: number;

  constructor(init: StationDTO, distance: number) {
    Object.assign(this, init);
    this.distance = distance;
  }

  toHTML() {
    const status = this.status !== 'active' ? 'INACTIVA 🚳' : '';

    return [
      `${status ? '🚳' : '🚏'} Estacion <b>${this.name}</b> ${status}`,
      `🧭 Direccion: <pre>${this.address}</pre>\n`,
      `⚓ Docks: ${this.anchor}`,
      `🚲 Comunes: ${this.bikes}`,
      `👶 Con Asiento: ${this.withBackseat}`,
      `👥 Tandem: ${this.tandem}`,
    ].join('\n');
  }
}
