import { Exclude, Expose } from "class-transformer";
import {
  IsNotEmpty,
  IsString,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class FBMGStoProgramDto{
    
    @Expose()
    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        type: String,
        description: "Name of the Framework"
    })
    framework: string;

    @Expose()
    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        type: String,
        description: "Name of the Board"
    })
    board: string;

    @Expose()
    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        type: String,
        description: "Name of the Medium"
    })
    medium: string;

    @Expose()
    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        type: String,
        description: "Name of the Grade"
    })
    grade: string;

    @Expose()
    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        type: String,
        description: "Name of the Subject"
    })
    subject: string;

}