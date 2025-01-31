import { CacheModule, Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { ALTBulkUploadStudentController } from "./altBulkUploadStudent.controller";
import { ALTStudentService } from "src/adapters/hasura/altStudent.adapter";
import { ALTHasuraUserService } from "src/adapters/hasura/altUser.adapter";
import { GroupMembershipService } from "src/adapters/hasura/groupMembership.adapter";
import { ALTBulkUploadStudentService } from "src/adapters/hasura/altBulkUploadStudent.adapter";
import { HasuraGroupService } from "src/adapters/hasura/group.adapter";
const ttl = process.env.TTL as never;

@Module({
  imports: [
    HttpModule,
    CacheModule.register({
      ttl: ttl,
    }),
  ],
  controllers: [ALTBulkUploadStudentController],
  providers: [
    ALTStudentService,
    ALTHasuraUserService,
    GroupMembershipService,
    HasuraGroupService,
    ALTBulkUploadStudentService,
  ],
})
export class ALTBulkUploadStudentModule {}
