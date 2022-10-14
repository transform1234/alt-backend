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
import { ALTCourseTrackingService } from "../adapters/hasura/altCourseTracking.adapter";
import { ALTCourseTrackingDto } from "./dto/altCourseTracking.dto";
import { ALTCourseTrackingSearch } from "./dto/searchaltCourseTracking.dto";
import { UpdateALTCourseTrackingDto } from "./dto/updatealtCourseTracking.dto";

@ApiTags("ALT Course Tracking")
@Controller("alt-course-tracking")
export class ALTCourseTrackingController {
    constructor(
        private altCourseTrackingService: ALTCourseTrackingService
    ){}

    @Get("/altcoursetrackingdetails")
    @ApiBasicAuth("access-token")
    @ApiOkResponse({description: "ALT Course Tracking Details"})
    @ApiForbiddenResponse({description: "Forbidden"})
    @ApiQuery({ name: "userid" })
    @ApiQuery({ name: "courseid" })
    public async getCourseDetails(
        @Req() request:Request,
        @Query('userid') userId: string, // ?
        @Query('courseid') courseId : string,
        ){
            return this.altCourseTrackingService.getALTCourseTracking(courseId,userId);
        }

    @Post("/altcreatecoursetracking")
    @ApiBasicAuth("access-token")
    @ApiCreatedResponse({description: "ALTCourseTrack has been created successfully."})
    @ApiBody({ type: ALTCourseTrackingDto })
    @ApiForbiddenResponse({ description: "Forbidden" })
    @UseInterceptors(ClassSerializerInterceptor)
    public async createALTCourseTracking(
      @Req() request: Request,
      @Body() altCourseTrackingDto: ALTCourseTrackingDto
    ) {
        const res = this.altCourseTrackingService.createALTCourseTracking(request,altCourseTrackingDto);

        return res;
    }

    @Patch("/altupdatecoursetracking/:userid")
    @ApiBasicAuth("access-token")
    @UseInterceptors(ClassSerializerInterceptor, CacheInterceptor)
    @ApiBody({ type: UpdateALTCourseTrackingDto })
    @ApiCreatedResponse({ description: "ALTCourseTrack has been updated successfully." })
    @ApiForbiddenResponse({ description: "Forbidden" })
    public async updateALTCourseTracking(
        @Req() request: Request,
        @Param('userid') userId: string, 
        @Query('courseid') courseId : string,
        @Body() updateUserDto: UpdateALTCourseTrackingDto) {
            
        const res = this.altCourseTrackingService.updateALTCourseTracking(request, userId, courseId, updateUserDto);
        
    return res;
  }

    @Post("/search")
    @ApiBasicAuth("access-token")
    @ApiCreatedResponse({ description: "School list." })
    @ApiBody({ type: ALTCourseTrackingSearch })
    @ApiForbiddenResponse({ description: "Forbidden" })
    @UseInterceptors(ClassSerializerInterceptor)
    @SerializeOptions({
        strategy: "excludeAll",
    })
    public async searchSchool(
        @Req() request: Request,
        @Body() altCourseTrackingSearch: ALTCourseTrackingSearch
    ) {
        return this.altCourseTrackingService.searchALTCourseTracking(request, altCourseTrackingSearch);
    }
  
}