import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AuthDocument = Auth & Document;

@Schema()
export class Auth {
    @Prop()
    username: string;

    @Prop()
    access_token: string;

    @Prop()
    token_type: string;

    @Prop()
    scope: string;

    @Prop()
    expires_in: number;

    @Prop()
    refresh_token: string;

    @Prop()
    type: string;
}
export const AuthSchema = SchemaFactory.createForClass(Auth);