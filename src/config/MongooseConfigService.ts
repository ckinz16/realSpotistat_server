import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { MongooseOptionsFactory, MongooseModuleOptions } from "@nestjs/mongoose";

@Injectable()
export class MongooseConfigService implements MongooseOptionsFactory {

    constructor(
        private config: ConfigService,
    ) {}

    createMongooseOptions(): MongooseModuleOptions {
        return {
            uri: this.config.get<string>('MONGO_CONNECTION_STR')
        };
    }
}