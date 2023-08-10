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
import { ALTTimeSpentExportService } from "src/adapters/hasura/altTimeSpentExport.adapter";

@ApiTags("ALT Time Spent Course Export")
@Controller("alttimespentexport")
export class ALTTimeSpentExportController {
  constructor(private altTimeSpentExportService: ALTTimeSpentExportService) {}

  @Get("/altgettimespentexport/:courseid")
  // @ApiBasicAuth("access-token")
  @ApiOkResponse({ description: "ALT Time Spent Course Export" })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiQuery({ name: "userid", required: true })
  public async getAssessmentExport(
    @Req() request: Request,
    @Param("courseid") courseId: string,
    @Query("userid") userId: string
  ) {
    return this.altTimeSpentExportService.getTimeSpentOnCourseRecords(
      request,
      courseId,
      userId
    );
  }

  @Get("/altgetuserlistbyschool/:schoolid")
  // @ApiBasicAuth("access-token")
  @ApiOkResponse({ description: "ALT Users by School" })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiQuery({ name: "filename", required: true })
  public async getUserListForSchool(
    @Req() request: Request,
    @Param("schoolid") schoolId: string,
    @Query("filename") fileName: string
  ) {
    return this.altTimeSpentExportService.getUserListForSchool(
      request,
      fileName,
      schoolId
    );
  }
}
