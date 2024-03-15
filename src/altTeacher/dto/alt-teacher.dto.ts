import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Exclude, Expose, Transform } from "class-transformer";
import {
  MaxLength,
  IsNotEmpty,
  IsEmail,
  IsString,
  IsNumber,
  IsDate,
  IsUUID,
  IsOptional,
  Matches,
  IsEnum,
} from "class-validator";

enum Gender {
  Male = "Male",
  Female = "Female",
  Others = "Others",
}

enum ClassesTaught {
  Secondary = "Secondary",
  Middle = "Middle",
  Both = "Both",
}

enum EducationalQualification {
  Below_Secondary = "Below_Secondary",
  Higher_Secondary = "Higher_Secondary",
  Graduation = "Graduation",
  Post_Graduation = "Post_Graduation",
  PhD = "PhD",
  BEd = "BEd",
  MEd = "MEd",
  MPhil = "MPhil",
  Post_Doctoral = "Post_Doctoral",
}

enum CurrentRole {
  Teacher = "Teacher",
  Head_Teacher = "Head_Teacher",
  Head_Teacher_In_Charge = "Head_Teacher_In_Charge",
  Community_Academic_Volunteer = "Community_Academic_Volunteer",
}

export class TeacherDto {
  @Expose()
  @IsUUID()
  @IsOptional()
  userId: string;

  @ApiProperty({
    type: String,
    description: "The full name of the user",
  })
  @IsString()
  @Transform(({ value }) => value.trim())
  @Expose()
  name: string;

  @ApiProperty({
    type: String,
    description: "username",
  }) // Auto Generated if not provided
  @IsString()
  @Transform(({ value }) => value.trim())
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
  @Transform(({ value }) => value.trim())
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
  @Transform(({ value }) => value.trim())
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

  // Teacher fields
  @Expose()
  teacherId: string;

  @Expose()
  groups: string[];

  @ApiProperty({
    enum: EducationalQualification,
    description: "The educational qualification of the user",
  })
  @Expose()
  @Transform((params) => (params.value === "" ? null : params.value))
  @IsOptional()
  @IsEnum(EducationalQualification)
  educationalQualification: string;

  @ApiProperty({
    type: String,
    description: "The school of the user",
  })
  @Expose()
  schoolUdise: string;

  @ApiProperty({
    enum: CurrentRole,
    description: "The current role of teacher",
  })
  @Expose()
  @Transform((params) => (params.value === "" ? null : params.value))
  @IsOptional()
  @IsEnum(CurrentRole)
  currentRole: string;

  @ApiProperty()
  @Expose()
  @IsString()
  natureOfAppointment: string;

  @ApiProperty()
  @Expose()
  @IsString()
  appointedPost: string;

  @ApiProperty()
  @Expose()
  totalTeachingExperience: string;

  @ApiProperty()
  @Expose()
  totalHeadteacherExperience: string;

  @ApiProperty({
    enum: ClassesTaught,
    description: "The Classes Taught",
    example: ClassesTaught.Middle,
  })
  @Expose()
  @Transform(({ value }) => value.trim())
  @IsEnum(ClassesTaught)
  classesTaught: string;

  @ApiProperty()
  @Expose()
  coreSubjectTaught: string;

  @ApiProperty()
  @Expose()
  attendedInserviceTraining: string;

  @ApiProperty()
  @Expose()
  lastTrainingAttendedTopic: string;

  @ApiProperty()
  @Expose()
  lastTrainingAttendedYear: string;

  @ApiProperty()
  @Expose()
  trainedInComputerDigitalteaching: string;

  constructor(obj: any, all: boolean) {
    this.userId = obj?.userId ? `${obj.userId}` : "";
    this.teacherId = obj?.teacherId ? `${obj.teacherId}` : "";
    this.groups = obj?.groups ? obj.groups : [];
    this.board = obj?.board ? `${obj.board}` : "";
    this.schoolUdise = obj?.schoolUdise ? obj.schoolUdise : "";
    this.educationalQualification = obj?.educationalQualification
      ? `${obj.educationalQualification}`
      : "";
    this.currentRole = obj?.currentRole ? `${obj.currentRole}` : "";
    this.natureOfAppointment = obj?.natureOfAppointment
      ? `${obj.natureOfAppointment}`
      : "";
    this.appointedPost = obj?.appointedPost ? `${obj.appointedPost}` : "";
    this.totalTeachingExperience = obj?.totalTeachingExperience
      ? `${obj.totalTeachingExperience}`
      : "";
    this.totalHeadteacherExperience = obj?.totalHeadteacherExperience
      ? `${obj.totalHeadteacherExperience}`
      : "";
    this.classesTaught = obj?.classesTaught ? obj?.classesTaught : "";
    this.coreSubjectTaught = obj?.coreSubjectTaught
      ? obj.coreSubjectTaught
      : "";
    this.attendedInserviceTraining = obj?.attendedInserviceTraining
      ? obj.attendedInserviceTraining
      : "";
    this.lastTrainingAttendedTopic = obj?.lastTrainingAttendedTopic
      ? obj.lastTrainingAttendedTopic
      : "";
    this.lastTrainingAttendedYear = obj?.lastTrainingAttendedYear
      ? obj.lastTrainingAttendedYear
      : "";
    this.trainedInComputerDigitalteaching =
      obj?.trainedInComputerDigitalteaching
        ? obj.trainedInComputerDigitalteaching
        : "";
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
    }
  }
}
