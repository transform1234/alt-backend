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
import { request } from "http";
import { ALTLessonTrackingDto } from "./dto/altLessonTracking.dto";
import { ALTLessonTrackingService } from "../adapters/hasura/altLessonTracking.adapter";
import { UpdateALTLessonTrackingDto } from "./dto/updateAltLessonTracking.dto";
import { ALTLessonTrackingSearch } from "./dto/searchAltLessonTracking.dto";

@ApiTags("ALT Lesson Tracking")
@Controller("altlessontracking")
export class ALTLessonTrackingController {
  constructor(private altLessonTrackingService: ALTLessonTrackingService) {}

  @Get("/altlessontrackingdetails")
  @ApiBasicAuth("access-token")
  @ApiOkResponse({ description: "ALT Lesson Tracking Details" })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @ApiQuery({ name: "lessonid" })
  public async getLessonDetails(
    @Req() request: Request,
    @Query("lessonid") lessonId: string
  ) {
    return this.altLessonTrackingService.getALTLessonTracking(request,lessonId);
  }

  @Post("/altcheckandaddlessontracking")
  @ApiBasicAuth("access-token")
  @ApiCreatedResponse({
    description: "ALTLessonTrack has been created successfully.",
  })
  @ApiBody({ type: ALTLessonTrackingDto })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @UseInterceptors(ClassSerializerInterceptor)
  public async createALTLessonTracking(
    @Req() request: Request,
    @Query("program") programId: string,
    @Query("subject") subject: string,
    @Body() altLessonTrackingDto: ALTLessonTrackingDto
  ) {
    return this.altLessonTrackingService.checkAndAddALTLessonTracking(
      request,
      programId,
      subject,
      altLessonTrackingDto
    );
  }

  @Patch("/altupdatelessontracking/:userid")
  @ApiBasicAuth("access-token")
  @UseInterceptors(ClassSerializerInterceptor, CacheInterceptor)
  @ApiBody({ type: UpdateALTLessonTrackingDto })
  @ApiCreatedResponse({
    description: "ALTLessonTrack has been updated successfully.",
  })
  @ApiForbiddenResponse({ description: "Forbidden" })
  public async updateALTLessonTracking(
    @Req() request: Request,
    @Query("lessonid") lessonId: string,
    @Body() updateALTLessonTrackingDto: UpdateALTLessonTrackingDto
  ) {
    return this.altLessonTrackingService.updateALTLessonTracking(
      request,
      lessonId,
      updateALTLessonTrackingDto,
      0
    );
  }

  @Post("/search")
  @ApiBasicAuth("access-token")
  @ApiCreatedResponse({ description: "Lesson list." })
  @ApiBody({ type: ALTLessonTrackingSearch })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({
    strategy: "excludeAll",
  })
  public async searchSchool(
    @Req() request: Request,
    @Body() altLessonTrackingSearch: ALTLessonTrackingSearch
  ) {
    return this.altLessonTrackingService.searchALTLessonTracking(
      request,
      altLessonTrackingSearch
    );
  }
}
