import {
  CacheInterceptor,
  CACHE_MANAGER,
  Inject,
  Request,
  ValidationPipe,
  UsePipes,
} from "@nestjs/common";
import {
  ApiTags,
  ApiBody,
  ApiOkResponse,
  ApiForbiddenResponse,
  ApiCreatedResponse,
  ApiBasicAuth,
} from "@nestjs/swagger";
import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Patch,
  Param,
  UseInterceptors,
  ClassSerializerInterceptor,
  SerializeOptions,
  Req,
} from "@nestjs/common";
import { ALTTeacherService } from "src/adapters/hasura/altTeacher.adapter";
import { TeacherDto } from "./dto/alt-teacher.dto";
import { ALTTeacherSearchDto } from "./dto/alt-teacher-search.dto";
import { SentryInterceptor } from "src/common/sentry.interceptor";

@UseInterceptors(SentryInterceptor)
@ApiTags("ALT Teacher")
@Controller("teacher")
export class ALTTeacherController {
  constructor(private altTeacherService: ALTTeacherService) { }

  @Get("/:id")
  @UsePipes(ValidationPipe)
  @UseInterceptors(ClassSerializerInterceptor, CacheInterceptor)
  @ApiBasicAuth("access-token")
  @ApiOkResponse({ description: "Teacher detail." })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @SerializeOptions({
    strategy: "excludeAll",
  })
  getTeacher(@Param("id") teacherId: string, @Req() request: Request) {
    return this.altTeacherService.getTeacher(teacherId, request);
  }

  @Post()
  @ApiBasicAuth("access-token")
  @UsePipes(ValidationPipe)
  @ApiCreatedResponse({ description: "Teacher has been created successfully." })
  @ApiBody({ type: TeacherDto })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @UseInterceptors(ClassSerializerInterceptor)
  public async createTeacher(
    @Req() request: Request,
    @Body() teacherDto: TeacherDto
  ) {
    return this.altTeacherService.createAndAddToGroup(
      request,
      teacherDto,
      null
    );
  }

  // @Put("/:id")
  // @ApiBasicAuth("access-token")
  // @ApiCreatedResponse({ description: "Student has been updated successfully." })
  // @ApiForbiddenResponse({ description: "Forbidden" })
  // @UseInterceptors(ClassSerializerInterceptor)
  // public async updateStudent(
  //   @Param("id") id: string,
  //   @Req() request: Request,
  //   @Body() studentDto: StudentDto
  // ) {
  //   return this.altStudentService.updateStudent(id, request, studentDto);
  // }

  @Post("/search")
  @UsePipes(ValidationPipe)
  @ApiBasicAuth("access-token")
  @ApiCreatedResponse({ description: "Student list." })
  @ApiBody({ type: ALTTeacherSearchDto })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({
    strategy: "excludeAll",
  })
  public async searchTeacher(
    @Req() request: Request,
    @Body() teachersearchdto: ALTTeacherSearchDto
  ) {
    return this.altTeacherService.searchTeacher(request, teachersearchdto);
  }

  @Post('subject')
  @UsePipes(ValidationPipe)
  @UseInterceptors(ClassSerializerInterceptor, CacheInterceptor)
  @ApiBasicAuth("access-token")
  @ApiOkResponse({ description: "Teacher detail." })
  @ApiForbiddenResponse({ description: "Forbidden" })
  // @SerializeOptions({
  //   strategy: "excludeAll",
  // })
  getSubject(@Req() request: Request, @Body() body: any) {
    const { groupId, medium, grade, board, schoolUdise } = body
    return this.altTeacherService.getSubject(request, groupId, medium, grade, board, schoolUdise);
  }

  @Post('classProgress')
  @UsePipes(ValidationPipe)
  @UseInterceptors(ClassSerializerInterceptor, CacheInterceptor)
  @ApiBasicAuth("access-token")
  @ApiOkResponse({ description: "Teacher detail." })
  @ApiForbiddenResponse({ description: "Forbidden" })
  // @SerializeOptions({
  //   strategy: "excludeAll",
  // })
  classProgress(@Req() request: Request, @Body() body: any) {
    const { medium, grade, board, schoolUdise, programId } = body
    return this.altTeacherService.classWiseProgressController(request, medium, grade, board, schoolUdise, programId);
  }

  @Post('studentProgress')
  @UsePipes(ValidationPipe)
  @UseInterceptors(ClassSerializerInterceptor, CacheInterceptor)
  @ApiBasicAuth("access-token")
  @ApiOkResponse({ description: "Teacher detail." })
  @ApiForbiddenResponse({ description: "Forbidden" })
  // @SerializeOptions({
  //   strategy: "excludeAll",
  // })
  studentProgress(@Req() request: Request, @Body() body: any) {
    const { medium, grade, board, schoolUdise, programId } = body
    return this.altTeacherService.studentClassWiseProgressController(request, medium, grade, board, schoolUdise, programId);
  }

  @Post('subjectProgress')
  @UsePipes(ValidationPipe)
  @UseInterceptors(ClassSerializerInterceptor, CacheInterceptor)
  @ApiBasicAuth("access-token")
  @ApiOkResponse({ description: "Teacher detail." })
  @ApiForbiddenResponse({ description: "Forbidden" })
  // @SerializeOptions({
  //   strategy: "excludeAll",
  // })
  subjectProgress(@Req() request: Request, @Body() body: any) {
    const { subject, medium, grade, board, schoolUdise, programId } = body
    return this.altTeacherService.subjectWiseProgressController(request, subject, medium, grade, board, schoolUdise, programId);
  }

  @Post('progress')
  @UsePipes(ValidationPipe)
  @UseInterceptors(ClassSerializerInterceptor, CacheInterceptor)
  @ApiBasicAuth("access-token")
  @ApiOkResponse({ description: "Progress details." })
  @ApiForbiddenResponse({ description: "Forbidden" })
  async progress(@Req() request: Request, @Body() body: any) {
    const { subject, studentProgress, medium, grade, board, schoolUdise } = body;

    const currentDate: Date = new Date();
    //return currentDate

    const getCurrentProgramId = await this.altTeacherService.getCurrentProgramId(request, {board, medium, grade, currentDate})

    console.log("getCurrentProgramId", getCurrentProgramId)

    const programId = getCurrentProgramId[0].programId

    //return programId

    if (subject && studentProgress) {
      console.log("subject && studentProgress")
      return this.altTeacherService.studentSubjectWiseProgressController(request, subject, medium, grade, board, schoolUdise, programId);
    }

    if (subject) {
      console.log("subject")
      return this.altTeacherService.subjectWiseProgressController(request, subject, medium, grade, board, schoolUdise, programId);
    }
    if (studentProgress) {
      console.log("studentProgress")
      return this.altTeacherService.studentClassWiseProgressController(request, medium, grade, board, schoolUdise, programId);
    }
    console.log("classProgress")
    return this.altTeacherService.classWiseProgressController(request, medium, grade, board, schoolUdise, programId);
  }

}
