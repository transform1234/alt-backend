import { Exclude, Expose, Type } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { SchoolDto } from "src/school/dto/school.dto";
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsObject,
  ValidateNested,
} from "class-validator";

export class ALTBulkUploadSchoolDto {
  @ApiProperty({
    type: [SchoolDto],
    description: "School List",
  })
  @IsArray()
  @IsObject({ each: true })
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @ArrayMaxSize(120)
  @Type(() => SchoolDto)
  @Expose()
  schools: SchoolDto[];
}
