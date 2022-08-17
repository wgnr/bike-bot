import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { IStation } from '../dto/station.dto';

export type StationDocument = Station & Document;

@Schema({ versionKey: false, timestamps: true })
export class Station implements IStation {
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
  })
  location: [number, number];
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
