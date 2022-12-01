import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { GroupMembershipDto } from "./groupMembership.dto";

export class GroupMembershipSearchDto {
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
    type: GroupMembershipDto,
    description: "Filters",
  })
  @ApiPropertyOptional()
  filters: GroupMembershipDto;

  constructor(partial: Partial<GroupMembershipSearchDto>) {
    Object.assign(this, partial);
  }
}
