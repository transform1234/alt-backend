import { Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { SuccessResponse } from "src/success-response";
import { ProgramDto } from "src/selfAssessment/dto/program.dto";
import { FBMGStoProgramDto } from "src/selfAssessment/dto/fbmgstoProgram.dto";
import { ISelfAssessServicelocator } from "../selfAssessmentservicelocator";

@Injectable()
export class SelfAssessmentService implements ISelfAssessServicelocator{
    axios = require("axios");

    constructor(private httpService: HttpService){}

    public async createProgram(request: any, programdto: ProgramDto){
  
        const programSchema = new ProgramDto(programdto);
        let newProgramData = "";
        Object.keys(programdto).forEach((key) => {
            if( 
                programdto[key] && 
                programdto[key] != "" &&
                Object.keys(programSchema).includes(key)
                ){
                    newProgramData += `${key}: "${programdto[key]}" ,`;
                }
        });

        const programData = {
            query: `mutation CreateProgram ($rules:String,$program_name:String){
              insert_AssessProgram_one(object: {${newProgramData}}) {
                  programId
            }
          }`,
          variables: {},  
        }

        const configData = {
            method: "post",
            url:  process.env.ALTHASURA,
            headers: {
              "x-hasura-admin-secret": process.env.REGISTRYHASURAADMINSECRET,
              "Content-Type": "application/json",
            },
            data: programData,
        }
        
        const response = await this.axios(configData);

        const result =  response.data.data.insert_AssessProgram_one;
    
        return new SuccessResponse({
            statusCode: 200,
            message: "Ok.",
            data: result,
        });
    }

    public async getProgramById(request: any,programId:string){

        const programData = {
            query: `query GetProgramById ($programId:uuid!) {
              AssessProgram_by_pk(programId:$programId) {
                rules
                programName
              }
              }`,
          variables: {
            programId: programId
          },
        }        

        const configData = {
            method: "post",
            url: process.env.ALTHASURA,
            headers: {
            "x-hasura-admin-secret": process.env.REGISTRYHASURAADMINSECRET,
            "Content-Type": "application/json",
            },
            data: programData,
        }        

        const response = await this.axios(configData);

        const result =  [response.data.data.AssessProgram_by_pk];
    
        const data = await this.mappedResponse(result);

        return new SuccessResponse({
            statusCode: 200,
            message: "Ok.",
            data: data,
        });
        
    }

    public async mappedResponse(data: any) {
      const programResponse = data.map((item: any) => {
        const programMapping = {

          programId : item?.programId ? `${item.programId}` : "",
          programName : item?.programName ? `${item.programName}` : "",
          rules : item?.rules ? `${item.rules}`: ""
        };
        return new ProgramDto(programMapping);
      });
  
      return programResponse;
    }

    public async getProgramByFBMGS(request: any,fbmgstoprogramdto: FBMGStoProgramDto){

      const programData = {
          query: `query GetProgramData ($framework:String,$board:String,$medium:String,$grade:String,$subject:String){
            ProgramTermAssoc(where: 
            {
              frameworkCode: {_eq: $framework}
              boardCode: {_eq: $board},
              mediumCode: {_eq: $medium}
              gradeCode: {_eq: $grade},
              subjectCode: {_eq: $subject},    
            }) {
              boardCode
              frameworkCode
              gradeCode
              mediumCode
              progAssocNo
              programId
              subjectCode
           AssessProgram {
             rules
             programId
             programName
           }
         }
       }`,
        variables: {
          "framework":fbmgstoprogramdto.framework,
          "board":fbmgstoprogramdto.board,
          "medium": fbmgstoprogramdto.medium,
          "subject": fbmgstoprogramdto.subject,
          "grade": fbmgstoprogramdto.grade 
        },
      }

      const configData = {
          method: "post",
          url: process.env.ALTHASURA,
          headers: {
            "x-hasura-admin-secret": process.env.REGISTRYHASURAADMINSECRET,
            "Content-Type": "application/json",
          },
          data: programData,
      }

      const response = await this.axios(configData);

      const result =  response.data.data.ProgramTermAssoc;
      
      return new SuccessResponse({
          statusCode: 200,
          message: "Ok.",
          data: result,
      });
      
  }
}