import {
    Controller,
    Get,
    Post,
    Put,
    Patch,
    Param,
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
} from "@nestjs/swagger";
import { ALTSubjectListDto } from "src/altProgramAssociation/dto/altSubjectList.dto";
import { TermsProgramtoRulesDto } from "src/altProgramAssociation/dto/altTermsProgramtoRules.dto" ;
import { ALTProgramAssociationService } from "src/adapters/hasura/altProgramAssociation.adapter";

@ApiTags("ALT Program Association")
@Controller("altprogramassociation")
export class ALTProgramAssociationController {
    constructor(
        private altProgramAssociationService: ALTProgramAssociationService
    ) {}

    @Post("/altsubjectlist")
    @ApiBasicAuth("access-token")
    @ApiOkResponse({description: "ALT Subject List"})
    @ApiForbiddenResponse({description: "Forbidden"})
    @ApiBody({ type: ALTSubjectListDto })
    public async getSubjectList(
        @Req() request: Request,
        @Body() altSubjectListDto: ALTSubjectListDto
        ){
            return this.altProgramAssociationService.getSubjectList(altSubjectListDto);
        }

    @Post("/altrules")
    @ApiBasicAuth("access-token")
    @ApiOkResponse({description: "ALT Rules"})
    @ApiForbiddenResponse({description: "Forbidden"})
    @ApiBody({ type: TermsProgramtoRulesDto })
    public async getRules(
        @Req() request: Request,
        @Body() altTermstoRulesDto: TermsProgramtoRulesDto
        ){
            return this.altProgramAssociationService.getRules(altTermstoRulesDto);
        }
    
}