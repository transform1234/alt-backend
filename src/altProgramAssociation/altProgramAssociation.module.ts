import { CacheModule, Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { ALTProgramAssociationController } from "./altProgramAssociation.controller";
import { ALTProgramAssociationService } from "../adapters/hasura/altProgramAssociation.adapter";

const ttl = process.env.TTL as never;

@Module({
    imports: [
        HttpModule,
        CacheModule.register({
            ttl: ttl,
        }),
    ],
    controllers: [ALTProgramAssociationController],
    providers: [
        ALTProgramAssociationService
    ]
})
export class ALTProgramAssociationModule {}