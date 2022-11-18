import { Exclude, Expose } from "class-transformer";
import { IsUUID, IsString, IsNotEmpty, IsDate } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class ProgramAssociationDto {
  @Expose()
  @IsUUID()
  progAssocNo: number; // AUTO GENERATED

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
    description: "Name of the Grade",
  })
  grade: string;

  @Expose()
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    type: String,
    description: "Name of the Subject",
  })
  subject: string;

  @Expose()
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    description: "Rules of respctive courses",
  })
  rules: string;

  @Expose()
  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    description: "Associated Program Id",
  })
  programId: string;

  @Expose()
  created_at: string;

  @Expose()
  updated_at: string;

  constructor(obj: any) {
    Object.assign(this, obj);
  }
}
