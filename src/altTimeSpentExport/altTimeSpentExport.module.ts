import { CacheModule, Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { ALTTimeSpentExportController } from "./altTimeSpentExport.controller";
import { DikshaCourseService } from "src/adapters/diksha/dikshaCourse.adapter";
import { ALTTimeSpentExportService } from "src/adapters/hasura/altTimeSpentExport.adapter";
const ttl = process.env.TTL as never;

@Module({
  imports: [
    HttpModule,
    CacheModule.register({
      ttl: ttl,
    }),
  ],
  controllers: [ALTTimeSpentExportController],
  providers: [ALTTimeSpentExportService, DikshaCourseService],
})
export class ALTTimeSpentExportModule {}
