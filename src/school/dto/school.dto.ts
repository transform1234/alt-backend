import { Exclude, Expose, Transform } from "class-transformer";
import {
  MaxLength,
  IsNotEmpty,
  IsEmail,
  IsString,
  IsNumber,
  IsIn,
  IsEnum,
  IsNumberString,
  IsUUID,
  IsOptional,
  Matches,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

enum Management {
  State_Government = "State_Government",
  Government_Aided = "Government_Aided",
  Tribal = "Tribal",
  Local_Bodies = "Local_Bodies",
  Private_Unaided = "Private_Unaided",
  Others = "Others",
}

enum Composition {
  Girls = "Girls",
  Boys = "Boys",
  CoEducation = "CoEducation",
}

enum HeadmasterType {
  FullTime = "FullTime",
  Incharge = "Incharge",
  PartTime = "PartTime",
}

enum SchoolLocation {
  Urban = "Urban",
  Rural = "Rural",
}

export class SchoolDto {
  @Expose()
  @IsUUID()
  @IsOptional()
  schoolId: string;

  @ApiProperty({
    type: String,
    description: "The udise of the school",
  })
  @IsNotEmpty()
  @IsNumberString()
  @Expose()
  udiseCode: string;

  @ApiProperty({
    type: String,
    description: "The schoolName of the school",
  })
  @IsNotEmpty()
  @IsString()
  @Expose()
  name: string;

  @ApiProperty({
    enum: SchoolLocation,
    description: "The location of the school",
  })
  @Expose()
  @IsEnum(SchoolLocation)
  location: string;

  @ApiProperty({
    enum: Management,
    description: "The management of the school",
  })
  @Expose()
  @IsEnum(Management)
  management: string;

  @ApiProperty({
    enum: Composition,
    description: "The composition of the school",
  })
  @Expose()
  @IsEnum(Composition)
  @IsOptional()
  @Transform((params) => (params.value === "" ? null : params.value))
  composition: string;

  @ApiProperty({
    type: String,
    description: "The Board of the school",
  })
  @Expose()
  board: string;

  @ApiProperty({
    type: [String],
    description: "The  medium of instruction of the school",
  })
  @Expose()
  mediumOfInstruction: [string];

  @ApiProperty({
    type: String,
    description: "The Head master of the school",
  })
  @Expose()
  headmaster: string;

  @ApiProperty({
    enum: HeadmasterType,
    description: "The Head master type of the school",
  })
  @Expose()
  @IsEnum(HeadmasterType)
  @Transform((params) => (params.value === "" ? null : params.value))
  headmasterType: string;

  @ApiProperty({
    type: String,
    description: "The headmaster Mobile of the school",
  })
  @Expose()
  @IsNumberString()
  @Matches(/^[6-9]\d{9}$/, { message: "Invalid mobile number" })
  @IsOptional()
  @Transform((params) => (params.value === "" ? null : params.value))
  headmasterMobile: string;

  @ApiProperty({
    type: Number,
    description: "The upper Primary Teachers Sanctioned of the school",
  })
  @Expose()
  @IsOptional()
  @Transform((params) => (params.value === "" ? null : params.value))
  upperPrimaryTeachersSanctioned: number;

  @ApiProperty({
    type: Number,
    description: "The secondary Teachers Sanctioned of the school",
  })
  @Expose()
  @IsOptional()
  @Transform((params) => (params.value === "" ? null : params.value))
  secondaryTeachersSanctioned: number;

  @ApiProperty({
    type: String,
    description: "The library Functional of the school",
    default: false,
  })
  @Expose()
  @IsOptional()
  @Transform((params) => (params.value === "" ? null : params.value))
  libraryFunctional: string;

  @ApiProperty({
    type: String,
    description: "The computer Lab Functional of the school",
    default: false,
  })
  @Expose()
  @IsOptional()
  @Transform((params) => (params.value === "" ? null : params.value))
  computerLabFunctional: string;

  @ApiProperty({
    type: Number,
    description: "The total Functional Computers of the school",
  })
  @Expose()
  @IsOptional()
  @Transform((params) => (params.value === "" ? null : params.value))
  totalFunctionalComputers: number;

  @ApiProperty({
    type: Number,
    description: "The no Of Boys Toilet  of the school",
  })
  @Expose()
  @IsOptional()
  @Transform((params) => (params.value === "" ? null : params.value))
  noOfBoysToilet: number;

  @ApiProperty({
    type: Number,
    description: "The no Of Girls Toilet  of the school",
  })
  @Expose()
  @IsOptional()
  @Transform((params) => (params.value === "" ? null : params.value))
  noOfGirlsToilet: number;

  @ApiProperty({
    type: String,
    description: "The smrt Brd 6 Functional  of the school",
  })
  @Expose()
  @IsOptional()
  @Transform((params) => (params.value === "" ? null : params.value))
  smartBoardFunctionalClass6: string;

  @ApiProperty({
    type: String,
    description: "The smrt Brd 7 Functional  of the school",
  })
  @Expose()
  @IsOptional()
  @Transform((params) => (params.value === "" ? null : params.value))
  smartBoardFunctionalClass7: string;

  @ApiProperty({
    type: String,
    description: "The smrt Brd 8 Functional  of the school",
  })
  @Expose()
  @IsOptional()
  @Transform((params) => (params.value === "" ? null : params.value))
  smartBoardFunctionalClass8: string;

  @ApiProperty({
    type: String,
    description: "The smrt Brd 9 Functional  of the school",
  })
  @Expose()
  @IsOptional()
  @Transform((params) => (params.value === "" ? null : params.value))
  smartBoardFunctionalClass9: string;

  @ApiProperty({
    type: String,
    description: "The smrt Brd 10 Functional  of the school",
  })
  @Expose()
  @IsOptional()
  @Transform((params) => (params.value === "" ? null : params.value))
  smartBoardFunctionalClass10: string;

  @ApiProperty({
    type: String,
    description: "The state of the school",
  })
  @Expose()
  @IsNotEmpty()
  state: string;

  @ApiProperty({
    type: String,
    description: "The district of the school",
  })
  @Expose()
  @IsNotEmpty()
  district: string;

  @ApiProperty({
    type: String,
    description: "The block of the school",
  })
  @Expose()
  @IsNotEmpty()
  block: string;

  @ApiProperty({
    type: Boolean,
    description: "The adequate Rooms For Every Class  of the school",
    default: false,
  })
  @Expose()
  @IsOptional()
  @Transform((params) => (params.value === "" ? null : params.value))
  adequateRoomsForEveryClass: boolean;

  @ApiProperty({
    type: Boolean,
    description: "The drinking Water Supply  of the school",
    default: false,
  })
  @Expose()
  @IsOptional()
  @Transform((params) => (params.value === "" ? null : params.value))
  drinkingWaterSupply: boolean;

  @ApiProperty({
    type: Boolean,
    description: "The seperate Toilet For Girls And Boys  of the school",
    default: false,
  })
  @Expose()
  @IsOptional()
  @Transform((params) => (params.value === "" ? null : params.value))
  seperateToiletForGirlsAndBoys: boolean;

  @ApiProperty({
    type: Boolean,
    description: "The whether Toilet Being Used  of the school",
    default: false,
  })
  @Expose()
  @IsOptional()
  @Transform((params) => (params.value === "" ? null : params.value))
  whetherToiletBeingUsed: boolean;

  @ApiProperty({
    type: Boolean,
    description: "The playground Available  of the school",
    default: false,
  })
  @Expose()
  @IsOptional()
  @Transform((params) => (params.value === "" ? null : params.value))
  playgroundAvailable: boolean;

  @ApiProperty({
    type: Boolean,
    description: "The boundary Wall Fence  of the school",
    default: false,
  })
  @Expose()
  @IsOptional()
  @Transform((params) => (params.value === "" ? null : params.value))
  boundaryWallFence: boolean;

  @ApiProperty({
    type: Boolean,
    description: "The electric Fittings Are Insulated  of the school",
    default: false,
  })
  @Expose()
  @IsOptional()
  @Transform((params) => (params.value === "" ? null : params.value))
  electricFittingsAreInsulated: boolean;

  @ApiProperty({
    type: Boolean,
    description:
      "The building Is Resistant To Earthquake Fire Flood Other Calamity  of the school",
    default: false,
  })
  @Expose()
  @IsOptional()
  @Transform((params) => (params.value === "" ? null : params.value))
  buildingIsResistantToEarthquakeFireFloodOtherCalamity: boolean;

  @ApiProperty({
    type: Boolean,
    description:
      "The building Is Free From Inflammable And Toxic Materials  of the school",
    default: false,
  })
  @Expose()
  @IsOptional()
  @Transform((params) => (params.value === "" ? null : params.value))
  buildingIsFreeFromInflammableAndToxicMaterials: boolean;

  @ApiProperty({
    type: Boolean,
    description: "The roof And Walls Are In Good Condition  of the school",
    default: false,
  })
  @Expose()
  @IsOptional()
  @Transform((params) => (params.value === "" ? null : params.value))
  roofAndWallsAreInGoodCondition: boolean;

  @Expose()
  createdAt: string;

  @Expose()
  updatedAt: string;

  constructor(obj: any) {
    Object.assign(this, obj);
  }
}
