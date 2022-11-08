import { Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { SuccessResponse } from "src/success-response";
import { ProgramDto } from "src/Program/dto/program.dto";
import { FBMGStoProgramDto } from "src/Program/dto/fbmgstoProgram.dto";
import { IProgramServicelocator } from "../programservicelocator";
import { ErrorResponse } from "src/error-response";

@Injectable()
export class ProgramService implements IProgramServicelocator {
  axios = require("axios");

  constructor(private httpService: HttpService) {}

  public async createProgram(request: any, programdto: ProgramDto) {
    const programSchema = new ProgramDto(programdto);
    let newProgramData = "";
    Object.keys(programdto).forEach((key) => {
      if (
        programdto[key] &&
        programdto[key] != "" &&
        Object.keys(programSchema).includes(key)
      ) {
        newProgramData += `${key}: ${JSON.stringify(programdto[key])}, `;
      }
    });

    const programData = {
      query: `mutation CreateProgram {
              insert_AssessProgram_one(object: {${newProgramData}}) {
                  programId
            }
          }`,
      variables: {},
    };

    const configData = {
      method: "post",
      url: process.env.ALTHASURA,
      headers: {
        "x-hasura-admin-secret": process.env.REGISTRYHASURAADMINSECRET,
        "Content-Type": "application/json",
      },
      data: programData,
    };

    const response = await this.axios(configData);

    const result = response.data.data.insert_AssessProgram_one;

    return new SuccessResponse({
      statusCode: 200,
      message: "Ok.",
      data: result,
    });
  }

  public async getProgramDetailsById(programId: string) {
    const programData = {
      query: `query GetProgramDetailsById ($programId:uuid!) {
              AssessProgram_by_pk(programId:$programId) {
                programName
                startDate
                endDate
                framework
                board
                medium
                grade
                created_at
                updated_at
              }
            }`,
      variables: {
        programId: programId,
      },
    };

    const configData = {
      method: "post",
      url: process.env.ALTHASURA,
      headers: {
        "x-hasura-admin-secret": process.env.REGISTRYHASURAADMINSECRET,
        "Content-Type": "application/json",
      },
      data: programData,
    };

    const response = await this.axios(configData);

    if (response?.data?.errors) {
      return new ErrorResponse({
        errorCode: response.data.errors[0].extensions,
        errorMessage: response.data.errors[0].message,
      });
    }

    const result = await this.mappedResponse([response.data.data.AssessProgram_by_pk]);    

    return new SuccessResponse({
      statusCode: 200,
      message: "Ok.",
      data: result,
    });
  }

  public async mappedResponse(data: any) {  // why??
    const programResponse = data.map((item: any) => {
      const programMapping = {
        programName: item?.programName ? `${item.programName}` : "",
        startDate: item?.startDate ? `${item.startDate}` : "",
        endDate: item?.endDate ? `${item.endDate}` : "",
        framework: item?.framework ? `${item.framework}` : "",
        board: item?.board ? `${item.board}` : "",
        medium: item?.medium ? `${item.medium}` : "",
        grade: item?.grade ? `${item.grade}` : "",
        created_at: item?.created_at ? `${item.created_at}` : "",
        updated_at: item?.updated_at ? `${item.updated_at}` : "",
      };
      return new ProgramDto(programMapping);
    });

    return programResponse;
  }

  public async getCurrentProgramId(
    request: any,
    fbmgstoprogramdto: FBMGStoProgramDto
  ) {
    const programData = {
      query: `query GetCurrentProgramId ($framework:String,$board:String,$medium:String,$grade:String,$currentDate:date){
            AssessProgram(where: 
            {
              framework: {_eq: $framework}
              board: {_eq: $board},
              medium: {_eq: $medium}
              grade: {_eq: $grade},
              endDate: {_gte: $currentDate},
              startDate: {_lte: $currentDate}
            }) 
            {
              programId
            }
          }`,
      variables: {
        framework: fbmgstoprogramdto.framework,
        board: fbmgstoprogramdto.board,
        medium: fbmgstoprogramdto.medium,
        grade: fbmgstoprogramdto.grade,
        currentDate: fbmgstoprogramdto.currentDate,
      },
    };

    const configData = {
      method: "post",
      url: process.env.ALTHASURA,
      headers: {
        "x-hasura-admin-secret": process.env.REGISTRYHASURAADMINSECRET,
        "Content-Type": "application/json",
      },
      data: programData,
    };

    const response = await this.axios(configData);

    if (response?.data?.errors) {
      return new ErrorResponse({
        errorCode: response.data.errors[0].extensions,
        errorMessage: response.data.errors[0].message,
      });
    }

    const result = response.data.data.AssessProgram;

    return new SuccessResponse({
      statusCode: 200,
      message: "Ok.",
      data: result,
    });
  }
}
