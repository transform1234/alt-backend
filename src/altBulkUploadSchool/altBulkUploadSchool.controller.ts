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
import { ALTBulkUploadSchoolDto } from "./dto/alt-bulk-upload-school.dto";
import { ALTBulkUploadSchoolService } from "src/adapters/hasura/altBulkUploadSchool.adapter";

@ApiTags("ALT Bulk School")
@Controller("school/bulkupload")
export class ALTBulkUploadSchoolController {
  constructor(private altBulkUploadSchoolService: ALTBulkUploadSchoolService) {}

  @Post()
  @UsePipes(ValidationPipe)
  @ApiBasicAuth("access-token")
  @ApiCreatedResponse({ description: "School has been created successfully." })
  @ApiBody({ type: ALTBulkUploadSchoolDto })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @UseInterceptors(ClassSerializerInterceptor)
  public async createSchool(
    @Req() request: Request,
    @Body() bulkSchoolDto: ALTBulkUploadSchoolDto
  ) {
    return this.altBulkUploadSchoolService.createSchools(
      request,
      bulkSchoolDto
    );
  }
}
