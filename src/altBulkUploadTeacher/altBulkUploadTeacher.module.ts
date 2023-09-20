import { CacheModule, Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { ALTBulkUploadTeacherController } from "./altBulkUploadTeacher.controller";
import { ALTTeacherService } from "src/adapters/hasura/altTeacher.adapter";
import { ALTHasuraUserService } from "src/adapters/hasura/altUser.adapter";
import { GroupMembershipService } from "src/adapters/hasura/groupMembership.adapter";
import { ALTBulkUploadTeacherService } from "src/adapters/hasura/altBulkUploadTeacher.adapter";

const ttl = process.env.TTL as never;

@Module({
  imports: [
    HttpModule,
    CacheModule.register({
      ttl: ttl,
    }),
  ],
  controllers: [ALTBulkUploadTeacherController],
  providers: [
    ALTTeacherService,
    ALTHasuraUserService,
    GroupMembershipService,
    ALTBulkUploadTeacherService,
  ],
})
export class ALTBulkUploadTeacherModule {}
