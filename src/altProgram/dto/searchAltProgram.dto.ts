import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { ProgramDto } from "./program.dto";

export class ALTProgramSearch {
  @ApiProperty({
    type: Number,
    description: "Limit",
  })
  limit: number;

  @ApiProperty({
    type: ProgramDto,
    description: "Filters",
  })
  @ApiPropertyOptional()
  filters: ProgramDto;

  constructor(partial: Partial<ALTProgramSearch>) {
    Object.assign(this, partial);
  }
}
