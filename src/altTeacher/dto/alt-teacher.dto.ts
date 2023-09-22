import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Exclude, Expose } from "class-transformer";
import {
  MaxLength,
  IsNotEmpty,
  IsEmail,
  IsString,
  IsNumber,
} from "class-validator";

export class TeacherDto {
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
  }) // Auto Generated if not provided
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

  // @ApiProperty()
  // @Expose()
  // className: string;

  @ApiProperty()
  @Expose()
  groups: string[];

  @ApiProperty()
  @Expose()
  educationalQualification: string;

  @ApiProperty({
    type: String,
    description: "The school of the user",
  })
  @Expose()
  schoolUdise: string;

  @ApiProperty()
  @Expose()
  currentRole: string;

  @ApiProperty()
  @Expose()
  natureOfAppointment: string;

  @ApiProperty()
  @Expose()
  appointedPost: string;

  @ApiProperty()
  @Expose()
  totalTeachingExperience: string;

  @ApiProperty()
  @Expose()
  totalHeadteacherExperience: string;

  @ApiPropertyOptional()
  @Expose()
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
      this.dateOfBirth = obj?.dateOfBirth ? `${obj?.dateOfBirth}` : "";
      this.gender = obj?.gender ? `${obj?.gender}` : "";
      this.mobile = obj?.mobile ? `${obj?.mobile}` : "";
      this.name = obj?.name ? `${obj?.name}` : "";
      this.role = obj?.role ? `${obj?.role}` : "";
      this.username = obj?.username ? `${obj?.username}` : "";
    }
  }
}
