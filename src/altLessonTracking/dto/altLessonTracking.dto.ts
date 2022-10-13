import { Exclude, Expose } from "class-transformer";
import {
  IsNotEmpty,
  IsString,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class ALTLessonTrackingDto{
    
    @Expose()
    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        type: String,
        description: "UserId of the user"
    })
    userId: string;

    @Expose()
    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        type: String,
        description: "ID of the respective enrolled course"
    })
    courseId: string;

    @Expose()
    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        type: String,
        description: "ID of the respective Lesson"
    })
    lessonId: string;

    @Expose()
    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        type: String,
        description: "Status of course"
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
        description: "Score of the course"
    })
    score: number;

    @Expose()
    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        type: String,
        description: "ScoreDetails of the course"
    })
    scoreDetails: String;

    constructor(obj:any){
        Object.assign(this,obj);
    }
}