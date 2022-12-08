import { Exclude, Expose } from "class-transformer";
import {
  MaxLength,
  IsNotEmpty,
  IsEmail,
  IsString,
  IsNumber,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class UserUpdateDto {
  @Expose()
  userId: string;

  @ApiProperty({
    type: String,
    description: "The contact number of the user",
  })
  @Expose()
  mobileNumber: string;

  @ApiProperty({
    type: String,
    description: "The birthDate of the user",
  })
  @Expose()
  birthDate: string;

  @ApiProperty({
    type: String,
    description: "The father's name of the user",
  })
  @Expose()
  father: string;

  @ApiProperty({
    type: String,
    description: "The father's name of the user",
  })
  @Expose()
  mother: string;

  @ApiProperty({
    type: String,
    description: "user udise Id",
  })
  @Expose()
  uniqueId: string;

  @ApiProperty({
    type: String,
    description: "user udise Id",
  })
  @Expose()
  udise: string;

  @ApiProperty({
    type: String,
    description: "user Serial Id",
  })
  @Expose()
  serialNo: string;

  @ApiProperty({
    type: String,
    description: "State",
  })
  @Expose()
  state: string;

  @ApiProperty({
    type: String,
    description: "District",
  })
  @Expose()
  district: string;

  @ApiProperty({
    type: String,
    description: "Student grade section",
  })
  @Expose()
  section: string;

  @ApiProperty()
  @Expose()
  block: string;

  @ApiProperty({
    type: String,
    description: "The school of the user",
  })
  @Expose()
  school: string;

  @ApiProperty({
    type: String,
    description: "the user board",
  })
  @Expose()
  board: string;

  @ApiProperty({
    type: String,
    description: "the user medium",
  })
  @Expose()
  medium: string;

  @ApiPropertyOptional()
  @Expose()
  grade: string;

  @ApiProperty({
    type: String,
    description: "roleId of user, teacher, mentor,monitor",
  })
  @Expose()
  role: string;

  @ApiProperty({
    type: String,
    description: "The gender of the user",
  })
  @Expose()
  gender: string;

  @ApiProperty({
    type: String,
    description: "The bloodGroup of the user",
  })
  @Expose()
  bloodGroup: string;

  @ApiProperty({
    type: String,
    description: "The status of the user",
  })
  @Expose()
  status: string;

  @ApiProperty({
    type: String,
    description: "The image of the user",
  })
  @Expose()
  image: string;

  @Expose()
  createdAt: string;

  @Expose()
  updatedAt: string;

  @Expose()
  createdBy: string;

  @Expose()
  updatedBy: string;

  constructor(obj: any) {
    Object.assign(this, obj);
  }
}
