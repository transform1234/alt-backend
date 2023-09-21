import { Exclude, Expose } from "class-transformer";
import {
  MaxLength,
  IsNotEmpty,
  IsEmail,
  IsString,
  IsNumber,
  IsIn,
  IsEnum,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class SchoolDto {
  @Expose()
  schoolId: string;

  @ApiProperty({
    type: String,
    description: "The udise of the school",
  })
  @Expose()
  udiseCode: string;

  @ApiProperty({
    type: String,
    description: "The schoolName of the school",
  })
  @Expose()
  name: string;

  @ApiProperty({
    type: String,
    description: "The location of the school",
  })
  @Expose()
  location: string;

  @ApiProperty({
    type: String,
    description: "The management of the school",
  })
  @Expose()
  management: string;

  @ApiProperty({
    type: String,
    description: "The composition of the school",
  })
  @Expose()
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
    type: String,
    description: "The Head master type of the school",
  })
  @Expose()
  headmasterType: string;


  @ApiProperty({
    type: String,
    description: "The headmaster Mobile of the school",
  })
  @Expose()
  headmasterMobile: string;

  @ApiProperty({
    type: Number,
    description: "The upper Primary Teachers Sanctioned of the school",
  })
  @Expose()
  upperPrimaryTeachersSanctioned: number;

  @ApiProperty({
    type: Number,
    description: "The secondary Teachers Sanctioned of the school",
  })
  @Expose()
  secondaryTeachersSanctioned: number;

  @ApiProperty({
    type: String,
    description: "The library Functional of the school",
    default: false,
  })
  @Expose()
  libraryFunctional: string;

  @ApiProperty({
    type: String,
    description: "The computer Lab Functional of the school",
    default: false,
  })
  @Expose()
  computerLabFunctional: string;

  @ApiProperty({
    type: Number,
    description: "The total Functional Computers of the school",
  })
  @Expose()
  totalFunctionalComputers: number;

  @ApiProperty({
    type: Number,
    description: "The no Of Boys Toilet  of the school",
  })
  @Expose()
  noOfBoysToilet: number;

  @ApiProperty({
    type: Number,
    description: "The no Of Girls Toilet  of the school",
  })
  @Expose()
  noOfGirlsToilet: number;

  @ApiProperty({
    type: String,
    description: "The smrt Brd 6 Functional  of the school",
    default: false,
  })
  @Expose()
  smartBoardFunctionalClass6: string;

  @ApiProperty({
    type: String,
    description: "The smrt Brd 7 Functional  of the school",
    default: false,
  })
  @Expose()
  smartBoardFunctionalClass7: string;

  @ApiProperty({
    type: String,
    description: "The smrt Brd 8 Functional  of the school",
    default: false,
  })
  @Expose()
  smartBoardFunctionalClass8: string;

  @ApiProperty({
    type: String,
    description: "The smrt Brd 9 Functional  of the school",
    default: false,
  })
  @Expose()
  smartBoardFunctionalClass9: string;

  @ApiProperty({
    type: String,
    description: "The smrt Brd 10 Functional  of the school",
    default: false,
  })
  @Expose()
  smartBoardFunctionalClass10: string;

  @ApiProperty({
    type: String,
    description: "The state of the school",
  })
  @Expose()
  state: string;

  @ApiProperty({
    type: String,
    description: "The district of the school",
  })
  @Expose()
  district: string;

  @ApiProperty({
    type: String,
    description: "The block of the school",
  })
  @Expose()
  block: string;

  @ApiProperty({
    type: Boolean,
    description: "The adequate Rooms For Every Class  of the school",
    default: false,
  })
  @Expose()
  adequateRoomsForEveryClass: boolean;

  @ApiProperty({
    type: Boolean,
    description: "The drinking Water Supply  of the school",
    default: false,
  })
  @Expose()
  drinkingWaterSupply: boolean;

  @ApiProperty({
    type: Boolean,
    description: "The seperate Toilet For Girls And Boys  of the school",
    default: false,
  })
  @Expose()
  seperateToiletForGirlsAndBoys: boolean;

  @ApiProperty({
    type: Boolean,
    description: "The whether Toilet Being Used  of the school",
    default: false,
  })
  @Expose()
  whetherToiletBeingUsed: boolean;

  @ApiProperty({
    type: Boolean,
    description: "The playground Available  of the school",
    default: false,
  })
  @Expose()
  playgroundAvailable: boolean;

  @ApiProperty({
    type: Boolean,
    description: "The boundary Wall Fence  of the school",
    default: false,
  })
  @Expose()
  boundaryWallFence: boolean;

  @ApiProperty({
    type: Boolean,
    description: "The electric Fittings Are Insulated  of the school",
    default: false,
  })
  @Expose()
  electricFittingsAreInsulated: boolean;

  @ApiProperty({
    type: Boolean,
    description:
      "The building Is Resistant To Earthquake Fire Flood Other Calamity  of the school",
    default: false,
  })
  @Expose()
  buildingIsResistantToEarthquakeFireFloodOtherCalamity: boolean;

  @ApiProperty({
    type: Boolean,
    description:
      "The building Is Free From Inflammable And Toxic Materials  of the school",
    default: false,
  })
  @Expose()
  buildingIsFreeFromInflammableAndToxicMaterials: boolean;

  @ApiProperty({
    type: Boolean,
    description: "The roof And Walls Are In Good Condition  of the school",
    default: false,
  })
  @Expose()
  roofAndWallsAreInGoodCondition: boolean;

  // @ApiProperty({
  //   type: String,
  //   description: "The email of the school",
  // })
  // @IsEmail()
  // @Expose()
  // email: string;

  // @ApiProperty({
  //   type: Number,
  //   description: "The phone number of the school",
  // })
  // @IsNumber()
  // @Expose()
  // phoneNumber: Number;

  // @ApiProperty({
  //   type: String,
  //   description: "The address of the school",
  // })
  // @Expose()
  // address: string;

  // @ApiProperty({
  //   type: String,
  //   description: "The schoolType of the school",
  // })
  // @Expose()
  // schoolType: string;

  // @ApiProperty({
  //   type: String,
  //   description: "The website of the school",
  // })
  // @Expose()
  // website: string;

  // @ApiProperty({
  //   type: String,
  //   description: "The village of the school",
  // })
  // @Expose()
  // village: string;

  // @ApiProperty({
  //   type: Number,
  //   description: "The pincode of the school",
  // })
  // @Expose()
  // pincode: Number;

  // @ApiProperty({
  //   type: String,
  //   description: "The cluster of the school",
  // })
  // @Expose()
  // cluster: string;

  // @ApiProperty({
  //   type: String,
  //   description: "The enrollCount of the school",
  // })
  // @Expose()
  // enrollCount: string;

  // @ApiProperty({
  //   type: String,
  //   description: "The status of the school",
  // })
  // @Expose()
  // status: string;

  // @ApiProperty({
  //   type: Number,
  //   description: "The latitude of the school",
  // })
  // @Expose()
  // latitude: Number;

  // @ApiProperty({
  //   type: Number,
  //   description: "The longitude of the school",
  // })
  // @Expose()
  // longitude: Number;

  // @ApiPropertyOptional()
  // @Expose()
  // metaData: [string];

  // @ApiPropertyOptional({})
  // @Expose()
  // deactivationReason: string;

  @Expose()
  createdAt: string;

  @Expose()
  updatedAt: string;

  constructor(obj: any) {
    Object.assign(this, obj);
  }
}
