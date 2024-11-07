import { HttpException, Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { SuccessResponse } from "src/success-response";
import { ALTSubjectListDto } from "src/altProgramAssociation/dto/altSubjectList.dto";
import { TermsProgramtoRulesDto } from "src/altProgramAssociation/dto/altTermsProgramtoRules.dto";
import { ProgramAssociationDto } from "src/altProgramAssociation/dto/altProgramAssociation.dto";
import { UpdateALTProgramAssociationDto } from "src/altProgramAssociation/dto/updateAltProgramAssociation.dto";
import { ErrorResponse } from "src/error-response";
import { ALTProgramAssociationSearch } from "src/altProgramAssociation/dto/searchAltProgramAssociation.dto";
import jwt_decode from "jwt-decode";

Injectable();
export class ALTProgramAssociationService {
  axios = require("axios");

  public async mappedResponse(data: any) {
    const programResponse = data.map((item: any) => {
      const programMapping = {
        board: item?.board ? `${item.board}` : "",
        medium: item?.medium ? `${item.medium}` : "",
        grade: item?.grade ? `${item.grade}` : "",
        subject: item?.subject ? `${item.subject}` : "",
        rules: item?.rules ? `${item.rules}` : "",
        programId: item?.programId ? `${item.programId}` : "",
        created_at: item?.created_at ? `${item.created_at}` : "",
        updated_at: item?.updated_at ? `${item.updated_at}` : "",
      };
      return new ProgramAssociationDto(programMapping);
    });
    return programResponse;
  }

  public async getSubjectList(
    request: any,
    altSubjectListDto: ALTSubjectListDto
  ) {
    const subjectListData = {
      query: `query GetSubjectList ($board:String,$medium:String,$grade:String,$programId:uuid!){
                ProgramTermAssoc(where: 
                {
                    board: {_eq: $board},
                    medium: {_eq: $medium}
                    grade: {_eq: $grade},
                    programId: {_eq: $programId},    
                }) 
                { 
                  subject
                  rules
                  created_at
                  updated_at
                 }
            }`,
      variables: {
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
        "Authorization": request.headers.authorization,
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

  public async getRules(
    request: any,
    altTermsProgramDto: TermsProgramtoRulesDto
  ) {
    const TermsProgramtoRulesData = {
      query: `query GetRules ($board:String,$medium:String,$grade:String,$subject:String,$programId:uuid!){
                ProgramTermAssoc(where: 
                {
                    board: {_eq: $board},
                    medium: {_eq: $medium}
                    grade: {_eq: $grade},
                    subject: {_eq: $subject}
                    programId: {_eq: $programId},    
                }) 
                { rules }
            }`,
      variables: {
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
        "Authorization": request.headers.authorization,
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

  public async createProgramAssociation(
    request: any,
    programAssociationDto: ProgramAssociationDto
  ) {
    const programSchema = new ProgramAssociationDto(programAssociationDto);

    let newProgramAssociationData = "";
    Object.keys(programAssociationDto).forEach((key) => {
      if (
        programAssociationDto[key] &&
        programAssociationDto[key] != "" &&
        Object.keys(programSchema).includes(key)
      ) {
        newProgramAssociationData += `${key}: ${JSON.stringify(
          programAssociationDto[key]
        )}, `;
      }
    });

    const programData = {
      query: `mutation CreateProgram {
                insert_ProgramTermAssoc_one(object: {${newProgramAssociationData}}) {
                  progAssocNo
            }
          }`,
      variables: {},
    };

    const configData = {
      method: "post",
      url: process.env.ALTHASURA,
      headers: {
        "Authorization": request.headers.authorization,
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

    const result = response.data.data.insert_ProgramTermAssoc_one;

    return new SuccessResponse({
      statusCode: 200,
      message: "Ok.",
      data: result,
    });
  }

  // public async updateProgramAssociation(
  //   request: any,
  //   programAssocNo: string,
  //   updateProgramAssociationDto: UpdateALTProgramAssociationDto
  // ) {
  //   const updateAltProgramAssoc = new UpdateALTProgramAssociationDto(
  //     updateProgramAssociationDto
  //   );

  //   console.log(updateAltProgramAssoc,"update 1");
  //   console.log(updateProgramAssociationDto, "update2");

  //   let newUpdateAltProgram = "";
  //   Object.keys(updateProgramAssociationDto).forEach((key) => {
  //     if (
  //       updateProgramAssociationDto[key] &&
  //       updateProgramAssociationDto[key] != "" &&
  //       Object.keys(updateAltProgramAssoc).includes(key)
  //     ) {
  //       console.log(key);

  //       newUpdateAltProgram += `${key}: ${JSON.stringify(
  //         updateProgramAssociationDto[key]
  //       )}, `;
  //     }

  //   });

  //   console.log(newUpdateAltProgram,"newUpdateAltProgram");

  //   const altProgramUpdateData = {
  //     query: `mutation UpdateProgram($programAssocNo:uuid!) {
  //       update_AssessProgram_by_pk(pk_columns: {programAssocNo: $programAssocNo}, _set: {${newUpdateAltProgram}}) {
  //         updated_at
  //       }
  //     }`,
  //     variables: {
  //       programAssocNo: programAssocNo,
  //     },
  //   };

  //   const configData = {
  //     method: "post",
  //     url: process.env.ALTHASURA,
  //     headers: {
  //       "Authorization": request.headers.authorization,
  //       "Content-Type": "application/json",
  //     },
  //     altProgramUpdateData,
  //   };

  //   const response = await this.axios(configData);

  //   if (response?.data?.errors) {
  //     console.log(response?.data?.errors);
  //     return new ErrorResponse({
  //       errorCode: response.data.errors[0].extensions,
  //       errorMessage: response.data.errors[0].message,
  //     });
  //   }

  //   const result = response.data.data.AssessProgram_by_pk;

  //   return new SuccessResponse({
  //     statusCode: 200,
  //     message: "Ok.",
  //     data: result,
  //   });
  // }

  public async searchALTProgramAssociation(
    request: any,
    altProgramAssociationSearch: ALTProgramAssociationSearch
  ) {
    var axios = require("axios");

    let query = "";
    Object.keys(altProgramAssociationSearch.filters).forEach((e) => {
      if (
        altProgramAssociationSearch.filters[e] &&
        altProgramAssociationSearch.filters[e] != ""
      ) {
        query += `${e}:{_eq:"${altProgramAssociationSearch.filters[e]}"}`;
      }
    });
    var searchData = {
      query: `query SearchALTProgramAssociation($limit:Int) {
        ProgramTermAssoc(limit: $limit, where: {${query}}) {
          board
          grade
          medium
          subject
          programId
          rules
          created_at
          updated_at
        }
    }`,
      variables: {
        limit: altProgramAssociationSearch.limit,
      },
    };

    const configData = {
      method: "post",
      url: process.env.ALTHASURA,
      headers: {
        "Authorization": request.headers.authorization,
        "Content-Type": "application/json",
      },
      data: searchData,
    };

    const response = await axios(configData);

    if (response?.data?.errors) {
      return new ErrorResponse({
        errorCode: response.data.errors[0].extensions,
        errorMessage: response.data.errors[0].message,
      });
    }

    let result = response.data.data.ProgramTermAssoc;
    const altProgramList = await this.mappedResponse(result);

    return new SuccessResponse({
      statusCode: 200,
      message: "Ok.",
      data: altProgramList,
    });
  }


  public async getGlaUserContent(
    request: any,
    altTermsProgramDto: TermsProgramtoRulesDto,
    page: any,
    limit: any
  ) {

    const decoded: any = jwt_decode(request.headers.authorization);
    const altUserId = decoded["https://hasura.io/jwt/claims"]["x-hasura-user-id"];

    console.log("altUserId", altUserId)
    console.log("altTermsProgramDto", altTermsProgramDto)

    // get programtoRulesData

    const programtoRulesData  = await this.termsProgramtoRulesData(altTermsProgramDto, request)

    // get altcoursetrackingdetails
    const promises = programtoRulesData.map((item) =>
      this.altCourseTrackingDetails(item.courseId, altUserId, request)
    );

    const results = await Promise.allSettled(promises);
    console.log("results", results)


    function isFulfilled<T>(result: PromiseSettledResult<T>): result is PromiseFulfilledResult<T> {
      return result.status === 'fulfilled';
    }

    // Filter for fulfilled results, then map to access the data
    const trackingDetails = results
      .filter(isFulfilled) // Use the type guard to filter only fulfilled results
      .map(result => result.value.data.ContentBrowseTracking) // Now TypeScript knows `value` exists
      .flat();

    console.log("programtoRulesData", programtoRulesData)
    console.log("trackingDetails", trackingDetails)

    const seenCourseIds = new Set(trackingDetails.map(item => item.courseId));

    // Filter out seen courses from programtoRulesData
    const unseenProgramRules = programtoRulesData.filter(item => !seenCourseIds.has(item.courseId));

    console.log("unseenProgramRules", unseenProgramRules);

    // pagination
    
    let paginatedData = this.paginateData(unseenProgramRules, page, limit);
    console.log(paginatedData);

    if (paginatedData.length < limit) {
      const additionalData = programtoRulesData.filter(
        (item) => !seenCourseIds.has(item.courseId) && !unseenProgramRules.includes(item)
      );
      const additionalPaginatedData = this.paginateData(additionalData, 1, limit - paginatedData.length);
      paginatedData = [...paginatedData, ...additionalPaginatedData];
    }
  
    console.log("paginatedData with fallback", paginatedData);
    


    return new SuccessResponse({
      statusCode: 200,
      message: "Ok.",
      data: paginatedData,
    });
  }

  async termsProgramtoRulesData(altTermsProgramDto, request) {
    const TermsProgramtoRulesData = {
      query: `query GetRules ($subject:String,$programId:uuid!){
                ProgramTermAssoc(where: 
                {
                    subject: {_eq: $subject}
                    programId: {_eq: $programId},    
                }) 
                { rules }
            }`,
      variables: {
        // board: altTermsProgramDto.board,
        // medium: altTermsProgramDto.medium,
        // grade: altTermsProgramDto.grade,
        subject: altTermsProgramDto.subject,
        programId: altTermsProgramDto.programId,
      },
    };

    const configData = {
      method: "post",
      url: process.env.ALTHASURA,
      headers: {
        "Authorization": request.headers.authorization,
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

    console.log("result", JSON.parse(result[0].rules).prog)

    return JSON.parse(result[0].rules).prog
  }

  async altCourseTrackingDetails(courseId, altUserId, request) {

    console.log("courseId", courseId)
    console.log("altUserId", altUserId)


    const ProgressTrackingDetails = {
      query: `query GetProgressDetails($courseId: String, $userId: uuid!) {
              ContentBrowseTracking(where: {
                  courseId: { _eq: $courseId },
                  userId: { _eq: $userId }
                }) {
                  courseId
                  userId
                  status
                  programId
                }
              }`,
      variables: {
        courseId: courseId,
        userId: altUserId,
      },
    };

    const configData = {
      method: "post",
      url: process.env.ALTHASURA,
      headers: {
        "Authorization": request.headers.authorization,
        "Content-Type": "application/json",
      },
      data: ProgressTrackingDetails,
    };

    try {
      const response = await this.axios(configData);
      const altcoursetrackingdetails = response.data
      console.log("altcoursetrackingdetails", altcoursetrackingdetails)
      return altcoursetrackingdetails

    } catch (error) {
      throw new HttpException(
        'data not found',
        error.response?.status || 500,
      );
    }


  }

  paginateData(data, page = 1, limit = 5) {
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    
    return data.slice(startIndex, endIndex);
  }
}
