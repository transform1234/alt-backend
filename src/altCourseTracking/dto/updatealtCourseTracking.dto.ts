import { Exclude, Expose } from "class-transformer";
import {
  IsNotEmpty,
  IsString,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class UpdateALTCourseTrackingDto {

    @Expose()
    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        type: String,
        description: "Name of the next Course to be taken"
    })
    nextCourse: string;

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
    calculatedScore: number;


    @Expose()
    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        type: String,
        description: "Status of course"
    })
    status: string;

    constructor(obj:any){
        Object.assign(this,obj);
    }
}