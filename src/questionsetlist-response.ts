import { Expose } from "class-transformer";

export class QuestionsetlistResponse {
  @Expose()
  id: string;

  @Expose()
  ver: string;
  @Expose()
  ts: string;
  @Expose()
  params: any;
  @Expose()
  responseCode: string;
  @Expose()
  result: any;

  constructor(partial: Partial<QuestionsetlistResponse>) {
    Object.assign(this, partial);
  }
}
