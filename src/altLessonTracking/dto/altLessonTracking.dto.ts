import { Exclude, Expose } from "class-transformer";
import { IsNotEmpty, IsNumber, IsString, IsUUID } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class ALTLessonTrackingDto {
  @Expose()
  @IsNotEmpty()
  @IsUUID()
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
  @IsNumber()
  attempts: number;

  @Expose()
  @IsNotEmpty()
  @IsString()
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
