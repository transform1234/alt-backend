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
import { ALTBulkUploadSchoolDto } from "./dto/alt-bulk-upload-school.dto";
import { ALTBulkUploadSchoolService } from "src/adapters/hasura/altBulkUploadSchool.adapter";
import { SchoolDto } from "src/school/dto/school.dto";

@ApiTags("ALT Bulk School")
@Controller("school/bulkupload")
export class ALTBulkUploadSchoolController {
  constructor(private altBulkUploadSchoolService: ALTBulkUploadSchoolService) {}

  @Post()
  @ApiBasicAuth("access-token")
  @ApiCreatedResponse({ description: "School has been created successfully." })
  @ApiBody({ type: [SchoolDto] })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @UseInterceptors(ClassSerializerInterceptor)
  public async createSchool(
    @Req() request: Request,
    @Body() bulkSchoolDto: [SchoolDto]
  ) {
    return this.altBulkUploadSchoolService.createSchools(request, bulkSchoolDto);
  }
}
