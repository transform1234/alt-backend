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
    Inject
} from "@nestjs/common";
import {
    ApiTags,
    ApiBody,
    ApiOkResponse,
    ApiForbiddenResponse,
    ApiCreatedResponse,
    ApiBasicAuth,
    ApiQuery
} from "@nestjs/swagger";
import { request } from "http";
import { ALTLessonTrackingDto } from "./dto/altLessonTracking.dto";
 import { ALTLessonTrackingService } from "../adapters/hasura/altLessonTracking.adapter";
import { UpdateALTLessonTrackingDto } from "./dto/updateAltLessonTracking.dto";
import { ALTLessonTrackingSearch } from "./dto/searchaltLessonTracking.dto";

@ApiTags("ALT Lesson Tracking")
@Controller("altlessontracking")
export class ALTLessonTrackingController {
    constructor(
        private altLessonTrackingService: ALTLessonTrackingService
    ){}

    @Get("/altlessontrackingdetails")
    @ApiBasicAuth("access-token")
    @ApiOkResponse({description: "ALT Course Tracking Details"})
    @ApiForbiddenResponse({description: "Forbidden"})
    @ApiQuery({ name: "userid" })
    @ApiQuery({ name: "lessonid" })
    public async getCourseDetails(
        @Req() request: Request,
        @Query('userid') userId: string, // ?
        @Query('lessonid') lessonId : string,
        ){
            return this.altLessonTrackingService.getALTLessonTracking(lessonId,userId);
        }

    @Post("/altcreatecoursetracking")
    @ApiBasicAuth("access-token")
    @ApiCreatedResponse({description: "ALTCourseTrack has been created successfully."})
    @ApiBody({ type: ALTLessonTrackingDto })
    @ApiForbiddenResponse({ description: "Forbidden" })
    @UseInterceptors(ClassSerializerInterceptor)
    public async createALTCourseTracking(
      @Req() request: Request,
      @Body() altLessonTrackingDto: ALTLessonTrackingDto
    ) {
       return this.altLessonTrackingService.createALTLessonTracking(request,altLessonTrackingDto);
    }

    @Patch("/altupdatelessontracking/:userid")
    @ApiBasicAuth("access-token")
    @UseInterceptors(ClassSerializerInterceptor, CacheInterceptor)
    @ApiBody({ type: UpdateALTLessonTrackingDto })
    @ApiCreatedResponse({ description: "ALTCourseTrack has been updated successfully." })
    @ApiForbiddenResponse({ description: "Forbidden" })
    public async updateALTCourseTracking(
        @Req() request: Request,
        @Param('userid') userId: string, 
        @Query('lessonid') lessonId : string,
        @Body() updateUserDto: UpdateALTLessonTrackingDto) {
            return this.altLessonTrackingService.updateALTCourseTracking(request, userId, lessonId, updateUserDto);
        }

  
    @Post("/search")
    @ApiBasicAuth("access-token")
    @ApiCreatedResponse({ description: "School list." })
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
            return this.altLessonTrackingService.searchALTLessonTracking(request, altLessonTrackingSearch);
        }
      
}