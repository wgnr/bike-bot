import { Schema, SchemaFactory } from '@nestjs/mongoose';

export type TelegramMessageDocument = TelegramMessage & Document;

@Schema({
  versionKey: false,
  timestamps: { updatedAt: false },
  strict: false,
})
export class TelegramMessage {}

export const TelegramMessageSchema =
  SchemaFactory.createForClass(TelegramMessage);
