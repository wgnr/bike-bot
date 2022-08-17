import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { IStationHistory } from '../dto/station.dto';

export type StationHistoryDocument = StationHistory & Document;

@Schema({ versionKey: false })
export class StationHistory implements IStationHistory {
  @Prop({ type: Date, default: () => new Date() })
  date: Date;
  @Prop()
  id: number;
  @Prop()
  name: string;
  @Prop()
  address: string;
  @Prop()
  station_code: number;
  @Prop()
  status: string;
  @Prop()
  last_connection_date: number;
  @Prop({
    raw: {
      location: { type: [Number] },
    },
    default: undefined,
  })
  location: [number, number];
  @Prop()
  favorite: boolean;
}

export const StationHistorySchema =
  SchemaFactory.createForClass(StationHistory);
