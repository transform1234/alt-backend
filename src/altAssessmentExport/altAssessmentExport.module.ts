import { CacheModule, Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { ALTAssessmentExportController } from "./altAssessmentExport.controller";
import { ALTAssessmentExportService } from "src/adapters/hasura/altAsssessmentExport.adapter";
const ttl = process.env.TTL as never;

@Module({
  imports: [
    HttpModule,
    CacheModule.register({
      ttl: ttl,
    }),
  ],
  controllers: [ALTAssessmentExportController],
  providers: [ALTAssessmentExportService],
})
export class ALTAssessmentExportModule {}
