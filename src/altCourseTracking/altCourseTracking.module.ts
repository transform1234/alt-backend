import { CacheModule, Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { ALTCourseTrackingController } from "./altCourseTracking.controller";
import { ALTCourseTrackingService } from "../adapters/hasura/altCourseTracking.adapter";
import { HasuraUserService } from "src/adapters/hasura/user.adapter";

const ttl = process.env.TTL as never;

@Module({
  imports: [
    HttpModule,
    CacheModule.register({
      ttl: ttl,
    }),
  ],
  controllers: [ALTCourseTrackingController],
  providers: [ALTCourseTrackingService, HasuraUserService],
})
export class ALTCourseTrackingModule {}
