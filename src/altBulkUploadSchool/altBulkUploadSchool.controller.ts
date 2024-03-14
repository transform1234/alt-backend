import { ValidationPipe, UsePipes, Res, HttpStatus } from "@nestjs/common";
import {
  ApiTags,
  ApiBody,
  ApiForbiddenResponse,
  ApiCreatedResponse,
  ApiBasicAuth,
} from "@nestjs/swagger";
import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  ClassSerializerInterceptor,
  Req,
} from "@nestjs/common";
import { Request, Response } from "express";
import {
  ALTBulkUploadSchoolDto,
  ALTNewGroupsDto,
} from "./dto/alt-bulk-upload-school.dto";
import { ALTBulkUploadSchoolService } from "src/adapters/hasura/altBulkUploadSchool.adapter";
import { ErrorResponse } from "src/error-response";

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
    @Res() response: Response,
    @Body() bulkSchoolDto: ALTBulkUploadSchoolDto
  ) {
    const createNewSchoolResponse =
      await this.altBulkUploadSchoolService.createSchools(
        request,
        bulkSchoolDto
      );
    if (createNewSchoolResponse instanceof ErrorResponse) {
      return response
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send("INTERNAL_SERVER_ERROR " + createNewSchoolResponse.errorMessage);
    } else {
      response.status(HttpStatus.OK).send(createNewSchoolResponse);
    }
  }

  @Post("/newgroup")
  // @UseGuards(AuthGuard('jwt'))
  // @UseInterceptors(ActiveUserInterceptor)
  @UsePipes(ValidationPipe)
  @ApiBasicAuth("access-token")
  @ApiBody({ type: ALTNewGroupsDto })
  public async deactivatePerson(
    @Req() request: Request,
    @Res() response: Response,
    @Body() newGroupseDto: ALTNewGroupsDto
  ) {
    const createNewGroupsResponse =
      await this.altBulkUploadSchoolService.createNewGroups(
        newGroupseDto.schoolUdiseList,
        request
      );
    if (createNewGroupsResponse instanceof ErrorResponse) {
      if (createNewGroupsResponse?.errorCode === "404") {
        return response
          .status(404)
          .send({ error: createNewGroupsResponse.errorMessage });
      } else {
        return response
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .send(
            "INTERNAL_SERVER_ERROR " + createNewGroupsResponse.errorMessage
          );
      }
    } else {
      response.status(HttpStatus.CREATED).send(createNewGroupsResponse);
    }
  }
}
