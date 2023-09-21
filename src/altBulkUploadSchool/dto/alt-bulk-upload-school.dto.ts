import { Exclude, Expose } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { SchoolDto } from "src/school/dto/school.dto";

export class ALTBulkUploadSchoolDto {
  @ApiProperty({
    type: [SchoolDto],
    description: "School List",
  })
  @Expose()
  schools: SchoolDto[];
}
