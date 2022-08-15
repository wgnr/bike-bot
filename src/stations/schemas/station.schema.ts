import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type StationDocument = Station & Document;

@Schema()
export class Station {
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
      name: { type: String },
      latitude: { type: Number },
      longitude: { type: Number },
    },
    type: Object,
  })
  location: Record<string, any>;
  @Prop()
  favorite: boolean;
  @Prop()
  tandem: number;
  @Prop()
  withBackseat: number;
  @Prop()
  anchor: number;
  @Prop()
  bikes: number;
}

export const StationSchema = SchemaFactory.createForClass(Station);
