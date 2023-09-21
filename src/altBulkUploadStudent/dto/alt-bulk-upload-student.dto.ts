import { Exclude, Expose } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { StudentDto } from "src/altStudent/dto/alt-student.dto";

export class ALTBulkUploadStudentDto {
  // @ApiProperty({
  //   type: String,
  //   description: "School Udise",
  // })
  // @Expose()
  // schoolUdise: string;

  // @ApiProperty({
  //   type: String,
  //   description: "Group Id",
  // })
  // @Expose()
  // groupId: string;

  // @ApiProperty({
  //   type: String,
  //   description: "Password",
  // })
  // @Expose()
  // password: string;

  @ApiProperty({
    type: [StudentDto],
    description: "Student List",
  })
  @Expose()
  students: StudentDto[];
}
