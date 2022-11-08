import { CacheModule, Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { SelfAssessmentController } from "./altProgram.controller";
import { ProgramService } from "../adapters/hasura/altProgram.adapter";

const ttl = process.env.TTL as never;

@Module({
  imports: [
    HttpModule,
    CacheModule.register({
      ttl: ttl,
    }),
  ],
  controllers: [SelfAssessmentController],
  providers: [ProgramService],
})
export class ProgramModule {}
