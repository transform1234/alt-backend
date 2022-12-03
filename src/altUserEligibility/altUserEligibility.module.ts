import { CacheModule, Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { ProgramService } from "../adapters/hasura/altProgram.adapter";
import { ALTProgramAssociationService } from "../adapters/hasura/altProgramAssociation.adapter";
import { ALTUserCourseEligibilityController } from "./altUserEligibility.controller";
import { ALTUserCourseEligibilityService } from "src/adapters/hasura/altUserEligibility.adapter";
import { ALTLessonTrackingService } from "src/adapters/hasura/altLessonTracking.adapter";
import { ALTModuleTrackingService } from "src/adapters/hasura/altModuleTracking.adapter";
import { ALTCourseTrackingService } from "src/adapters/hasura/altCourseTracking.adapter";
const ttl = process.env.TTL as never;

@Module({
  imports: [
    HttpModule,
    CacheModule.register({
      ttl: ttl,
    }),
  ],
  controllers: [ALTUserCourseEligibilityController],
  providers: [
    ProgramService,
    ALTProgramAssociationService,
    ALTUserCourseEligibilityService,
    ALTLessonTrackingService,
    ALTModuleTrackingService,
    ALTCourseTrackingService,
  ],
})
export class ALTUserCourseEligibilityModule {}
