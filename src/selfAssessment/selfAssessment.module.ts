import { CacheModule, Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { SelfAssessmentController } from "./selfAssessment.controller";
import {
    SelfAssessmentService
} from "../adapters/hasura/selfAssessment.adapter";

const ttl = process.env.TTL as never;

@Module({
    imports: [
        HttpModule,
        CacheModule.register({
            ttl: ttl,
        }),
    ],
    controllers: [SelfAssessmentController],
    providers: [
        SelfAssessmentService
    ]
})
export class SelfAssessmentModule {}