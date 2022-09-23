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
    SelfAssessmentService
} from "../adapters/hasura/selfAssessment.adapter";
import { FBMGStoProgramDto } from "./dto/fbmgstoProgram.dto";
import {
    ProgramDto
} from "./dto/program.dto"

@ApiTags("Self Assessment")
@Controller("self-assessment")
export class SelfAssessmentController {
    constructor(
        private selfAssessmentService: SelfAssessmentService
    ){}

    @Get("/:id")
    @UseInterceptors(ClassSerializerInterceptor, CacheInterceptor)
    @ApiBasicAuth("access-token")
    @ApiOkResponse({description: "Program Detail"})
    @ApiForbiddenResponse({ description: "Forbidden" })
    @SerializeOptions({
      strategy: "excludeAll",
    })
    public async getProgramById(@Req() request: Request,@Param("id")id: string){     
        return this.selfAssessmentService.getProgramById(request,id);
    }

    @Post("/create-program")
    @ApiBasicAuth("access-token")
    @ApiCreatedResponse({ description: "Program has been created successfully." })
    @ApiBody({ type: ProgramDto })
    @ApiForbiddenResponse({ description: "Forbidden" })
    @UseInterceptors(ClassSerializerInterceptor)
    public async createSchool(
      @Req() request: Request,
      @Body() programDto: ProgramDto
    ) {
        return this.selfAssessmentService.createProgram(request,programDto);
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
        return this.selfAssessmentService.getProgramByFBMGS(request, fbgmstoprogramdto);
    }
}