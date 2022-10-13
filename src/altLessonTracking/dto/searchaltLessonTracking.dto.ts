import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class ALTLessonTrackingSearch {
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

  constructor(partial: Partial<ALTLessonTrackingSearch>) {
    Object.assign(this, partial);
  }
}