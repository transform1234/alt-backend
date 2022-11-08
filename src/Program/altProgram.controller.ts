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
import {
    ProgramService
} from "../adapters/hasura/altProgram.adapter";
import { FBMGStoProgramDto } from "./dto/fbmgstoProgram.dto";
import {
    ProgramDto
} from "./dto/program.dto"

@ApiTags("ALT Program")
@Controller("altprogram")
export class SelfAssessmentController {
    constructor(
        private programService: ProgramService
    ){}

    @Get("/:id")
    @UseInterceptors(ClassSerializerInterceptor, CacheInterceptor)
    @ApiBasicAuth("access-token")
    @ApiOkResponse({description: "Program Detail"})
    @ApiForbiddenResponse({ description: "Forbidden" })
    @SerializeOptions({
      strategy: "excludeAll",
    })
    public async getProgramById(@Req() request: Request,@Param("id")id: string) {     
        return this.programService.getProgramDetailsById(id.trim());
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
        return this.programService.createProgram(request,programDto);
    }

    @Post("/fbmgs")
    @ApiBasicAuth("access-token")
    @ApiCreatedResponse({ description: "Program has been found." })
    @ApiBody({ type: FBMGStoProgramDto })
    @ApiForbiddenResponse({ description: "Forbidden" })
    @UseInterceptors(ClassSerializerInterceptor)
    public async getProgramByBMGS(
      @Req() request: Request,
      @Body() fbgmstoprogramdto: FBMGStoProgramDto
    ) {
        return this.programService.getCurrentProgramId(request, fbgmstoprogramdto);
    }
}