import {
  CacheInterceptor,
  CACHE_MANAGER,
  Inject,
  Request,
  UsePipes,
  ValidationPipe,
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
  Res
} from "@nestjs/common";
import { StudentDto } from "./dto/alt-student.dto";
// import { StudentSearchDto } from "./dto/student-search.dto";
import { ALTStudentService } from "src/adapters/hasura/altStudent.adapter";
import { StudentSearchDto } from "src/student/dto/student-search.dto";
import { ALTStudentSearchDto } from "./dto/alt-student-search.dto";

@ApiTags("ALT Student")
@Controller("student")
export class ALTStudentController {
  constructor(private altStudentService: ALTStudentService) {}

  @Get("/:id")
  @UsePipes(ValidationPipe)
  @UseInterceptors(ClassSerializerInterceptor, CacheInterceptor)
  @ApiBasicAuth("access-token")
  @ApiOkResponse({ description: "Student detail." })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @SerializeOptions({
    strategy: "excludeAll",
  })
  getStudent(@Param("id") studentId: string, @Req() request: Request) {
    return this.altStudentService.getStudent(studentId, request);
  }

  @Post()
  @UsePipes(ValidationPipe)
  @ApiBasicAuth("access-token")
  @ApiCreatedResponse({ description: "Student has been created successfully." })
  @ApiBody({ type: StudentDto })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @UseInterceptors(ClassSerializerInterceptor)
  public async createStudent(
    @Req() request: Request,
    @Body() studentDto: StudentDto
  ) {
    return this.altStudentService.createAndAddToGroup(
      request,
      studentDto,
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
  @ApiBody({ type: StudentSearchDto })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({
    strategy: "excludeAll",
  })
  public async searchStudent(
    @Req() request: Request,
    @Body() studentSearchDto: ALTStudentSearchDto
  ) {
    return this.altStudentService.searchStudent(request, studentSearchDto);
  }
  @Post("/getStatesList")
  @UsePipes(ValidationPipe)
  @UseInterceptors(ClassSerializerInterceptor, CacheInterceptor)
  @ApiBasicAuth("access-token")
  @ApiOkResponse({ description: "State List." })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @SerializeOptions({
    strategy: "excludeAll",
  })
  public async getStateList(
    @Req() request :Request,
    @Res() response :Response,
    @Body() body?:any ,
  ){
    return this.altStudentService.getStateList(request,body,response);
  }
  @Post("/getDistrictList")
  @UsePipes(ValidationPipe)
  @UseInterceptors(ClassSerializerInterceptor, CacheInterceptor)
  @ApiBasicAuth("access-token")
  @ApiOkResponse({ description: "District List." })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @SerializeOptions({
    strategy: "excludeAll",
  })
  public async getDistrictList(
    @Req() request :Request,
    @Res() response :Response,
    @Body() body :any ,
  ){
    return this.altStudentService.getDistrictList(request,body,response);
  }
  @Post("/getBlockList")
  @UsePipes(ValidationPipe)
  @UseInterceptors(ClassSerializerInterceptor, CacheInterceptor)
  @ApiBasicAuth("access-token")
  @ApiOkResponse({ description: "State List." })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @SerializeOptions({
    strategy: "excludeAll",
  })
  public async getBlockList(
    @Req() request :Request,
    @Res() response :Response,
    @Body() body:any ,
  ){
    return this.altStudentService.getBlockList(request,body,response);
  }
  @Post("/getSchoolList")
  @UsePipes(ValidationPipe)
  @UseInterceptors(ClassSerializerInterceptor, CacheInterceptor)
  @ApiBasicAuth("access-token")
  @ApiOkResponse({ description: "School List." })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @SerializeOptions({
    strategy: "excludeAll",
  })
  public async getSchoolList(
    @Req() request :Request,
    @Res() response :Response,
    @Body() body:any ,
  ){
    return this.altStudentService.getSchoolList(request,body,response);
  }
  @Post("/getClass")
  @UsePipes(ValidationPipe)
  @UseInterceptors(ClassSerializerInterceptor, CacheInterceptor)
  @ApiBasicAuth("access-token")
  @ApiOkResponse({ description: "Class List." })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @SerializeOptions({
    strategy: "excludeAll",
  })
  public async getClass(
    @Req() request :Request,
    @Res() response :Response,
    @Body() body:any ,
  ){
    return this.altStudentService.getClass(request,body,response);
  }
  @Put("/:id")
  @UsePipes(ValidationPipe)
  @ApiBasicAuth("access-token")
  @ApiCreatedResponse({ description: "Student updation." })
  @ApiBody({ type: StudentSearchDto })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @UseInterceptors(ClassSerializerInterceptor)
  public async updateStudent(
    @Param("id") id : string,
    @Req() request : Request,
    @Body() body : any
  ){
    return this.altStudentService.updateStudent(id,request,body);
  }
}
