import { Expose, Type } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";
import { TeacherDto } from "src/altTeacher/dto/alt-teacher.dto";
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsObject,
  ValidateNested,
} from "class-validator";

export class ALTBulkUploadTeacherDto {
  @ApiProperty({
    type: [TeacherDto],
    description: "Teacher List",
  })
  @IsArray()
  @IsObject({ each: true })
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @ArrayMaxSize(120)
  @Type(() => TeacherDto)
  @Expose()
  teachers: TeacherDto[];
}
