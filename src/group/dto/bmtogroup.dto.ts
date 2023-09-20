import { Exclude, Expose } from "class-transformer";
import { IsDate, IsNotEmpty, IsString } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class BMtoGroupDto {
  @Expose()
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    type: String,
    description: "Name of the Board",
  })
  board: string;

  @Expose()
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    type: String,
    description: "Name of the Medium",
  })
  medium: string;

  @Expose()
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    type: String,
    description: "The schoolUdise of the group",
  })
  schoolUdise: string;
}
