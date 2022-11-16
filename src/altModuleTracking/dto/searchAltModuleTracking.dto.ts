import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { ALTModuleTrackingDto } from "./altModuleTracking.dto";

export class ALTModuleTrackingSearch {
  @ApiProperty({
    type: Number,
    description: "Limit",
  })
  limit: number;

  @ApiProperty({
    type: ALTModuleTrackingDto,
    description: "Filters",
  })
  @ApiPropertyOptional()
  filters: ALTModuleTrackingDto;

  constructor(partial: Partial<ALTModuleTrackingSearch>) {
    Object.assign(this, partial);
  }
}
