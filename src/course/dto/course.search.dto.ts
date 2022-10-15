import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CourseSearchDto {
  @ApiProperty({
    type: Object,
    description: "Request",
  })
  @ApiPropertyOptional()
  request: object;

  constructor(partial: Partial<CourseSearchDto>) {
    Object.assign(this, partial);
  }
}
