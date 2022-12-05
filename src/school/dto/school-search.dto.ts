import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { SchoolDto } from "./school.dto";
export class SchoolSearchDto {
  @ApiProperty({
    type: String,
    description: "Limit",
  })
  limit: string;

  @ApiProperty({
    type: Number,
    description: "Page",
  })
  page: number;

  @ApiProperty({
    type: SchoolDto,
    description: "Filters",
  })
  @ApiPropertyOptional()
  filters: SchoolDto;

  constructor(partial: Partial<SchoolSearchDto>) {
    Object.assign(this, partial);
  }
}
