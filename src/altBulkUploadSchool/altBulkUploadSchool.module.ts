import { CacheModule, Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { ALTBulkUploadSchoolController } from "./altBulkUploadSchool.controller";
import { SchoolHasuraService } from "src/adapters/hasura/school.adapter";
import { HasuraGroupService } from "src/adapters/hasura/group.adapter";
import { ALTHasuraUserService } from "src/adapters/hasura/altUser.adapter";
import { GroupMembershipService } from "src/adapters/hasura/groupMembership.adapter";
import { ALTBulkUploadSchoolService } from "src/adapters/hasura/altBulkUploadSchool.adapter";

const ttl = process.env.TTL as never;

@Module({
  imports: [
    HttpModule,
    CacheModule.register({
      ttl: ttl,
    }),
  ],
  controllers: [ALTBulkUploadSchoolController],
  providers: [
    HasuraGroupService,
    SchoolHasuraService,
    ALTHasuraUserService,
    GroupMembershipService,
    ALTBulkUploadSchoolService,
  ],
})
export class ALTBulkUploadSchoolModule {}
