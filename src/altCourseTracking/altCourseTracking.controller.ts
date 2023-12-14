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
import { ALTCourseTrackingService } from "../adapters/hasura/altCourseTracking.adapter";
import { ALTCourseTrackingDto } from "./dto/altCourseTracking.dto";
import { ALTCourseTrackingSearch } from "./dto/searchaltCourseTracking.dto";
import { UpdateALTCourseTrackingDto } from "./dto/updatealtCourseTracking.dto";

@ApiTags("ALT Course Tracking")
@Controller("alt-course-tracking")
export class ALTCourseTrackingController {
  constructor(private altCourseTrackingService: ALTCourseTrackingService) {}

  @Get("/altcoursetrackingdetails")
  @ApiBasicAuth("access-token")
  @ApiOkResponse({ description: "ALT Course Tracking Details" })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @ApiQuery({
    name: "userId",
    type: String,
    description: "A parameter. Optional",
    required: false,
  })
  @ApiQuery({ name: "courseid" })
  public async getCourseDetails(
    @Req() request: Request,
    @Query("courseid") courseId: string,
    @Query("userId") userId?: string
  ) {
    return this.altCourseTrackingService.getExistingCourseTrackingRecords(
      request,
      courseId,
      userId
    );
  }

  @Post("/addcoursetracking")
  @ApiBasicAuth("access-token")
  @ApiCreatedResponse({
    description: "ALTCourseTrack has been created successfully.",
  })
  @ApiBody({ type: ALTCourseTrackingDto })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @UseInterceptors(ClassSerializerInterceptor)
  public async createALTCourseTracking(
    @Req() request: Request,
    @Query("modulestatus") moduleStatus: string,
    @Body() altCourseTrackingDto: ALTCourseTrackingDto
  ) {
    const res = this.altCourseTrackingService.addALTCourseTracking(
      request,
      altCourseTrackingDto,
      moduleStatus,
      false
    );

    return res;
  }

  @Patch("/altupdatecoursetracking/")
  @ApiBasicAuth("access-token")
  @UseInterceptors(ClassSerializerInterceptor, CacheInterceptor)
  @ApiBody({ type: UpdateALTCourseTrackingDto })
  @ApiCreatedResponse({
    description: "ALTCourseTrack has been updated successfully.",
  })
  @ApiForbiddenResponse({ description: "Forbidden" })
  public async updateALTCourseTracking(
    @Req() request: Request,
    @Body() updateALtCourseTrackingDto: UpdateALTCourseTrackingDto
  ) {
    const res = this.altCourseTrackingService.updateALTCourseTracking(
      request,
      updateALtCourseTrackingDto
    );

    return res;
  }

  @Post("/search/:userid")
  @ApiBasicAuth("access-token")
  @ApiCreatedResponse({ description: "Course list." })
  @ApiBody({ type: ALTCourseTrackingSearch })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({
    strategy: "excludeAll",
  })
  public async searchaltCourseTracking(
    @Req() request: Request,
    @Param("userid") userId: string,
    @Body() altCourseTrackingSearch: ALTCourseTrackingSearch
  ) {
    return this.altCourseTrackingService.searchALTCourseTracking(
      request,
      userId,
      altCourseTrackingSearch
    );
  }
}
