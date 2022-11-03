import { Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { SuccessResponse } from "src/success-response";
import { ALTSubjectListDto } from "src/altProgramAssociation/dto/altSubjectList.dto";
import { TermsProgramtoRulesDto } from "src/altProgramAssociation/dto/altTermsProgramtoRules.dto";
import { ErrorResponse } from "src/error-response";

Injectable();
export class ALTProgramAssociationService {
  axios = require("axios");

  public async getSubjectList(altSubjectListDto: ALTSubjectListDto) {
    const subjectListData = {
      query: `query GetSubjectList ($framework:String,$board:String,$medium:String,$grade:String,$programId:uuid!){
                ProgramTermAssoc(where: 
                {
                    framework: {_eq: $framework}
                    board: {_eq: $board},
                    medium: {_eq: $medium}
                    grade: {_eq: $grade},
                    programId: {_eq: $programId},    
                }) 
                { subject }
            }`,
      variables: {
        framework: altSubjectListDto.framework,
        board: altSubjectListDto.board,
        medium: altSubjectListDto.medium,
        grade: altSubjectListDto.grade,
        programId: altSubjectListDto.programId,
      },
    };

    const configData = {
      method: "post",
      url: process.env.ALTHASURA,
      headers: {
        "x-hasura-admin-secret": process.env.REGISTRYHASURAADMINSECRET,
        "Content-Type": "application/json",
      },
      data: subjectListData,
    };

    const response = await this.axios(configData);

    if (response?.data?.errors) {
      return new ErrorResponse({
        errorCode: response.data.errors[0].extensions,
        errorMessage: response.data.errors[0].message,
      });
    }

    const result = response.data.data.ProgramTermAssoc;

    return new SuccessResponse({
      statusCode: 200,
      message: "Ok.",
      data: result,
    });
  }

  public async getRules(altTermsProgramDto: TermsProgramtoRulesDto) {
    const TermsProgramtoRulesData = {
      query: `query GetRules ($framework:String,$board:String,$medium:String,$grade:String,$subject:String,$programId:uuid!){
                ProgramTermAssoc(where: 
                {
                    framework: {_eq: $framework}
                    board: {_eq: $board},
                    medium: {_eq: $medium}
                    grade: {_eq: $grade},
                    subject: {_eq: $subject}
                    programId: {_eq: $programId},    
                }) 
                { rules }
            }`,
      variables: {
        framework: altTermsProgramDto.framework,
        board: altTermsProgramDto.board,
        medium: altTermsProgramDto.medium,
        grade: altTermsProgramDto.grade,
        subject: altTermsProgramDto.subject,
        programId: altTermsProgramDto.programId,
      },
    };

    const configData = {
      method: "post",
      url: process.env.ALTHASURA,
      headers: {
        "x-hasura-admin-secret": process.env.REGISTRYHASURAADMINSECRET,
        "Content-Type": "application/json",
      },
      data: TermsProgramtoRulesData,
    };

    const response = await this.axios(configData);

    if (response?.data?.errors) {
      return new ErrorResponse({
        errorCode: response.data.errors[0].extensions,
        errorMessage: response.data.errors[0].message,
      });
    }

    const result = response.data.data.ProgramTermAssoc;

    return new SuccessResponse({
      statusCode: 200,
      message: "Ok.",
      data: result,
    });
  }
}
