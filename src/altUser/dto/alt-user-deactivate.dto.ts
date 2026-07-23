import { Expose, Type } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsObject,
  IsString,
  ValidateNested,
} from "class-validator";

export class ALTUserDeactivateDto {
  @ApiProperty({
    type: [String],
    description: "Username List for deactivation",
  })
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  @ArrayMaxSize(10)
  @Type(() => String)
  @Expose()
  usernames: string[];
}
