import { CacheModule, Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { ALTStudentController } from "./altStudent.controller";
import { ALTStudentService } from "src/adapters/hasura/altStudent.adapter";
import { HasuraUserService } from "src/adapters/hasura/user.adapter";

const ttl = process.env.TTL as never;

@Module({
  imports: [
    HttpModule,
    CacheModule.register({
      ttl: ttl,
    }),
  ],
  controllers: [ALTStudentController],
  providers: [ALTStudentService, HasuraUserService],
})
export class ALTStudentModule {}
