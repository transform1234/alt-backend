import { Request } from "@nestjs/common";
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
import { ALTBulkUploadTeacherDto } from "./dto/alt-bulk-upload-teacher.dto";
import { ALTBulkUploadTeacherService } from "src/adapters/hasura/altBulkUploadTeacher.adapter";
import { TeacherDto } from "src/altTeacher/dto/alt-teacher.dto";

@ApiTags("ALT Bulk Teacher")
@Controller("teacher/bulkupload")
export class ALTBulkUploadTeacherController {
  constructor(
    private altBulkUploadTeacherService: ALTBulkUploadTeacherService
  ) {}

  @Post()
  @ApiBasicAuth("access-token")
  @ApiCreatedResponse({ description: "Teacher has been created successfully." })
  @ApiBody({ type: [TeacherDto] })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @UseInterceptors(ClassSerializerInterceptor)
  public async createTeacher(
    @Req() request: Request,
    @Body() bulkTeacherDto: [TeacherDto]
  ) {
    return this.altBulkUploadTeacherService.createTeachers(
      request,
      bulkTeacherDto
    );
  }
}
