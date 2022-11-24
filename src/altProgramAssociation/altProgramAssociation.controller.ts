import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Param,
  Body,
  UseInterceptors,
  ClassSerializerInterceptor,
  SerializeOptions,
  Req,
  Request,
  CacheInterceptor,
  Inject,
} from "@nestjs/common";
import {
  ApiTags,
  ApiBody,
  ApiOkResponse,
  ApiForbiddenResponse,
  ApiCreatedResponse,
  ApiBasicAuth,
} from "@nestjs/swagger";
import { ALTSubjectListDto } from "src/altProgramAssociation/dto/altSubjectList.dto";
import { TermsProgramtoRulesDto } from "src/altProgramAssociation/dto/altTermsProgramtoRules.dto";
import { ALTProgramAssociationService } from "src/adapters/hasura/altProgramAssociation.adapter";
import { ProgramAssociationDto } from "./dto/altProgramAssociation.dto";
import { UpdateALTProgramAssociationDto } from "./dto/updateAltProgramAssociation.dto";
import { ALTProgramAssociationSearch } from "./dto/searchAltProgramAssociation.dto";

@ApiTags("ALT Program Association")
@Controller("altprogramassociation")
export class ALTProgramAssociationController {
  constructor(
    private altProgramAssociationService: ALTProgramAssociationService
  ) {}

  @Post("/altsubjectlist")
  @ApiBasicAuth("access-token")
  @ApiOkResponse({ description: "ALT Subject List" })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @ApiBody({ type: ALTSubjectListDto })
  public async getSubjectList(
    @Req() request: Request,
    @Body() altSubjectListDto: ALTSubjectListDto
  ) {
    return this.altProgramAssociationService.getSubjectList(
      request,
      altSubjectListDto
    );
  }

  @Post("/altrules")
  @ApiBasicAuth("access-token")
  @ApiOkResponse({ description: "ALT Rules" })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @ApiBody({ type: TermsProgramtoRulesDto })
  public async getRules(
    @Req() request: Request,
    @Body() altTermstoRulesDto: TermsProgramtoRulesDto
  ) {
    return this.altProgramAssociationService.getRules(
      request,
      altTermstoRulesDto
    );
  }

  @Post("/create-program")
  @ApiBasicAuth("access-token")
  @ApiCreatedResponse({ description: "Program has been created successfully." })
  @ApiBody({ type: ProgramAssociationDto })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @UseInterceptors(ClassSerializerInterceptor)
  public async createProgram(
    @Req() request: Request,
    @Body() programAssociationDto: ProgramAssociationDto
  ) {
    return this.altProgramAssociationService.createProgramAssociation(
      request,
      programAssociationDto
    );
  }

  @Patch("/altUpdateProgram/:programAssocNumber")
  @ApiBasicAuth("access-token")
  @UseInterceptors(ClassSerializerInterceptor, CacheInterceptor)
  @ApiBody({ type: UpdateALTProgramAssociationDto })
  @ApiCreatedResponse({
    description: "ALTProgram has been updated successfully.",
  })
  @ApiForbiddenResponse({ description: "Forbidden" })
  public async updateALTProgram(
    @Req() request: Request,
    @Param("programassocno") programAssocNo: string,
    @Body() updateProgramAssociationDto: UpdateALTProgramAssociationDto
  ) {
    return "Not Functional";
    // this.altProgramAssociationService.updateProgramAssociation(
    //   programAssocNo,
    //   updateProgramAssociationDto
    // );
  }

  @Post("/search")
  @ApiBasicAuth("access-token")
  @ApiCreatedResponse({ description: "School list." })
  @ApiBody({ type: ALTProgramAssociationSearch })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({
    strategy: "excludeAll",
  })
  public async searchALTProgramAssociation(
    @Req() request: Request,
    @Body() altProgramSearch: ALTProgramAssociationSearch
  ) {
    return this.altProgramAssociationService.searchALTProgramAssociation(
      request,
      altProgramSearch
    );
  }
}
