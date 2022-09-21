import { Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { SuccessResponse } from "src/success-response";
import { ProgramDto } from "src/selfAssessment/dto/program.dto";
import { FBMGStoProgramDto } from "src/selfAssessment/dto/fbmgstoProgram.dto";
import { ISelfAssessServicelocator } from "../selfAssessmentservicelocator";

@Injectable()
export class SelfAssessmentService {// implements ISelfAssessServicelocator{
    axios = require("axios");

    constructor(private httpService: HttpService){}

    public async createProgram(request: any, programdto: ProgramDto){
  
      //  console.log(programdto);

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

      //  console.log(newProgramData , "newPgdta");

        const programData = {
            query: `mutation CreateProgram ($params:String,$program_name:String){
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

      //  console.log(response.data);
        

        const result =  response.data.data.insert_AssessProgram_one;
    
        return new SuccessResponse({
            statusCode: 200,
            message: "Ok.",
            data: result,
        });
    }

    public async getProgramById(request: any,programId:string){
      // console.log(programId);
      

        const programData = {
            query: `query GetProgramById ($programId:uuid!) {
              AssessProgram_by_pk(programId:$programId) {
                params
                programName
              }
              }`,
          variables: {
            programId: programId
          },
        }

        // console.log(programData);
        

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

        // console.log(response.data);
        // console.log(response.data.errors);

        const result =  [response.data.data.AssessProgram_by_pk];
    
        // console.log(result);

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
          params : item?.params ? `${item.params}`: ""
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
              framework: {_eq: $framework}
              board: {_eq: $board},
              medium: {_eq: $medium}
              grade: {_eq: $grade},
              subject: {_eq: $subject},    
            }) {
              board
              framework
              grade
              medium
              progAssocNo
              programId
              subject
           AssessProgram {
             params
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

      // console.log(response);
      // console.log(response.data.errors);

      const result =  response.data.data.ProgramTermAssoc;
  
      // console.log(typeof result[0]);
      // console.log(result[0].AssessProgram.params);
      
      
      return new SuccessResponse({
          statusCode: 200,
          message: "Ok.",
          data: result//JSON.parse(result[0]),
      });
      
  }
}