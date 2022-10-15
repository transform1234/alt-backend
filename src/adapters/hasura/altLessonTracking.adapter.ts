import { Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { SuccessResponse } from "src/success-response"; 
import { ALTLessonTrackingDto } from "src/altLessonTracking/dto/altLessonTracking.dto";
import { UpdateALTLessonTrackingDto } from "src/altLessonTracking/dto/updateAltLessonTracking.dto";
import { ALTLessonTrackingSearch } from "src/altLessonTracking/dto/searchaltLessonTracking.dto";

@Injectable()
export class ALTLessonTrackingService {
    axios = require("axios");

    constructor(private httpService: HttpService) {}

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

    public async getALTLessonTracking(altLessonId: string , altUserId: string) {
        
        const ALTLessonTrackingData = {
            query: `
            query GetLessonTracking($altUserId: String, $altLessonId: String) {
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

        if (response.data.errors) {

            return new SuccessResponse({
              statusCode: 422,
              message: "Error",
              data: { "msg" : "Unprocessable Entity" }
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

    public async createALTLessonTracking(request: any, altLessonTrackingDto: ALTLessonTrackingDto) {

      const altLessonTracking = new ALTLessonTrackingDto(altLessonTrackingDto);
      let newAltLessonTracking = "";
      Object.keys(altLessonTrackingDto).forEach((key) => {
        if ( 
            altLessonTrackingDto[key] && 
            altLessonTrackingDto[key] != "" &&
            Object.keys(altLessonTracking).includes(key)
            ){
                    newAltLessonTracking += `${key}: ${JSON.stringify(altLessonTrackingDto[key])},`;
                
            }
    });      

    const altLessonTrackingData = {
        query: `mutation CreateALTLessonTracking ($rules:String,$program_name:String) {
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

      const configData = {
        method: "post",
        url: process.env.ALTHASURA,
        headers: {
        "x-hasura-admin-secret": process.env.REGISTRYHASURAADMINSECRET,
        "Content-Type": "application/json",
        },
        data: altLessonTrackingData,
      }        

      const response = await this.axios(configData);
 
      if (response.data.errors) {

        return new SuccessResponse({
          statusCode: 422,
          message: "Error",
          data: { "msg" : "Unprocessable Entity" }
        });

      }
  
      const result =  response.data.data.insert_LessonProgressTracking_one;

        return new SuccessResponse({
          statusCode: 200,
          message: "Ok.",
          data: result,
      });

    }

    public async updateALTCourseTracking(request: any,userId: string, lessonId: string, updateAltLessonTrackDto: UpdateALTLessonTrackingDto ) {

      const updateAltCourseTracking = new UpdateALTLessonTrackingDto(updateAltLessonTrackDto);
      let newUpdateAltCourseTracking = "";
      Object.keys(updateAltLessonTrackDto).forEach((key) => {
        if( 
            updateAltLessonTrackDto[key] && 
            updateAltLessonTrackDto[key] != "" &&
            Object.keys(updateAltCourseTracking).includes(key)
            ) {
                newUpdateAltCourseTracking += `${key}: ${JSON.stringify(updateAltLessonTrackDto[key])}, `;
            }
      });         
  
      const altCourseUpdateTrackingData = { 
        query: `mutation updateAltLessonTracking ($userId:String , $lessonId:String) {
            update_LessonProgressTracking(where: {lessonId: {_eq: $lessonId}, userId: {_eq: $userId}}, _set: {${newUpdateAltCourseTracking}}) {
            affected_rows
          }
      }`,
        variables: {
          userId : userId,
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
      data: altCourseUpdateTrackingData,
    }        

    const response = await this.axios(configData);

    if (response.data.errors) {
        
        return new SuccessResponse({
            statusCode: 422,
            message: "Error",
            data: { "error" : "Unprocessable Entity" }
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

    if (response.data.errors) {

      return new SuccessResponse({
        statusCode: 422,
        message: "Error",
        data: { "error" : "Unprocessable Entity" }
      });

    }  

      let result = response.data.data.LessonProgressTracking;
      const altCourseTrackingList = await this.mappedResponse(result);
      
      return new SuccessResponse({
        statusCode: 200,
        message: "Ok.",
        data: altCourseTrackingList,
      });
  }
  
}
