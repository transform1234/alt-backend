import { Exclude, Expose } from "class-transformer";
import {
  MaxLength,
  IsNotEmpty,
  IsEmail,
  IsString,
  IsNumber,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class GroupDto {
  @Expose()
  groupId: string;

  @ApiPropertyOptional({
    type: String,
    description: "The schoolUdise of the group",
  })
  @Expose()
  schoolUdise: string;

  @ApiPropertyOptional({
    type: String,
    description: "The medium of the group",
  })
  @Expose()
  medium: string;


  @ApiPropertyOptional({
    type: String,
    description: "The grade of the group",
  })
  @Expose()
  grade: string;

  @ApiPropertyOptional({
    type: String,
    description: "The name of the group",
  })
  @Expose()
  name: string;

  @ApiPropertyOptional({
    type: String,
    description: "The type of the group",
  })
  @Expose()
  type: string;

  @ApiPropertyOptional({
    type: String,
    description: "The section of the group",
  })
  @Expose()
  section: string;

  @ApiPropertyOptional({
    type: String,
    description: "The status of the group",
  })
  @Expose()
  status: string;

  @ApiPropertyOptional({
    type: String,
    description: "The board of the group",
  })
  @Expose()
  board: string;

  // @ApiPropertyOptional({
  //   type: String,
  //   description: "Teacher Id of Group",
  // })
  // @Expose()
  // teacherId: string;

  // @ApiPropertyOptional({
  //   type: String,
  //   description: "Parent Id of Group",
  // })
  // @Expose()
  // parentGroupId: string;

  // @ApiPropertyOptional()
  // @Expose()
  // deactivationReason: string;

  // @ApiPropertyOptional({
  //   type: String,
  //   description: "The mediumOfInstruction of the group",
  // })
  // @Expose()
  // mediumOfInstruction: string;

  // @ApiPropertyOptional({ type: "string", format: "binary" })
  // @Expose()
  // image: string;

  // @ApiPropertyOptional()
  // @Expose()
  // metaData: [string];

  // @ApiPropertyOptional()
  // @Expose()
  // option: [string];

  // @ApiPropertyOptional({
  //   description: "Grade against group",
  // })
  // @Expose()
  // gradeLevel: string;

  @Expose()
  createdBy: string;

  @Expose()
  updatedBy: string;

  @Expose()
  createdAt: string;

  @Expose()
  updatedAt: string;

  constructor(obj: any) {
    Object.assign(this, obj);
  }
}
