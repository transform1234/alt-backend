import {
  HttpStatus,
  Request,
  Res,
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
} from "@nestjs/common";
import { Response } from "express";
import { ALTBulkUploadTeacherDto } from "./dto/alt-bulk-upload-teacher.dto";
import { ALTBulkUploadTeacherService } from "src/adapters/hasura/altBulkUploadTeacher.adapter";
import { ErrorResponse } from "src/error-response";

@ApiTags("ALT Bulk Teacher")
@Controller("teacher/bulkupload")
export class ALTBulkUploadTeacherController {
  constructor(
    private altBulkUploadTeacherService: ALTBulkUploadTeacherService
  ) {}

  @Post()
  @ApiBasicAuth("access-token")
  @UsePipes(ValidationPipe)
  @ApiCreatedResponse({ description: "Teacher has been created successfully." })
  @ApiBody({ type: ALTBulkUploadTeacherDto })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @UseInterceptors(ClassSerializerInterceptor)
  public async createTeacher(
    @Req() request: Request,
    @Body() bulkTeacherDto: ALTBulkUploadTeacherDto,
    @Res() response: Response
  ) {
    const teacherImportResponse =
      await this.altBulkUploadTeacherService.createTeachers(
        request,
        bulkTeacherDto
      );

    if (teacherImportResponse instanceof ErrorResponse) {
      console.error(teacherImportResponse);
      response
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send(
          "Something went wrong" +
            "INTERNAL_SERVER_ERROR" +
            teacherImportResponse
        );
    } else {
      response.status(HttpStatus.CREATED).send(teacherImportResponse);
    }
  }
}
