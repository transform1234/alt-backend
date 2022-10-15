import { Exclude, Expose } from "class-transformer";
import {
  IsNotEmpty,
  IsString,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class UpdateALTLessonTrackingDto {

    @Expose()
    @IsNotEmpty()
    @IsString()
    @ApiProperty({
      type: String,
      description: "Status of course",
    })
    status: string;

    @Expose()
    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        type: Number,
        description: "Number of Attempts taken",
    })
    attempts: number;

    @Expose()
    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        type: Number,
        description: "Name of the next Course to be taken",
    })
    score: number;

    @Expose()
    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        type: String,
        description: "Score of the course",
    })
    scoreDetails: String;


  constructor(obj: any) {
    Object.assign(this, obj);
  }
}