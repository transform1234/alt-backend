import { Exclude, Expose } from "class-transformer";
import {
  MaxLength,
  IsNotEmpty,
  IsEmail,
  IsString,
  IsNumber,
  IsNumberString,
  IsOptional,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class GroupDto {
  @Expose()
  @IsOptional()
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

  @ApiPropertyOptional({
    type: String,
    description: "The Academic Year",
  })
  @Expose()
  @IsNumberString()
  academicYear: string;

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
