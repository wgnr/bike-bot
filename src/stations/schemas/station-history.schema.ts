import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type StationHistoryDocument = StationHistory & Document;

@Schema({ versionKey: false })
export class StationHistory {
  @Prop({ type: Date, default: new Date() })
  date: Date;
  @Prop()
  stationId: number;
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
