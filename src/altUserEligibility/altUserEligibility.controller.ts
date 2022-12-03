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
import { ALTUserCourseEligibilityService } from "src/adapters/hasura/altUserEligibility.adapter";

@ApiTags("ALT User Course Eligibility")
@Controller("altusercourseeligibility")
export class ALTUserCourseEligibilityController {
  constructor(
    private altUserCourseEligibilityService: ALTUserCourseEligibilityService
  ) {}

  @Post("/altusercourseeligibility")
  @ApiBasicAuth("access-token")
  @ApiOkResponse({ description: "ALT User Course Eligibility" })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @UseInterceptors(ClassSerializerInterceptor)
  public async getALTUserCourseEligibility(
    @Req() request: Request,
    @Query("programId") programId: string,
    @Query("courseId") courseId: string,
    @Query("subject") subject: string
  ) {
    return this.altUserCourseEligibilityService.checkEligibility(
      request,
      programId,
      courseId,
      subject
    );
  }
}
