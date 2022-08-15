import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type StationMetaHistoryDocument = StationMetaHistory & Document;

@Schema({ versionKey: false })
export class StationMetaHistory {
  @Prop({ type: Date, default: () => new Date() })
  date: Date;
  @Prop()
  stationId: number;
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
      name: { type: String },
      latitude: { type: Number },
      longitude: { type: Number },
    },
    type: Object,
  })
  location: {
    name: string;
    latitude: string;
    longitude: string;
  };
  @Prop()
  favorite: boolean;
}

export const StationMetaHistorySchema =
  SchemaFactory.createForClass(StationMetaHistory);
