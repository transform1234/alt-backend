import { CacheModule, Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { ALTTeacherController } from "./altTeacher.controller";
import { ALTTeacherService } from "src/adapters/hasura/altTeacher.adapter";
import { ALTHasuraUserService } from "src/adapters/hasura/altUser.adapter";
import { GroupMembershipService } from "src/adapters/hasura/groupMembership.adapter";

const ttl = process.env.TTL as never;

@Module({
  imports: [
    HttpModule,
    CacheModule.register({
      ttl: ttl,
    }),
  ],
  controllers: [ALTTeacherController],
  providers: [ALTTeacherService, ALTHasuraUserService, GroupMembershipService],
})
export class ALTTeachertModule {}
