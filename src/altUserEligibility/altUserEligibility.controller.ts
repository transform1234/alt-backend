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
import { ALTUserEligibilityService } from "src/adapters/hasura/altUserEligibility.adapter";

@ApiTags("ALT User Eligibility")
@Controller("altusereligibility")
export class ALTUserEligibilityController {
  constructor(private altUserEligibilityService: ALTUserEligibilityService) {}

  @Post("/altusercourseeligibility")
  @ApiBasicAuth("access-token")
  @ApiOkResponse({ description: "ALT User Course Eligibility" })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @ApiQuery({
    name: "userId",
    type: String,
    description: "A parameter. Optional",
    required: false,
  })
  @UseInterceptors(ClassSerializerInterceptor)
  public async getALTUserCourseEligibility(
    @Req() request: Request,
    @Query("programId") programId: string,
    @Query("courseId") courseId: string,
    @Query("subject") subject: string,
    @Query("userId") userId?: string
  ) {
    return this.altUserEligibilityService.checkEligibilityforCourse(
      request,
      programId,
      courseId,
      subject,
      userId
    );
  }

  @Post("/altuserprogrameligibility")
  @ApiBasicAuth("access-token")
  @ApiOkResponse({ description: "ALT User Program Eligibility" })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @ApiQuery({
    name: "userId",
    type: String,
    description: "A parameter. Optional",
    required: false,
  })
  @UseInterceptors(ClassSerializerInterceptor)
  public async getALTUserProgramEligibility(
    @Req() request: Request,
    @Query("programId") programId: string,
    @Query("subject") subject: string,
    @Query("userId") userId?: string
  ) {
    return this.altUserEligibilityService.checkEligibilityforProgram(
      request,
      programId,
      subject,
      userId
    );
  }
}
