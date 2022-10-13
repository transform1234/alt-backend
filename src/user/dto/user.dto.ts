import { Exclude, Expose } from "class-transformer";
import {
  MaxLength,
  IsNotEmpty,
  IsEmail,
  IsString,
  IsNumber,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class UserDto {
  @Expose()
  userId: string;

  @ApiProperty({
    type: String,
    description: "The first name of the user",
  })
  @Expose()
  name: string;

  @ApiProperty({
    type: String,
    description: "The contact number of the user",
  })
  @Expose()
  mobileNumber: string;

  @ApiProperty({
    type: String,
    description: "The email of the user",
  })
  @Expose()
  @IsEmail()
  email: string;

  @ApiProperty({
    type: String,
    description: "The gender of the user",
  })
  @Expose()
  gender: string;

  @ApiProperty({
    type: String,
    description: "The birthDate of the user",
  })
  @Expose()
  birthDate: string;

  @ApiProperty({
    type: String,
    description: "The bloodGroup of the user",
  })
  @Expose()
  bloodGroup: string;

  @ApiProperty({
    type: String,
    description: "Student grade section",
  })
  @Expose()
  section: string;

  @ApiProperty({
    type: String,
    description: "username",
  })
  @Expose()
  username: string;

  @ApiProperty({
    type: String,
    description: "user udise Id",
  })
  @Expose()
  udise: string;

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

  @ApiProperty({
    type: String,
    description: "The school of the user",
  })
  @Expose()
  school: string;

  @ApiPropertyOptional()
  @Expose()
  grade: string;

  @ApiProperty()
  @Expose()
  block: string;

  @ApiProperty()
  @Expose()
  district: string;

  @ApiProperty()
  @Expose()
  state: string;

  @ApiProperty({
    type: String,
    description: "The image of the user",
  })
  @Expose()
  image: string;

  @ApiProperty({
    type: String,
    description: "The status of the user",
  })
  @Expose()
  status: string;

  @ApiProperty({
    type: String,
    description: "roleId of user, teacher, mentor,monitor",
  })
  @Expose()
  role: string;

  @Expose()
  created_at: string;

  @Expose()
  updated_at: string;

  @Expose()
  created_by: string;

  @Expose()
  updated_by: string;

  constructor(obj: any) {
    Object.assign(this, obj);
  }
}
