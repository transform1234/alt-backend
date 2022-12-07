import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  Body,
  UseInterceptors,
  ClassSerializerInterceptor,
  SerializeOptions,
  Req,
  Request,
  CacheInterceptor,
  Inject,
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
import { ALTCurrentPhaseService } from "src/adapters/hasura/altCurrentPhase.adapter";

@ApiTags("ALT Current Phase")
@Controller("altcurrentphase")
export class ALTCurrentPhaseController {
  constructor(private altCurrentPhaseService: ALTCurrentPhaseService) {}

  @Get("/altgetcurrentphase/:programid")
  @ApiBasicAuth("access-token")
  @ApiOkResponse({ description: "ALT Current Phase" })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @UseInterceptors(ClassSerializerInterceptor)
  public async getCurrentPhase(
    @Req() request: Request,
    @Param("programid") programId: string
  ) {
    return this.altCurrentPhaseService.getCurrentPhase(request,programId);
  }
}
