import { CacheModule, Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { ALTLessonTrackingController } from "./altLessonTracking.controller";
import { ALTLessonTrackingService } from "../adapters/hasura/altLessonTracking.adapter";
import {
    ProgramService
  } from "../adapters/hasura/altProgram.adapter";
  import { ALTProgramAssociationService } from "../adapters/hasura/altProgramAssociation.adapter";
const ttl = process.env.TTL as never;

@Module({
    imports: [
        HttpModule,
        CacheModule.register({
            ttl: ttl,
        }),
    ],
    controllers: [ALTLessonTrackingController],
    providers: [
        ALTLessonTrackingService,
        ProgramService,
        ALTProgramAssociationService
    ]
})
export class ALTLessonTrackingModule {}