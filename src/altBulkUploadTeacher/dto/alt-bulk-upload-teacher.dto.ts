import { Exclude, Expose } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { TeacherDto } from "src/altTeacher/dto/alt-teacher.dto";

export class ALTBulkUploadTeacherDto {
  @ApiProperty({
    type: String,
    description: "School Udise",
  })
  @Expose()
  schoolUdise: string;

  @ApiProperty({
    type: [String],
    description: "Group Id",
  })
  @Expose()
  groupIds: string[];

  @ApiProperty({
    type: String,
    description: "Password",
  })
  @Expose()
  password: string;

  @ApiProperty({
    type: [TeacherDto],
    description: "Teacher List",
  })
  @Expose()
  teachers: TeacherDto[];
}
