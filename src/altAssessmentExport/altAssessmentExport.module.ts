import { CacheModule, Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { ALTAssessmentExportController } from "./altAssessmentExport.controller";
import { ALTAssessmentExportService } from "src/adapters/hasura/altAsssessmentExport.adapter";
import { DikshaCourseService } from "src/adapters/diksha/dikshaCourse.adapter";
const ttl = process.env.TTL as never;

@Module({
  imports: [
    HttpModule,
    CacheModule.register({
      ttl: ttl,
    }),
  ],
  controllers: [ALTAssessmentExportController],
  providers: [ALTAssessmentExportService, DikshaCourseService],
})
export class ALTAssessmentExportModule {}
