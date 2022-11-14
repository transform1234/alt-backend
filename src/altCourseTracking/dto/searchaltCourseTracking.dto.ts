import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { ALTCourseTrackingDto } from "src/altCourseTracking/dto/altCourseTracking.dto";

export class ALTCourseTrackingSearch {
  @ApiProperty({
    type: Number,
    description: "Limit",
  })
  limit: number;

  @ApiProperty({
    type: ALTCourseTrackingDto,
    description: "Filters",
  })
  @ApiPropertyOptional()
  filters: ALTCourseTrackingDto;

  constructor(partial: Partial<ALTCourseTrackingSearch>) {
    Object.assign(this, partial);
  }
}
