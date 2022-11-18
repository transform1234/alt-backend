import { ApiProperty, PartialType } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { IsNotEmpty, IsString, IsUUID } from "class-validator";
import { ProgramAssociationDto } from "./altProgramAssociation.dto";

// export class UpdateALTProgramAssociationDto extends PartialType(ProgramAssociationDto) {
//     constructor(obj: any) {
//         super(obj);
//         Object.assign(this, obj);
//       }
// }

export class UpdateALTProgramAssociationDto {
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
