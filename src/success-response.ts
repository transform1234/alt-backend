import { Expose } from "class-transformer";

export class SuccessResponse {
  @Expose()
  statusCode: number;

  @Expose()
  message: string;

  @Expose()
  data: any;

  constructor(partial: Partial<SuccessResponse>) {
    Object.assign(this, partial);
  }
}
