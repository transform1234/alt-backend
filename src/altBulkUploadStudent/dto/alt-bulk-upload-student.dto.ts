import { Exclude, Expose, Type } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { StudentDto } from "src/altStudent/dto/alt-student.dto";
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsObject,
  ValidateNested,
} from "class-validator";

export class ALTBulkUploadStudentDto {
  @ApiProperty({
    type: [StudentDto],
    description: "Student List",
  })
  @IsArray()
  @IsObject({ each: true })
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @ArrayMaxSize(120)
  @Type(() => StudentDto)
  @Expose()
  students: StudentDto[];
}
