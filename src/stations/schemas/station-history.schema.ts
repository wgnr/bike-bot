import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { Station } from './station.schema';

export type StationHistoryDocument = StationHistory & Document;

@Schema({ versionKey: false })
export class StationHistory {
  @Prop({ type: Date, default: new Date() })
  date: Date;
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Station' })
  station: Station;
  @Prop()
  tandem: number;
  @Prop()
  withBackseat: number;
  @Prop()
  anchor: number;
  @Prop()
  bikes: number;
}

export const StationHistorySchema =
  SchemaFactory.createForClass(StationHistory);
