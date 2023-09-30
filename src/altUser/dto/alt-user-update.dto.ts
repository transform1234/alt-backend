import { Exclude, Expose } from "class-transformer";
import {
  MaxLength,
  IsNotEmpty,
  IsEmail,
  IsString,
  IsNumber,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class ALTUserUpdateDto {
  @ApiProperty({
    type: String,
    description: "The full name of the user",
  })
  @Expose()
  name: string;

  @ApiProperty({
    type: String,
    description: "The contact number of the user",
  })
  @Expose()
  mobile: string;

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
  dateOfBirth: string;

  @ApiProperty({
    type: Boolean,
    description: "Status",
  })
  @Expose()
  status: boolean;

  @ApiProperty({
    type: String,
    description: "Password",
  })
  @Expose()
  password: string;

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
