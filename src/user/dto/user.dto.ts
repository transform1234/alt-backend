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
    description: "The full name of the user",
  })
  @Expose()
  name: string;

  @ApiProperty({
    type: String,
    description: "username",
  })
  @Expose()
  username: string;

  @ApiProperty({
    type: String,
    description: "The email of the user",
  })
  @Expose()
  @IsEmail()
  email: string;

  @ApiProperty({
    type: String,
    description: "The contact number of the user",
  })
  @Expose()
  mobile: string;

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
    type: String,
    description: "role of user",
  })
  @Expose()
  role: string;

  @ApiProperty({
    type: String,
    description: "The school of the user",
  })
  @Expose()
  schoolUdise: string;

  @ApiProperty({
    type: String,
    description: "Password",
  })
  @Expose()
  password: string;

  @ApiProperty({
    type: Boolean,
    description: "Status",
  })
  @Expose()
  status: boolean;

  @Expose()
  createdAt: string;

  @Expose()
  updatedAt: string;

  @Expose()
  createdBy: string;

  @Expose()
  updatedBy: string;

  constructor(obj: any) {
    this.userId = obj?.userId ? `${obj.userId}` : "";
    this.name = obj?.name ? `${obj.name}` : "";
    this.username = obj?.username ? `${obj.username}` : "";
    this.schoolUdise = obj?.schoolUdise ? `${obj.schoolUdise}` : "";
    this.email = obj?.email ? `${obj.email}` : "";
    this.mobile = obj?.mobile ? obj.mobile : "";
    this.gender = obj?.gender ? `${obj.gender}` : "";
    this.dateOfBirth = obj?.dateOfBirth ? `${obj.dateOfBirth}` : "";
    this.status = obj?.status ? obj.status : false;
    this.role = obj?.role ? `${obj.role}` : "";
    this.password = obj?.password ? `${obj.password}` : "";
    // this.createdAt = obj?.createdAt ? `${obj.createdAt}` : "";
    // this.updatedAt = obj?.updatedAt ? `${obj.updatedAt}` : "";
    this.createdBy = obj?.createdBy ? `${obj.createdBy}` : "";
    this.updatedBy = obj?.updatedBy ? `${obj.updatedBy}` : "";
  }
}

/* 
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
    description: "The school of the user",
  })
  @Expose()
  school: string;
 

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


  */
