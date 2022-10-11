import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class ALTCourseTrackingSearch {
  @ApiProperty({
    type: Number,
    description: "Limit",
  })
  limit: number;

  @ApiProperty({
    type: Object,
    description: "Filters",
  })
  @ApiPropertyOptional()
  filters: object;

  constructor(partial: Partial<ALTCourseTrackingSearch>) {
    Object.assign(this, partial);
  }
}