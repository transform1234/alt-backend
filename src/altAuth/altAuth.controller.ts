import {
    ApiTags,
    ApiBody,
    ApiForbiddenResponse,
    ApiHeader,
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
    Res,
    Request,
    Response,
    Headers,
    UsePipes,
    ValidationPipe,
  } from "@nestjs/common";
  import { HasuraAuthService } from "src/adapters/hasura/altAuth.adapter";
  import { ALTAuthDto } from "./dto/auth.dto";
  
  @ApiTags("Auth")
  @Controller("auth")
  export class AuthController {
    constructor(
      private authService: HasuraAuthService
    ) {}
  
    @Post("/token")
    @UsePipes(ValidationPipe)
    @ApiBody({ type: ALTAuthDto })
    @ApiForbiddenResponse({ description: "Forbidden" })
    @UseInterceptors(ClassSerializerInterceptor)
    @SerializeOptions({
      strategy: "excludeAll",
    })
    public async login(
      @Req() request: Request,
      @Res() response: Response,
      @Body() authDto: ALTAuthDto
    ) {
      return this.authService.login(request, response, authDto);
    }
  }
  