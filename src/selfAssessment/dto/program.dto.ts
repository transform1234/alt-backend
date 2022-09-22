import { Exclude, Expose } from "class-transformer";
import {
    IsUUID,
    IsString,
    IsNotEmpty
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class ProgramDto {
    
    // @Expose()
    // @IsUUID()
    // @IsNotEmpty()
    // @ApiProperty({
    //     type: String,
    //     description: "ProgramId is UUID used to get ordering information",
    // })
    // programId: string; AUTO GENERATED

    @Expose()
    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        type: String,
        description: "Name of the Program",
    })
    programName: string;

    @Expose()
    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        type: String,
        description: "Rules are actual data needed for ordering",
    })
    rules: string;

    constructor(obj:any){
        Object.assign(this,obj);
    }
}