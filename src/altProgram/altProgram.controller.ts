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
import { ProgramService } from "../adapters/hasura/altProgram.adapter";
import { BMGStoProgramDto } from "./dto/bmgstoProgram.dto";
import { ProgramDto } from "./dto/program.dto";
import { ALTProgramSearch } from "./dto/searchAltProgram.dto";
import { UpdateALTProgramDto } from "./dto/updateAltProgram.dto";

@ApiTags("ALT Program")
@Controller("altprogram")
export class SelfAssessmentController {
  constructor(private programService: ProgramService) {}

  @Get("/:id")
  @UseInterceptors(ClassSerializerInterceptor, CacheInterceptor)
  @ApiBasicAuth("access-token")
  @ApiOkResponse({ description: "Program Detail" })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @SerializeOptions({
    strategy: "excludeAll",
  })
  public async getProgramById(
    @Req() request: Request,
    @Param("id") id: string
  ) {
    return this.programService.getProgramDetailsById(request,id.trim());
  }

  @Post("/bmgs")
  @ApiBasicAuth("access-token")
  @ApiCreatedResponse({ description: "Program has been found." })
  @ApiBody({ type: BMGStoProgramDto })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @UseInterceptors(ClassSerializerInterceptor)
  public async getProgramByBMGS(
    @Req() request: Request,
    @Body() bgmstoprogramdto: BMGStoProgramDto
  ) {
    return this.programService.getCurrentProgramId(request, bgmstoprogramdto);
  }

  @Post("/create-program")
  @ApiBasicAuth("access-token")
  @ApiCreatedResponse({ description: "Program has been created successfully." })
  @ApiBody({ type: ProgramDto })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @UseInterceptors(ClassSerializerInterceptor)
  public async createProgram(
    @Req() request: Request,
    @Body() programDto: ProgramDto
  ) {
    return this.programService.createProgram(request, programDto);
  }

  @Patch("/altUpdateProgram/:programid")
  @ApiBasicAuth("access-token")
  @UseInterceptors(ClassSerializerInterceptor, CacheInterceptor)
  @ApiBody({ type: UpdateALTProgramDto })
  @ApiCreatedResponse({
    description: "ALTProgram has been updated successfully.",
  })
  @ApiForbiddenResponse({ description: "Forbidden" })
  public async updateALTProgram(
    @Req() request: Request,
    @Param("programid") programId: string,
    @Body() updateProgramDto: UpdateALTProgramDto
  ) {
    return "Not Functional";
    // this.programService.updateProgram(programId, updateProgramDto);
  }

  @Post("/search")
  @ApiBasicAuth("access-token")
  @ApiCreatedResponse({ description: "School list." })
  @ApiBody({ type: ALTProgramSearch })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({
    strategy: "excludeAll",
  })
  public async searchALTProgram(
    @Req() request: Request,
    @Body() altProgramSearch: ALTProgramSearch
  ) {
    return this.programService.searchALTProgram(request,altProgramSearch);
  }
}
