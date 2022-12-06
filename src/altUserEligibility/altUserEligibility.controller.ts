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
  constructor(
    private altUserEligibilityService: ALTUserEligibilityService
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
    return this.altUserEligibilityService.checkEligibilityforCourse(
      request,
      programId,
      courseId,
      subject
    );
  }

  @Post("/altuserprogrameligibility")
  @ApiBasicAuth("access-token")
  @ApiOkResponse({ description: "ALT User Program Eligibility" })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @UseInterceptors(ClassSerializerInterceptor)
  public async getALTUserProgramEligibility(
    @Req() request: Request,
    @Query("programId") programId: string,
    @Query("subject") subject: string
  ) {
    return this.altUserEligibilityService.checkEligibilityforProgram(
      request,
      programId,
      subject
    );
  }
}
