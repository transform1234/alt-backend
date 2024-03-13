import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  UseInterceptors,
  ClassSerializerInterceptor,
  SerializeOptions,
  Req,
  CacheInterceptor,
  Inject,
  Query,
  Res,
  Delete,
  HttpStatus,
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
  ApiQuery,
} from "@nestjs/swagger";

import { ALTHasuraUserService } from "src/adapters/hasura/altUser.adapter";
import { UserDto } from "./dto/alt-user.dto";
import { ALTUserUpdateDto } from "./dto/alt-user-update.dto";
import { ALTUserSearchDto } from "./dto/alt-user-search.dto";
import { ALTUserDeactivateDto } from "./dto/alt-user-deactivate.dto";
import { Request, Response } from "express";
import { ErrorResponse } from "src/error-response";
@ApiTags("User")
@Controller("user")
export class ALTUserController {
  constructor(private hasuraUserService: ALTHasuraUserService) {}

  @Get("/:id")
  @UseInterceptors(ClassSerializerInterceptor, CacheInterceptor)
  @ApiBasicAuth("access-token")
  @ApiOkResponse({ description: "User detail." })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @SerializeOptions({
    strategy: "excludeAll",
  })
  public async getUser(@Param("id") id: string, @Req() request: Request) {
    return this.hasuraUserService.getUser(id, request);
  }

  @Get()
  @UseInterceptors(ClassSerializerInterceptor, CacheInterceptor)
  @ApiBasicAuth("access-token")
  @ApiOkResponse({ description: "User detail." })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @SerializeOptions({
    strategy: "excludeAll",
  })
  public async getUserByAuth(@Req() request: Request) {
    return this.hasuraUserService.getUserByAuth(request);
  }

  @Post()
  @ApiBasicAuth("access-token")
  @ApiCreatedResponse({ description: "User has been created successfully." })
  @ApiBody({ type: UserDto })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @UseInterceptors(ClassSerializerInterceptor)
  public async createUser(@Req() request: Request, @Body() userDto: UserDto) {
    return this.hasuraUserService.checkAndAddUser(request, userDto, null);
  }

  @Put("/:id")
  @ApiBasicAuth("access-token")
  @ApiCreatedResponse({ description: "User has been updated successfully." })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @UseInterceptors(ClassSerializerInterceptor)
  public async updateUser(
    @Param("id") id: string,
    @Req() request: Request,
    @Body() userUpdateDto: ALTUserUpdateDto
  ) {
    return await this.hasuraUserService.updateUser(id, request, userUpdateDto);
  }

  @Post("/search")
  @ApiBasicAuth("access-token")
  @ApiCreatedResponse({ description: "User list." })
  @ApiBody({ type: ALTUserSearchDto })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({
    strategy: "excludeAll",
  })
  public async searchUser(
    @Req() request: Request,
    @Body() userSearchDto: ALTUserSearchDto
  ) {
    return await this.hasuraUserService.searchUser(request, userSearchDto);
  }

  @Post("/reset-password")
  @ApiBasicAuth("access-token")
  @ApiOkResponse({ description: "Password reset successfully." })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @ApiBody({ type: Object })
  @UseInterceptors(ClassSerializerInterceptor)
  public async resetUserPassword(
    @Req() request: Request,
    @Body()
    reqBody: {
      username: string;
      newPassword: string;
    }
  ) {
    return this.hasuraUserService.resetUserPassword(
      request,
      reqBody.newPassword,
      reqBody.username
    );
  }

  @Delete("/deactivate")
  // @UseGuards(AuthGuard('jwt'))
  // @UseInterceptors(ActiveUserInterceptor)
  @UsePipes(ValidationPipe)
  @ApiBasicAuth("access-token")
  @ApiBody({ type: ALTUserDeactivateDto })
  public async deactivatePerson(
    @Req() request: Request,
    @Res() response: Response,
    @Body() userDeactivateDto: ALTUserDeactivateDto
  ) {
    const deactivateUserResponse = await this.hasuraUserService.deactivateUser(
      userDeactivateDto.usernames,
      request
    );
    if (deactivateUserResponse instanceof ErrorResponse) {
      if (deactivateUserResponse?.errorCode === "404") {
        return response
          .status(404)
          .send({ error: deactivateUserResponse.errorMessage });
      } else {
        return response
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .send("INTERNAL_SERVER_ERROR " + deactivateUserResponse.errorMessage);
      }
    } else {
      response.status(HttpStatus.CREATED).send(deactivateUserResponse);
    }
  }
}
