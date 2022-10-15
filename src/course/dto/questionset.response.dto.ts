import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Expose } from "class-transformer";

export class questionsetSearchDto {
  @ApiProperty({
    type: Object,
    description: "Request",
  })
  @Expose()
  questions: object;
  @Expose()
  count: string;

  constructor(partial: Partial<questionsetSearchDto>) {
    Object.assign(this, partial);
  }
}
