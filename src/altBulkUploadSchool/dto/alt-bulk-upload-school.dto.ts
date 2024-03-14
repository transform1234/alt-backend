import { Exclude, Expose, Type } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { SchoolDto } from "src/school/dto/school.dto";
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsObject,
  IsString,
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

export class ALTNewGroupsDto {
  @ApiProperty({
    type: [String],
    description: "School Udise List for new groups",
  })
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  @ArrayMaxSize(10)
  @Type(() => String)
  @Expose()
  schoolUdiseList: string[];
}
