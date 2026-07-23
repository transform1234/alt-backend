import { CacheModule, Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { ALTCourseTrackingController } from "./altCourseTracking.controller";
import { ALTCourseTrackingService } from "../adapters/hasura/altCourseTracking.adapter";
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
  controllers: [ALTCourseTrackingController],
  providers: [ALTCourseTrackingService, ALTHasuraUserService],
})
export class ALTCourseTrackingModule {}
