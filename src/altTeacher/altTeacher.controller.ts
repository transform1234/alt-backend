import {
  CacheInterceptor,
  CACHE_MANAGER,
  Inject,
  Request,
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
import { StudentSearchDto } from "src/student/dto/student-search.dto";
// import { StudentSearchDto } from "./dto/student-search.dto";

@ApiTags("ALT Teacher")
@Controller("teacher")
export class ALTTeacherController {
  constructor(private altTeacherService: ALTTeacherService) {}

  @Get("/:id")
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
}
