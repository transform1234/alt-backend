import { CacheModule, Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { QuestionController } from "./question.controller";
import {
  DikshaQuestionToken,
  QumlQuestionService as DikshaQumlQuestionService 
  ,
} from "src/adapters/diksha/quml.adapter";
import {
  KhanAcademyQuestionService,
  KhanAcademyQuestionToken,
} from "src/adapters/khanAcademy/khanAcademy.adapter";
import {
  HasuraQuestionToken,
  QuestionService,
} from "src/adapters/hasura/question.adapter";
import { SunbirdQuestionToken,QumlQuestionService as SunbirdQumlQuestionService  } from "src/adapters/sunbird/quml.adapter";
const ttl = process.env.TTL as never;
@Module({
  imports: [
    HttpModule,
    CacheModule.register({
      ttl: ttl,
    }),
  ],
  controllers: [QuestionController],
  providers: [
    SunbirdQumlQuestionService,
    KhanAcademyQuestionService,
    SunbirdQumlQuestionService,
    { provide: DikshaQuestionToken, useClass: DikshaQumlQuestionService },
    { provide: KhanAcademyQuestionToken, useClass: KhanAcademyQuestionService },
    { provide: HasuraQuestionToken, useClass: QuestionService },
    { provide: SunbirdQuestionToken, useClass: SunbirdQumlQuestionService}
  ],
})
export class QuestionModule {}
