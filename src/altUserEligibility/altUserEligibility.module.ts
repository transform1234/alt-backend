import { CacheModule, Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { ProgramService } from "../adapters/hasura/altProgram.adapter";
import { ALTProgramAssociationService } from "../adapters/hasura/altProgramAssociation.adapter";
import { ALTUserEligibilityController } from "./altUserEligibility.controller";
import { ALTUserEligibilityService } from "src/adapters/hasura/altUserEligibility.adapter";
import { ALTLessonTrackingService } from "src/adapters/hasura/altLessonTracking.adapter";
import { ALTModuleTrackingService } from "src/adapters/hasura/altModuleTracking.adapter";
import { ALTCourseTrackingService } from "src/adapters/hasura/altCourseTracking.adapter";
// import { HasuraUserService } from "src/adapters/hasura/user.adapter";
import { ALTHasuraUserService } from "src/adapters/hasura/altUser.adapter";

const ttl = process.env.TTL as never;

@Module({
  imports: [
    HttpModule,
    CacheModule.register({
      ttl: ttl,
    }),
  ],
  controllers: [ALTUserEligibilityController],
  providers: [
    ProgramService,
    ALTProgramAssociationService,
    ALTUserEligibilityService,
    ALTLessonTrackingService,
    ALTModuleTrackingService,
    ALTCourseTrackingService,
    ALTHasuraUserService,
  ],
})
export class ALTUserCourseEligibilityModule {}
