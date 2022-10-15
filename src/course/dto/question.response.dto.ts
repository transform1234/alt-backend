import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Expose } from "class-transformer";

export class questionSearchDto {
  @ApiProperty({
    type: Object,
    description: "Request",
  })
  @Expose()
  copyright: string;
  @Expose()
  subject: [];
  @Expose()
  channel: string;
  @Expose()
  downloadUrl: string;
  @Expose()
  responseDeclaration: {};
  @Expose()
  language: [];
  @Expose()
  mimeType: string;
  @Expose()
  variants: {};
  @Expose()
  body: string;
  @Expose()
  editorState: {};
  @Expose()
  templateId: string;
  @Expose()
  objectType: string;
  @Expose()
  se_mediums: [];
  @Expose()
  gradeLevel: [];
  @Expose()
  primaryCategory: string;
  @Expose()
  contentEncoding: string;
  @Expose()
  artifactUrl: string;
  @Expose()
  se_gradeLevels: [];
  @Expose()
  showSolutions: string;
  @Expose()
  identifier: string;
  @Expose()
  audience: [];
  @Expose()
  visibility: string;
  @Expose()
  showTimer: string;
  @Expose()
  author: string;
  @Expose()
  solutions: [];
  @Expose()
  qType: string;
  @Expose()
  languageCode: [];
  @Expose()
  version: string;
  @Expose()
  se_subjects: [];
  @Expose()
  license: string;
  @Expose()
  interactionTypes: [];
  @Expose()
  name: string;
  @Expose()
  status: string;
  @Expose()
  code: string;
  @Expose()
  prevStatus: string;
  @Expose()
  medium: [];
  @Expose()
  media: [];
  @Expose()
  createdOn: string;
  @Expose()
  interactions: [];
  @Expose()
  se_boards: [];
  @Expose()
  contentDisposition: string;
  @Expose()
  lastUpdatedOn: string;
  @Expose()
  allowAnonymousAccess: string;
  @Expose()
  lastStatusChangedOn: string;
  @Expose()
  se_FWIds: [];
  @Expose()
  bloomsLevel: string;
  @Expose()
  pkgVersion: number;
  @Expose()
  versionKey: string;
  @Expose()
  showFeedback: string;
  @Expose()
  framework: string;
  @Expose()
  answer: string;
  @Expose()
  createdBy: string;
  @Expose()
  compatibilityLevel: number;
  @Expose()
  board: string;

  constructor(partial: Partial<questionSearchDto>) {
    Object.assign(this, partial);
  }
}
