import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { IStationBikeHistory as IBikesHistory } from '../dto/station.dto';

export type BikeHistoryDocument = BikeHistory & Document;

@Schema({ versionKey: false })
export class BikeHistory implements IBikesHistory {
  @Prop({ type: Date, default: () => new Date() })
  date: Date;
  @Prop()
  id: number;
  @Prop()
  tandem: number;
  @Prop()
  withBackseat: number;
  @Prop()
  anchor: number;
  @Prop()
  bikes: number;
}

export const BikeHistorySchema = SchemaFactory.createForClass(BikeHistory);
