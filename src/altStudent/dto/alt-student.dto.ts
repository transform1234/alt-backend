import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Exclude, Expose, Transform } from "class-transformer";
import {
  MaxLength,
  IsNotEmpty,
  IsEmail,
  IsString,
  IsNumber,
  IsOptional,
  IsUUID,
  Matches,
  IsDate,
  IsNumberString,
  IsEnum,
} from "class-validator";

enum Gender {
  Male = "Male",
  Female = "Female",
  Others = "Others",
}

enum Promotion {
  deactivated = "deactivated",
  promoted = "promoted",
}

export class StudentDto {
  @Expose()
  @IsUUID()
  @IsOptional()
  userId: string;

  @ApiProperty({
    type: String,
    description: "The full name of the user",
  })
  @IsString()
  @Transform(({ value }) => (value ? value.trim() : value))
  @Expose()
  name: string;

  @ApiProperty({
    type: String,
    description: "username",
  }) // Auto Generated if not provided
  @IsString()
  @Transform(({ value }) => (value ? value.trim() : value))
  @Expose()
  username: string;

  @ApiProperty({
    type: String,
    description: "The email of the user",
  })
  @Expose()
  @Transform((params) => (params.value === "" ? null : params.value))
  @IsOptional()
  @IsEmail()
  email: string;

  @ApiProperty({
    type: String,
    description: "The contact number of the user",
  })
  @Expose()
  @IsString()
  @Matches(/^[6-9]\d{9}$/, { message: "Invalid mobile number" })
  mobile: string;

  @ApiProperty({
    enum: Gender,
    description: "The gender of the user",
    example: Gender.Female,
  })
  @Expose()
  @Transform(({ value }) => (value ? value.trim() : value))
  @IsEnum(Gender)
  gender: string;

  @ApiProperty({
    type: Date,
    description: "The birthDate of the user",
    example: "2000-12-31",
  })
  @Expose()
  @Transform(({ value }) => value && new Date(value))
  @IsDate()
  dateOfBirth: Date;

  // @ApiProperty({
  //   type: String,
  //   description: "role of user",
  // })
  @Expose()
  role: string;

  @ApiProperty({
    type: String,
    description: "the user board",
  })
  @Expose()
  @IsString()
  @Transform(({ value }) => (value ? value.trim() : value))
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
  @Transform(({ value }) => (value ? value.trim() : value))
  className: string;

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
  @IsOptional()
  @IsNumberString()
  @Transform((params) => (params.value === "" ? null : params.value))
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

  @ApiProperty({
    type: Number,
    description: "No of Siblings",
  })
  @Expose()
  @IsNumber()
  noOfSiblings: number;

  @ApiProperty()
  @Expose()
  studentEnrollId: string;

  @ApiProperty({
    enum: Promotion,
    description: "User is deactivated or goes to next class",
    example: Promotion.promoted,
  })
  @Expose()
  @Transform(({ value }) => (value ? value.trim() : value))
  @IsEnum(Promotion)
  @IsOptional()
  promotion: string; // keep blank when user is new

  @Expose()
  @IsString()
  @IsOptional()
  schoolName: string;

  constructor(obj: any, all: boolean) {
    this.userId = obj?.userId ? `${obj.userId}` : "";
    this.studentId = obj?.studentId ? `${obj.studentId}` : "";
    this.groups = [];
    this.religion = obj?.religion ? `${obj.religion}` : "";
    this.board = obj?.board ? `${obj.board}` : "";
    this.studentEnrollId = obj?.studentEnrollId ? `${obj.studentEnrollId}` : "";
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
      this.dateOfBirth = obj?.dateOfBirth ? obj?.dateOfBirth : new Date();
      this.gender = obj?.gender ? `${obj?.gender}` : "";
      this.mobile = obj?.mobile ? `${obj?.mobile}` : "";
      this.name = obj?.name ? `${obj?.name}` : "";
      this.role = obj?.role ? `${obj?.role}` : "";
      this.username = obj?.username ? `${obj?.username}` : "";
      this.password = obj?.password ? `${obj?.password}` : "";
      this.schoolName = obj?.schoolName ? `${obj?.schoolName}` : "";
      this.className = obj?.className ? `${obj?.className}` : "";
    }
  }
}
