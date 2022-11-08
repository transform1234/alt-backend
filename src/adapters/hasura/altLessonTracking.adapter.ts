import { Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { SuccessResponse } from "src/success-response"; 
import { ALTLessonTrackingDto } from "src/altLessonTracking/dto/altLessonTracking.dto";
import { UpdateALTLessonTrackingDto } from "src/altLessonTracking/dto/updateAltLessonTracking.dto";
import { ALTLessonTrackingSearch } from "src/altLessonTracking/dto/searchaltLessonTracking.dto";
import {
  ProgramService
} from "./altProgram.adapter";
import { ALTProgramAssociationService } from "../../adapters/hasura/altProgramAssociation.adapter";
import { ErrorResponse } from "src/error-response";
import { TermsProgramtoRulesDto } from "src/altProgramAssociation/dto/altTermsProgramtoRules.dto";

@Injectable()
export class ALTLessonTrackingService {
    axios = require("axios");

    constructor(private httpService: HttpService, private programService: ProgramService, private altProgramAssociationService: ALTProgramAssociationService) {}

    public async mappedResponse(data: any) {
        const altLessonTrackingResponse = data.map((item: any) => {
            
          const altLessonMapping = {
            userId : item?.userId ? `${item.userId}` : "",
            courseId : item?.courseId ? `${item.courseId}` : "",
            lessonId : item?.lessonId ? `${item.lessonId}` : "",
            attempts : item?.attempts ? `${item.attempts}` : 0,
            score : item?.score ? `${item.score}`: 0,
            status : item?.status ? `${item.status}` : 0,
            scoreDetails : item?.scoreDetails ? `${item.scoreDetails}` : ""
          };
        
          return new ALTLessonTrackingDto(altLessonMapping);
      });
        return altLessonTrackingResponse;
    }

    public async getExistingLessonTrackingRecords (userId:string, lessonId:string) {
            
      const altLessonTrackingRecord = {
        query: `query GetLessonTrackingData ($userId:uuid!, $lessonId:String) {
          LessonProgressTracking(where: {userId: {_eq: $userId}, lessonId: {_eq: $lessonId}}) {
            userId
            lessonId
            created_at
            createdBy
            status
            attempts
        } }`,
        variables: {
          userId: userId,
          lessonId : lessonId
        },
      }
      
      const configData = {
        method: "post",
        url: process.env.ALTHASURA,
        headers: {
        "x-hasura-admin-secret": process.env.REGISTRYHASURAADMINSECRET,
        "Content-Type": "application/json",
        },
        data: altLessonTrackingRecord,
      }

      const resLessonTracking = await this.axios(configData);

      return resLessonTracking.data.data.LessonProgressTracking;

    }

    public async getLastLessonTrackingRecord(userId:string, lessonId:string, attemptNumber: number) {
      const altLastLessonTrackingRecord = {
        query: `query GetLastLessonTrackingRecord ($userId:uuid!, $lessonId:String, $attemptNumber: Int) {
          LessonProgressTracking(where: {userId: {_eq: $userId}, lessonId: {_eq: $lessonId}, attempts: {_eq: $attemptNumber}}) {
            created_at
            createdBy
            status
            attempts
        } }`,
        variables: {
          userId: userId,
          lessonId: lessonId,
          attemptNumber: attemptNumber
        },
      }
      
      const configData = {
        method: "post",
        url: process.env.ALTHASURA,
        headers: {
        "x-hasura-admin-secret": process.env.REGISTRYHASURAADMINSECRET,
        "Content-Type": "application/json",
        },
        data: altLastLessonTrackingRecord,
      }

      const resLessonTracking = await this.axios(configData);

      if (resLessonTracking?.data?.errors) {
        throw {
          errorCode: resLessonTracking.data.errors[0].extensions,
          errorMessage: resLessonTracking.data.errors[0].message,
        };
      }
      
      return resLessonTracking.data.data.LessonProgressTracking;

    }

    public async getALTLessonTracking(altLessonId: string , altUserId: string) {
        
        const ALTLessonTrackingData = {
            query: `
            query GetLessonTracking($altUserId: uuid!, $altLessonId: String) {
                LessonProgressTracking(where: {lessonId: {_eq: $altLessonId}, userId: {_eq: $altUserId}}) {
                  courseId
                  userId
                  lessonId
                  attempts
                  status
                  score
                  scoreDetails
                }
              }                 
            `,
            variables: {
                altLessonId : altLessonId,
                altUserId : altUserId
            }
        }

        const configData = {
            method: "post",
            url: process.env.ALTHASURA,
            headers: {
            "x-hasura-admin-secret": process.env.REGISTRYHASURAADMINSECRET,
            "Content-Type": "application/json",
            },
            data: ALTLessonTrackingData,
        }        

        const response = await this.axios(configData);  

        if (response?.data?.errors) {
          return new ErrorResponse({
            errorCode: response.data.errors[0].extensions,
            errorMessage: response.data.errors[0].message,
          });
        }
        
        const result =  response.data.data.LessonProgressTracking;
       
        const data = await this.mappedResponse(result);        

        return new SuccessResponse({
            statusCode: 200,
            message: "Ok.",
            data: data,
        });

    }

    public async checkAndAddALTLessonTracking (request: any, programId: string, subject: string, altLessonTrackingDto: ALTLessonTrackingDto) {

      let errorExRec = "";
      const recordList = await this.getExistingLessonTrackingRecords(altLessonTrackingDto.userId, altLessonTrackingDto.lessonId)
      .catch(function (error) {
        if (error?.response?.data) {
          errorExRec = error.response.data.errorMessage;
        } else {
          errorExRec = error + ", Can't fetch existing records."
        }
      }); 

      if(!recordList) {
        return new ErrorResponse({
          errorMessage: errorExRec
        });
      }
      
      // program is needed to check baseline assessment or course
      let currentProgramDetails: any = {};
      currentProgramDetails = await this.programService.getProgramDetailsById(programId);
      const paramData = new TermsProgramtoRulesDto(currentProgramDetails.data);
   
      let progTermData: any = {};
      progTermData = await this.altProgramAssociationService.getRules(
        {
          programId: programId,
          framework: paramData.framework,
          board: paramData.board,
          medium: paramData.medium,
          grade: paramData.grade,
          subject: subject
      })

      const programRules =  JSON.parse(progTermData.data[0].rules);

      let flag = false;
    
      if(altLessonTrackingDto.userId) {
        for (const course of programRules?.prog) {
          if (course.contentId == altLessonTrackingDto.courseId) {
            flag = true;
            const numberOfRecords = parseInt(recordList.length);
            const allowedAttempts = parseInt(course.allowedAttempts) ;
            if (course.contentType == "assessment" && allowedAttempts === 1) {
              if (numberOfRecords === 0) {
                altLessonTrackingDto.attempts = 1;
                return await this.createALTLessonTracking(request,altLessonTrackingDto);
              } else if (numberOfRecords === 1 && recordList[0].status !== "Completed") {
                  return await this.updateALTLessonTracking(request,altLessonTrackingDto.userId,altLessonTrackingDto.lessonId,altLessonTrackingDto,0);
              } else if (numberOfRecords === 1 && recordList[0].status === "Completed") {
                  return new ErrorResponse({
                  errorMessage: "Record for Baseline Assessment already exists!"
                });
              } else {
                return new ErrorResponse({
                  errorMessage: "Duplicate entry found in DataBase for Baseline Assessment"
                });
              }
            } else if (course.contentType == "course" && allowedAttempts === 0) {
              if (numberOfRecords === 0) {
                altLessonTrackingDto.attempts = 1;
                return await this.createALTLessonTracking(request,altLessonTrackingDto);
              } else if (numberOfRecords >= 1) {
                const lastRecord = await this.getLastLessonTrackingRecord(altLessonTrackingDto.userId, altLessonTrackingDto.lessonId,numberOfRecords).
                catch(function (error) {
                  return new ErrorResponse({
                    errorMessage: error
                  });
                });

                if(!lastRecord[0].status) {
                  return new ErrorResponse({
                    errorMessage: lastRecord
                  });
                }

                if (lastRecord[0]?.status !== "Completed") {
                  return await this.updateALTLessonTracking(request,altLessonTrackingDto.userId,altLessonTrackingDto.lessonId,altLessonTrackingDto,lastRecord[0]?.attempts);
                } else if (lastRecord[0]?.status === "Completed") {
                  altLessonTrackingDto.attempts = numberOfRecords +1;
                  return await this.createALTLessonTracking(request,altLessonTrackingDto);
                } else {
                  return new ErrorResponse({
                    errorMessage: lastRecord
                  });
                }
              }
            }           
          }

        } 
        if(!flag){
          return new ErrorResponse({
            errorMessage: `Course provided does not exist in the current program.`
          });
        }
      }
    }

    public async createALTLessonTracking (request: any, altLessonTrackingDto: ALTLessonTrackingDto) {     

      const altLessonTracking = new ALTLessonTrackingDto(altLessonTrackingDto);
      let newAltLessonTracking = "";
      Object.keys(altLessonTrackingDto).forEach((key) => {
        if ( 
            altLessonTrackingDto[key] && 
            altLessonTrackingDto[key] != "" &&
            Object.keys(altLessonTracking).includes(key)
            ){
              if(key === "status"){
                newAltLessonTracking += `${key}: ${altLessonTrackingDto[key]},`;
              } else {
              newAltLessonTracking += `${key}: ${JSON.stringify(altLessonTrackingDto[key])},`;   
              }
            }
      });

    const altLessonTrackingData = {
        query: `mutation CreateALTLessonTracking {
            insert_LessonProgressTracking_one(object: {${newAltLessonTracking}}) {
                attempts
                status
                userId
                courseId
                lessonId
                lessonProgressId
                score
                scoreDetails                
          }
        }`,
        variables: {},
      }

      const configDataforCreate = {
        method: "post",
        url: process.env.ALTHASURA,
        headers: {
        "x-hasura-admin-secret": process.env.REGISTRYHASURAADMINSECRET,
        "Content-Type": "application/json",
        },
        data: altLessonTrackingData,
      }        

     const response = await this.axios(configDataforCreate);
 
      if (response?.data?.errors) {
        return new ErrorResponse({
          errorCode: response.data.errors[0].extensions,
          errorMessage: response.data.errors[0].message,
        });
      }
  
      const result =  response.data.data.insert_LessonProgressTracking_one;

        return new SuccessResponse({
          statusCode: 200,
          message: "Ok.",
          data: result,
      });

    }

    public async updateALTLessonTracking(request: any,userId: string, lessonId: string, updateAltLessonTrackDto: UpdateALTLessonTrackingDto, lastAttempt: number ) {

      const updateAltLessonTracking = new UpdateALTLessonTrackingDto(updateAltLessonTrackDto);
      let newUpdateAltLessonTracking = "";
      Object.keys(updateAltLessonTrackDto).forEach((key) => {
        if( 
            updateAltLessonTrackDto[key] && 
            updateAltLessonTrackDto[key] != "" &&
            Object.keys(updateAltLessonTracking).includes(key)
            ) {
                if(key === "status"){
                  newUpdateAltLessonTracking += `${key}: ${updateAltLessonTrackDto[key]},`;
                } else {
                  newUpdateAltLessonTracking += `${key}: ${JSON.stringify(updateAltLessonTrackDto[key])}, `;
                }
            }
      });         
  
      let altLessonUpdateTrackingData = {}
        
      if (!lastAttempt) {

        altLessonUpdateTrackingData = {
          query: `mutation updateAltLessonTracking ($userId:uuid!, $lessonId:String) {
              update_LessonProgressTracking(where: {lessonId: {_eq: $lessonId}, userId: {_eq: $userId}}, _set: {${newUpdateAltLessonTracking}}) {
              affected_rows
            }
        }`,
          variables: {
            userId: userId,
            lessonId: lessonId
          },
        }
      } else {
        altLessonUpdateTrackingData = {
          query: `mutation updateAltLessonTracking ($userId:uuid!, $lessonId:String, $lastAttempt:Int) {
              update_LessonProgressTracking(where: {lessonId: {_eq: $lessonId}, userId: {_eq: $userId} ,attempts: {_eq: $lastAttempt}}, _set: {${newUpdateAltLessonTracking}}) {
              affected_rows
            }
        }`,
          variables: {
            userId: userId,
            lessonId: lessonId,
            lastAttempt: lastAttempt
          },
        }
      }


    const configData = {
      method: "post",
      url: process.env.ALTHASURA,
      headers: {
      "x-hasura-admin-secret": process.env.REGISTRYHASURAADMINSECRET,
      "Content-Type": "application/json",
      },
      data: altLessonUpdateTrackingData,
    }        

    const response = await this.axios(configData);

    if (response?.data?.errors) {
        return new ErrorResponse({
          errorCode: response.data.errors[0].extensions,
          errorMessage: response.data.errors[0].message,
        });
    }

    const result =  response.data.data.update_LessonProgressTracking;
    
      return new SuccessResponse({
        statusCode: 200,
        message: "Ok.",
        data: result,
    });
  }

  public async searchALTLessonTracking(request: any, altLessonTrackingSearch: ALTLessonTrackingSearch) {
    var axios = require("axios");

    let query = "";
    Object.keys(altLessonTrackingSearch.filters).forEach((e) => {
      if (altLessonTrackingSearch.filters[e] && altLessonTrackingSearch.filters[e] != "") {
        query += `${e}:{_eq:"${altLessonTrackingSearch.filters[e]}"}`;
      }
    });

    var searchData = {
      query: `query SearchALTSchoolTracking($limit:Int) {
        LessonProgressTracking(limit: $limit, where: {${query}}) {
          userId
          courseId
          status
          attempts
          score
          scoreDetails
        }
    }`,
      variables: {
        limit: altLessonTrackingSearch.limit
      },
    };

    const configData = {
      method: "post",
      url: process.env.ALTHASURA,
      headers: {
      "x-hasura-admin-secret": process.env.REGISTRYHASURAADMINSECRET,
      "Content-Type": "application/json",
      },
      data: searchData,
    }

    const response = await axios(configData); 

    if (response?.data?.errors) {
      return new ErrorResponse({
        errorCode: response.data.errors[0].extensions,
        errorMessage: response.data.errors[0].message,
      });
    }

      let result = response.data.data.LessonProgressTracking;
      const altLessonTrackingList = await this.mappedResponse(result);
      
      return new SuccessResponse({
        statusCode: 200,
        message: "Ok.",
        data: altLessonTrackingList,
      });
  }
  
}
