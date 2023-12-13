import {
  ApiBasicAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
} from "@nestjs/swagger";
import {
  CacheInterceptor,
  ClassSerializerInterceptor,
  Controller,
  Get,
  UseInterceptors,
  Query,
  Param,
  Req,
  Request,
  Inject,
  Body,
  Post,
  SerializeOptions,
} from "@nestjs/common";

import { DikshaCourseToken } from "src/adapters/diksha/dikshaCourse.adapter";
import { IServicelocator } from "src/adapters/courseservicelocator";
import { KhanAcademyCourseToken } from "src/adapters/khanAcademy/khanAcademyCourse.adapter";
import { GroupSearchDto } from "src/group/dto/group-search.dto";
import { CourseSearchDto } from "./dto/course.search.dto";

@ApiTags("Course")
@Controller("course")
export class CourseController {
  constructor(
    @Inject(DikshaCourseToken) private dikshaProvider: IServicelocator,
    @Inject(KhanAcademyCourseToken)
    private khanAcademyProvider: IServicelocator
  ) {}

  @Get(":adapter/search")
  @UseInterceptors(ClassSerializerInterceptor, CacheInterceptor)
  @ApiOkResponse({ description: "Get all Course detail." })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @ApiQuery({ name: "subject", required: false })
  @ApiQuery({ name: "audience", required: false })
  @ApiQuery({ name: "className", required: false })
  @ApiQuery({ name: "medium", required: false })
  @ApiQuery({ name: "limit", required: false })
  public async getAllCourse(
    @Param("adapter") adapter: string,
    @Query("channel") channel: [string],
    @Query("subject") subject: [string],
    @Query("audience") audience: [string],
    @Query("className") className: [string],
    @Query("medium") medium: [string],
    @Query("limit") limit: string,
    @Req() request: Request
  ) {
    if (adapter === "diksha") {
      return this.dikshaProvider.getAllCourse(
        channel,
        subject,
        audience,
        className,
        medium,
        limit,
        request
      );
    } else if (adapter === "khanacademy") {
      return this.khanAcademyProvider.getAllCourse(
        channel,
        subject,
        audience,
        className,
        medium,
        limit,
        request
      );
    }
  }

  @Get(":adapter/courseIds")
  @UseInterceptors(ClassSerializerInterceptor, CacheInterceptor)
  @ApiOkResponse({ description: "Get all Course detail." })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @ApiQuery({ name: "courseIds", required: false })
  public async getCoursesByIds(
    @Param("adapter") adapter: string,
    @Query("courseIds") courseIds: [string],
    @Req() request: Request
  ) {
    if (adapter === "diksha") {
      return this.dikshaProvider.getCoursesByIds(courseIds, request);
    } else if (adapter === "khanacademy") {
      return this.khanAcademyProvider.getCoursesByIds(courseIds, request);
    }
  }

  @Get(":adapter/hierarchy/contentid")
  @UseInterceptors(ClassSerializerInterceptor, CacheInterceptor)
  @ApiOkResponse({ description: "Get content hierarchy detail." })
  // @ApiForbiddenResponse({ description: "Forbidden" })
  //  @ApiQuery({ name: "contentid", required: false })
  public async getCourseHierarchy(
    @Param("adapter") adapter: string,
    @Query("courseId") courseId: string,
    @Query("type") type: string,
    @Req() request: Request
  ) {
    if (adapter === "diksha") {
      return this.dikshaProvider.getCourseHierarchy(courseId, type, request);
    } else if (adapter === "khanacademy") {
      return this.khanAcademyProvider.getCourseHierarchy(
        courseId,
        type,
        request
      );
    }
  }

  @Get(":adapter/content/courseid")
  @UseInterceptors(ClassSerializerInterceptor, CacheInterceptor)
  @ApiOkResponse({ description: "Get Course detail." })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @ApiQuery({ name: "courseId", required: false })
  public async getCourseDetail(
    @Param("adapter") adapter: string,
    @Query("courseId") courseId: string,
    @Req() request: Request
  ) {
    if (adapter === "diksha") {
      return this.dikshaProvider.getCourseDetail(courseId, request);
    } else if (adapter === "khanacademy") {
      return this.khanAcademyProvider.getCourseDetail(courseId, request);
    }
  }

  @Post("/questionset")
  @ApiBody({ type: CourseSearchDto })
  @ApiCreatedResponse({ description: "Get all Course detail." })
  public async getQuestionset(@Body() courseSearchDto: CourseSearchDto) {
    return this.dikshaProvider.getQuestionset(courseSearchDto);
  }

  @Get(":questionset/questionsetid")
  @UseInterceptors(ClassSerializerInterceptor, CacheInterceptor)
  @ApiOkResponse({ description: "Get Questionset detail." })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @ApiQuery({ name: "questionsetId", required: false })
  public async getQuestionsetContent(
    @Query("questionsetId") courseId: string,
    @Req() request: Request
  ) {
    return this.dikshaProvider.getQuestionsetContent(courseId, request);
  }
}
