import { CacheModule, Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { ALTLessonTrackingController } from "./altLessonTracking.controller";
import { ALTLessonTrackingService } from "../adapters/hasura/altLessonTracking.adapter";
import {
    SelfAssessmentService
  } from "../adapters/hasura/selfAssessment.adapter";
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
        SelfAssessmentService,
        ALTProgramAssociationService
    ]
})
export class ALTLessonTrackingModule {}