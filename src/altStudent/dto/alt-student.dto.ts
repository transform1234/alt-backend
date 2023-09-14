import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Exclude, Expose } from "class-transformer";
import {
  MaxLength,
  IsNotEmpty,
  IsEmail,
  IsString,
  IsNumber,
} from "class-validator";

export class StudentDto {
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
    description: "the user board",
  })
  @Expose()
  board: string;

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

  // Student fields
  @Expose()
  studentId: string;

  @ApiProperty()
  @Expose()
  groups: string[];

  @ApiProperty()
  @Expose()
  religion: string;

  @ApiProperty({
    type: String,
    description: "The school of the user",
  })
  @Expose()
  schoolUdise: string;

  @ApiProperty()
  @Expose()
  caste: string;

  @ApiProperty()
  @Expose()
  annualIncome: string;

  @ApiProperty()
  @Expose()
  motherEducation: string;

  @ApiProperty()
  @Expose()
  fatherEducation: string;

  @ApiProperty()
  @Expose()
  motherOccupation: string;

  @ApiPropertyOptional()
  @Expose()
  fatherOccupation: string;

  @ApiProperty()
  @Expose()
  noOfSiblings: number;

  constructor(obj: any, all: boolean) {
    this.userId = obj?.userId ? `${obj.userId}` : "";
    this.studentId = obj?.studentId ? `${obj.studentId}` : "";
    this.groups = obj?.groups ? obj.groups : [];
    this.religion = obj?.religion ? `${obj.religion}` : "";
    this.board = obj?.board ? `${obj.board}` : "";
    this.schoolUdise = obj?.schoolUdise ? obj.schoolUdise : "";
    this.caste = obj?.caste ? `${obj.caste}` : "";
    this.annualIncome = obj?.annualIncome ? `${obj.annualIncome}` : "";
    this.motherEducation = obj?.motherEducation ? `${obj.motherEducation}` : "";
    this.motherOccupation = obj?.motherOccupation ? obj.motherOccupation : "";
    this.fatherEducation = obj?.fatherEducation ? `${obj.fatherEducation}` : "";
    this.fatherOccupation = obj?.fatherOccupation
      ? `${obj.fatherOccupation}`
      : "";
    this.noOfSiblings = obj?.noOfSiblings ? obj.noOfSiblings : 0;
    this.createdBy = obj?.createdBy ? `${obj.createdBy}` : "";
    this.updatedBy = obj?.updatedBy ? `${obj.updatedBy}` : "";
    if (all) {
      this.email = obj?.email ? `${obj.email}` : "";
      this.dateOfBirth = obj?.dateOfBirth ? `${obj?.dateOfBirth}` : "";
      this.gender = obj?.gender ? `${obj?.gender}` : "";
      this.mobile = obj?.mobile ? `${obj?.mobile}` : "";
      this.name = obj?.name ? `${obj?.name}` : "";
      this.role = obj?.role ? `${obj?.role}` : "";
      this.username = obj?.username ? `${obj?.username}` : "";
    }
  }
}
