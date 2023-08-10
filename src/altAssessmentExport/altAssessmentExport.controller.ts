import {
    Controller,
    Get,
    Post,
    Patch,
    Param,
    Query,
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
    ApiQuery,
  } from "@nestjs/swagger";
import { ALTAssessmentExportService } from "src/adapters/hasura/altAsssessmentExport.adapter";
  
  @ApiTags("ALT Assessment Export")
  @Controller("altassessmentexport")
  export class ALTAssessmentExportController {
    constructor(private altAssessmentExportService: ALTAssessmentExportService) {}
  
    @Get("/altgetassessmentexport/:assessmentid")
    // @ApiBasicAuth("access-token")
    @ApiOkResponse({ description: "ALT Assessment Export" })
    @ApiForbiddenResponse({ description: "Forbidden" })
    @UseInterceptors(ClassSerializerInterceptor)
    public async getAssessmentExport(
      @Req() request: Request,
      @Param("assessmentid") assessmentId: string
    ) {
        return this.altAssessmentExportService.getAssessmentRecords(request,assessmentId);
    }
  }
  