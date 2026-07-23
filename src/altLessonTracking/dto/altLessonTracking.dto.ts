import { Expose } from "class-transformer";
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class ALTLessonTrackingDto {
  @Expose()
  @IsUUID()
  @IsOptional()
  userId: string;

  @Expose()
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    type: String,
    description: "ID of the respective enrolled course",
  })
  courseId: string;

  @Expose()
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    type: String,
    description: "ID of the module of the lesson",
  })
  moduleId: string;

  @Expose()
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    type: String,
    description: "ID of the respective Lesson",
  })
  lessonId: string;

  @Expose()
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    type: String,
    description: "Status of lesson",
  })
  status: string; 

  @Expose()
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    type: String,
    description: "Type of lesson",
  })
  contentType: string;

  @Expose()
  @IsNotEmpty()
  @IsInt()
  @ApiProperty({
    type: Number,
    description: "Time spent on lesson",
  })
  timeSpent: number;

  @Expose()
  @IsOptional()
  @IsNumber()
  attempts: number;

  @Expose()
  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    type: Number,
    description: "Score of the lesson",
  })
  score: number;

  @Expose()
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    type: String,
    description: "ScoreDetails of the lesson",
  })
  scoreDetails: String;

  @Expose()
  @IsUUID()
  @IsOptional()
  programId: String;

  @Expose()
  created_at: string;

  @Expose()
  updated_at: string;

  @Expose()
  createdBy: string;

  @Expose()
  updatedBy: string;

  constructor(obj: any) {
    Object.assign(this, obj);
  }
}
