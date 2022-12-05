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
    type: GroupDto,
    description: "Filters",
  })
  @ApiPropertyOptional()
  filters: GroupDto;

  constructor(partial: Partial<GroupSearchDto>) {
    Object.assign(this, partial);
  }
}
