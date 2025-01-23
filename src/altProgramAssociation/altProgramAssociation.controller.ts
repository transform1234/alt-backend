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
  Query,
  HttpStatus,
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
import { SentryInterceptor } from "src/common/sentry.interceptor";

@UseInterceptors(SentryInterceptor)
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

  @Post("/glaUserContent")
  @ApiBasicAuth("access-token")
  @ApiOkResponse({ description: "ALT Rules" })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @ApiBody({ type: TermsProgramtoRulesDto })
  public async getGlaUserContent(
    @Req() request: Request,
    @Body() altTermstoRulesDto: TermsProgramtoRulesDto,
    @Query("page") page: any,
    @Query("limit") limit: any
  ) {
    return this.altProgramAssociationService.getGlaUserContent(
      request,
      altTermstoRulesDto,
      page,
      limit
    );
  }
  @Post("/contentSearch")
  @ApiBasicAuth("access-token")
  public async contentSearch(@Req() request: Request, @Body() body: any) {
    return this.altProgramAssociationService.contentSearch(request, body);
  }

  // Like content
  @Post("contentLike")
  @ApiBasicAuth("access-token")
  @ApiOkResponse({ description: "ALT Rules" })
  @ApiForbiddenResponse({ description: "Forbidden" })
  async contentLike(@Body() body: any, @Req() request: Request) {
    const { programId, subject, contentId, like } = body;

    if (!programId || !subject || !contentId || like === undefined) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: "Invalid request body. Missing required fields.",
      };
    }

    return this.altProgramAssociationService.likeContent(request, {
      programId,
      subject,
      contentId,
      like,
    });
  }

  @Post("isContentLiked")
  @ApiBasicAuth("access-token")
  @ApiOkResponse({ description: "ALT Rules" })
  @ApiForbiddenResponse({ description: "Forbidden" })
  async isContentLike(@Body() body: any, @Req() request: Request) {
    const { programId, subject, contentId } = body;

    if (!programId || !subject || !contentId) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: "Invalid request body. Missing required fields.",
      };
    }

    return this.altProgramAssociationService.isContentLike(request, {
      programId,
      subject,
      contentId,
    });
  }

  // Rate content
  @Post("rateQuiz")
  @ApiBasicAuth("access-token")
  @ApiOkResponse({ description: "ALT Rules" })
  @ApiForbiddenResponse({ description: "Forbidden" })
  async rateQuiz(@Body() body: any, @Req() request: Request) {
    const { programId, subject, assessmentId, rating } = body;

    if (!programId || !subject || !assessmentId || rating === undefined) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: "Invalid request body. Missing required fields.",
      };
    }

    return this.altProgramAssociationService.rateQuiz(request, {
      programId,
      subject,
      assessmentId,
      rating,
    });
  }

  @Post("isQuizRated")
  @ApiBasicAuth("access-token")
  @ApiOkResponse({ description: "ALT Rules" })
  @ApiForbiddenResponse({ description: "Forbidden" })
  async isQuizRated(@Body() body: any, @Req() request: Request) {
    const { programId, subject, contentId } = body;

    if (!programId || !subject || !contentId) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: "Invalid request body. Missing required fields.",
      };
    }

    return this.altProgramAssociationService.isQuizRated(request, {
      programId,
      subject,
      contentId,
    });
  }

  @Get("getUserPoints")
  @ApiBasicAuth("access-token")
  @ApiOkResponse({ description: "ALT Rules" })
  @ApiForbiddenResponse({ description: "Forbidden" })
  async getUserPoints(
    @Body() body: any,
    @Req() request: Request,
    @Query("page") page: any,
    @Query("limit") limit: any
  ) {
    return this.altProgramAssociationService.getUserPoints(
      request,
      page,
      limit
    );
  }

  @Post("addUserPoints")
  @ApiBasicAuth("access-token")
  @ApiOkResponse({ description: "ALT Rules" })
  @ApiForbiddenResponse({ description: "Forbidden" })
  async addUserPoints(@Body() body: any, @Req() request: Request) {
    const { identifier, description } = body;

    return this.altProgramAssociationService.addUserPoints(request, {
      identifier,
      description,
    });
  }

  @Post("leaderBoardPoints")
  @ApiBasicAuth("access-token")
  @ApiOkResponse({ description: "ALT Rules" })
  @ApiForbiddenResponse({ description: "Forbidden" })
  async leaderBoardPoints(@Body() body: any, @Req() request: Request) {
    const { filters, timeframe } = body;

    return this.altProgramAssociationService.leaderBoardPoints(request, {
      filters,
      timeframe,
    });
  }
  @Post("/migration")
  async migartionOfLessonData(@Req() request: Request, @Body() programId) {
    return this.altProgramAssociationService.assignProgramPoints(
      request,
      programId
    );
  }
}
