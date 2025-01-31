import {
  ApiTags,
  ApiBody,
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
  Param,
  UseInterceptors,
  ClassSerializerInterceptor,
  SerializeOptions,
  Req,
  CacheInterceptor,
  Request,
} from "@nestjs/common";

import { GroupMembershipDto, GroupMembershipDtoById } from "./dto/groupMembership.dto";
import { GroupMembershipSearchDto } from "./dto/groupMembership-search.dto";
import { GroupMembershipService } from "src/adapters/hasura/groupMembership.adapter";
import { SentryInterceptor } from "src/common/sentry.interceptor";

@UseInterceptors(SentryInterceptor)
@ApiTags("Group Membership")
@Controller("groupmembership")
export class GroupMembershipController {
  constructor(private service: GroupMembershipService) {}

  @Get("/:id")
  @UseInterceptors(ClassSerializerInterceptor, CacheInterceptor)
  @ApiBasicAuth("access-token")
  @ApiCreatedResponse({ description: "Group Membership detail" })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @SerializeOptions({
    strategy: "excludeAll",
  })
  public async getGroupMembership(
    @Param("id") groupMembershipId: string,
    @Req() request: Request
  ) {
    return this.service.getGroupMembership(groupMembershipId, request);
  }

  @Post()
  @ApiBasicAuth("access-token")
  @ApiCreatedResponse({
    description: "Group Membership has been created successfully.",
  })
  @ApiBody({ type: GroupMembershipDto })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @UseInterceptors(ClassSerializerInterceptor)
  public async createGroupMembership(
    @Req() request: Request,
    @Body() groupMembershipDto: GroupMembershipDto
  ) {
    return this.service.createGroupMembership(request, groupMembershipDto);
  }

  @Post("/byid")
  @ApiBasicAuth("access-token")
  @ApiCreatedResponse({
    description: "Group Membership has been created successfully.",
  })
  @ApiBody({ type: GroupMembershipDtoById })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @UseInterceptors(ClassSerializerInterceptor)
  public async createGroupMembershipById(
    @Req() request: Request,
    @Body() groupMembershipDtoById: GroupMembershipDtoById
  ) {
    return this.service.createGroupMembershipById(request, groupMembershipDtoById);
  }

  @Put("/:id")
  @ApiBasicAuth("access-token")
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiBody({ type: GroupMembershipDto })
  @ApiCreatedResponse({
    description: "Group Membership has been updated successfully.",
  })
  @ApiForbiddenResponse({ description: "Forbidden" })
  public async updateGroupMembership(
    @Param("id") groupMembershipId: string,
    @Req() request: Request,
    @Body() groupMembershipDto: GroupMembershipDto
  ) {
    return this.service.updateGroupMembership(
      groupMembershipId,
      request,
      groupMembershipDto
    );
  }

  @Post("/search")
  @ApiBasicAuth("access-token")
  @ApiCreatedResponse({ description: "Group Membership list." })
  @ApiBody({ type: GroupMembershipSearchDto })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({
    strategy: "excludeAll",
  })
  public async searchGroupMembership(
    @Req() request: Request,
    @Body() groupMembershipSearchDto: GroupMembershipSearchDto
  ) {
    return this.service.searchGroupMembership(
      request,
      groupMembershipSearchDto
    );
  }
}
