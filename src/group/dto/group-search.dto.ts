import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { GroupDto } from "./group.dto";
export class GroupSearchDto {
  @ApiProperty({
    type: Number,
    description: "Limit",
  })
  limit: number;

  @ApiProperty({
    type: Number,
    description: "number",
  })
  page: number;

  @ApiProperty({
    type: Object,
    description: "Filters",
  })
  @ApiPropertyOptional()
  filters: object;

  constructor(partial: Partial<GroupSearchDto>) {
    Object.assign(this, partial);
  }
}
