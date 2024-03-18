import {
  CacheInterceptor,
  CACHE_MANAGER,
  Inject,
  Request,
  UsePipes,
  ValidationPipe,
  HttpStatus,
  Res,
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
import { ALTBulkUploadStudentService } from "src/adapters/hasura/altBulkUploadStudent.adapter";
// import { StudentDto } from "src/altStudent/dto/alt-student.dto";
import { ALTBulkUploadStudentDto } from "./dto/alt-bulk-upload-student.dto";
import { ErrorResponse } from "src/error-response";
import { Response } from "express";

@ApiTags("ALT Bulk Student")
@Controller("student/bulkupload")
export class ALTBulkUploadStudentController {
  constructor(
    private altBulkUploadStudentService: ALTBulkUploadStudentService
  ) {}

  @Post()
  @ApiBasicAuth("access-token")
  @UsePipes(ValidationPipe)
  @ApiCreatedResponse({ description: "Student has been created successfully." })
  @ApiBody({ type: ALTBulkUploadStudentDto })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @UseInterceptors(ClassSerializerInterceptor)
  public async createStudent(
    @Req() request: Request,
    @Body() bulkStudentDto: ALTBulkUploadStudentDto,
    @Res() response: Response
  ) {
    const studentImportResponse =
      await this.altBulkUploadStudentService.createStudents(
        request,
        bulkStudentDto
      );

    if (studentImportResponse instanceof ErrorResponse) {
      console.error(studentImportResponse);
      response
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send(
          "Something went wrong" +
            "INTERNAL_SERVER_ERROR" +
            JSON.stringify(studentImportResponse)
        );
    } else {
      response.status(HttpStatus.CREATED).send(studentImportResponse);
    }
  }
}
