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
import { ALTModuleTrackingService } from "../adapters/hasura/altModuleTracking.adapter";
import { ALTModuleTrackingSearch } from "./dto/searchAltModuleTracking.dto";
import { ALTModuleTrackingDto } from "./dto/altModuleTracking.dto";
import { UpdateALTModuleTrackingDto } from "./dto/updateAltModuleTracking.dto";

@ApiTags("ALT Module Tracking")
@Controller("altmoduletracking")
export class ALTModuleTrackingController {
  constructor(private altModuleTrackingService: ALTModuleTrackingService) {}

  @Get("/altexistingmoduletrackingrecords")
  @ApiBasicAuth("access-token")
  @ApiOkResponse({ description: "ALT Module Tracking Records" })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @ApiQuery({ name: "courseid" })
  @ApiQuery({ name: "moduleid" })
  public async getModuleTrackingRecords(
    @Req() request: Request,
    @Query("courseid") courseId: string,
    @Query("moduleid") moduleId: string
  ) {
    return this.altModuleTrackingService.getExistingModuleTrackingRecords(
      request,
      moduleId,
      courseId
    );
  }

  @Get("/altmoduletrackingdetails")
  @ApiBasicAuth("access-token")
  @ApiOkResponse({ description: "ALT Module Tracking Details" })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @ApiQuery({ name: "moduleid" })
  public async getLessonDetails(
    @Req() request: Request,
    @Query("moduleid") moduleId: string
  ) {
    return this.altModuleTrackingService.getALTModuleTracking(
      request,
      moduleId
    );
  }

  @Post("/altcheckandaddmoduletracking")
  @ApiBasicAuth("access-token")
  @ApiCreatedResponse({
    description: "ALTModuleTrack has been created successfully.",
  })
  @ApiBody({ type: ALTModuleTrackingDto })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @UseInterceptors(ClassSerializerInterceptor)
  public async createALTModuleTracking(
    @Req() request: Request,
    @Query("program") programId: string,
    @Query("subject") subject: string,
    @Query("noOfModules") noOfModules: number,
    @Body() altModuleTrackingDto: ALTModuleTrackingDto
  ) {
    return this.altModuleTrackingService.checkAndAddALTModuleTracking(
      request,
      programId,
      subject,
      noOfModules,
      false,
      altModuleTrackingDto
    );
  }

  @Patch("/altupdatemoduletracking/")
  @ApiBasicAuth("access-token")
  @UseInterceptors(ClassSerializerInterceptor, CacheInterceptor)
  @ApiBody({ type: UpdateALTModuleTrackingDto })
  @ApiCreatedResponse({
    description: "ALTModuleTrack has been updated successfully.",
  })
  @ApiForbiddenResponse({ description: "Forbidden" })
  public async updateALTModuleTracking(
    @Req() request: Request,
    @Query("moduleid") moduleId: string,
    @Query("courseid") courseId: string,
    @Body() updateAltModuleTrackingDto: UpdateALTModuleTrackingDto
  ) {
    return this.altModuleTrackingService.updateALTModuleTracking(
      request,
      moduleId,
      courseId,
      updateAltModuleTrackingDto
    );
  }

  @Post("/search/:userid")
  @ApiBasicAuth("access-token")
  @ApiCreatedResponse({ description: "Module list." })
  @ApiBody({ type: ALTModuleTrackingSearch })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({
    strategy: "excludeAll",
  })
  public async searchALTModuleTracking(
    @Req() request: Request,
    @Param("userid") userId: string,
    @Body() altModuleTrackingSearch: ALTModuleTrackingSearch
  ) {
    return this.altModuleTrackingService.searchALTModuleTracking(
      request,
      userId,
      altModuleTrackingSearch
    );
  }
}
