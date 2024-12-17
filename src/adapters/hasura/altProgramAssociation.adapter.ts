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
        Authorization: request.headers.authorization,
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
        Authorization: request.headers.authorization,
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
        Authorization: request.headers.authorization,
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
        Authorization: request.headers.authorization,
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
    const altUserId =
      decoded["https://hasura.io/jwt/claims"]["x-hasura-user-id"];

    console.log("altUserId", altUserId);
    console.log("altTermsProgramDto", altTermsProgramDto);

    // get programtoRulesData

    const programtoRulesData = await this.termsProgramtoRulesData(
      altTermsProgramDto,
      request
    );

    // get altcoursetrackingdetails
    const promises = programtoRulesData.map((item) =>
      this.altCourseTrackingDetails(item.contentId, altUserId, request)
    );

    const results = await Promise.allSettled(promises);
    console.log("results", results);

    function isFulfilled<T>(
      result: PromiseSettledResult<T>
    ): result is PromiseFulfilledResult<T> {
      return result.status === "fulfilled";
    }

    // Filter for fulfilled results, then map to access the data
    const trackingDetails = results
      .filter(isFulfilled) // Use the type guard to filter only fulfilled results
      .map((result) => result.value.data.ContentBrowseTracking) // Now TypeScript knows `value` exists
      .flat();

    console.log("programtoRulesData", programtoRulesData);
    console.log("trackingDetails", trackingDetails);

    const seenContentIds = new Set(
      trackingDetails.map((item) => item.contentId)
    );

    // Filter out seen courses from programtoRulesData
    const unseenProgramRules = programtoRulesData.filter(
      (item) => !seenContentIds.has(item.contentId)
    );

    console.log("unseenProgramRules", unseenProgramRules);

    // pagination

    let paginatedData = this.paginateData(unseenProgramRules, page, limit);
    console.log(paginatedData);

    if (paginatedData.length < limit) {
      const additionalData = programtoRulesData.filter(
        (item) =>
          !seenContentIds.has(item.courseId) &&
          !unseenProgramRules.includes(item)
      );
      const additionalPaginatedData = this.paginateData(
        additionalData,
        1,
        limit - paginatedData.length
      );
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
        Authorization: request.headers.authorization,
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

    console.log("result", JSON.parse(result[0].rules).prog);

    return JSON.parse(result[0].rules).prog;
  }

  async altCourseTrackingDetails(contentId, altUserId, request) {
    console.log("contentId", contentId);
    console.log("altUserId", altUserId);

    const ProgressTrackingDetails = {
      query: `query GetProgressDetails($contentId: String, $userId: uuid!) {
              ContentBrowseTracking(where: {
                contentId: { _eq: $contentId },
                  userId: { _eq: $userId }
                }) {
                  contentId
                  userId
                  status
                  programId
                }
              }`,
      variables: {
        contentId: contentId,
        userId: altUserId,
      },
    };

    const configData = {
      method: "post",
      url: process.env.ALTHASURA,
      headers: {
        Authorization: request.headers.authorization,
        "Content-Type": "application/json",
      },
      data: ProgressTrackingDetails,
    };

    try {
      const response = await this.axios(configData);
      const altcoursetrackingdetails = response.data;
      console.log("altcoursetrackingdetails", altcoursetrackingdetails);
      return altcoursetrackingdetails;
    } catch (error) {
      throw new HttpException("data not found", error.response?.status || 500);
    }
  }

  paginateData(data, page = 1, limit = 5) {
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    return data.slice(startIndex, endIndex);
  }
  public async contentSearch(request, body) {
    const programId = body.programId;
    const subjectCondition = body.subject
      ? `subject: {_eq: "${body.subject}"}, `
      : "";
    console.log(programId);

    //get the programData from programTermAssoc
    const data = {
      query: `query MyQuery{
                ProgramTermAssoc(where: {programId: {_eq: "${programId}"}, ${subjectCondition}}) {
                  programId
                  rules
                  subject
                  medium
                  grade
                  board
                }
              }
            `,
    };
    console.log(data.query);

    const config_data = {
      method: "post",
      url: process.env.ALTHASURA,
      headers: {
        Authorization: request.headers.authorization,
        "Content-Type": "application/json",
      },
      data: data,
    };
    const response = await this.axios(config_data);

    if (response?.data?.errors) {
      return new ErrorResponse({
        errorCode: response.data.errors[0].extensions,
        errorMessage: response.data.errors[0].message,
      });
    }
    const rulesData = response.data.data.ProgramTermAssoc;
    // Validate rulesData and log errors for missing or malformed data
    if (!rulesData || rulesData.length === 0) {
      return new ErrorResponse({
        errorCode: "404",
        errorMessage: "No data found.",
      });
    }

    //  Process each rule and match contentId
    const responseData = [];

    rulesData.forEach((rule) => {
      if (rule.rules) {
        try {
          rule.rules = JSON.parse(rule.rules); // Parse the rules
        } catch (error) {
          return new ErrorResponse({
            errorCode: "500",
            errorMessage: `Failed to parse rules for programId: ${rule.programId}`,
          });
        }

        // Ensure `prog` exists and is an array
        if (Array.isArray(rule.rules.prog)) {
          const filteredProg = rule.rules.prog.filter((item) =>
            item.name?.toLowerCase().includes(body.searchQuery.toLowerCase())
          );

          filteredProg.forEach((item) => {
            responseData.push({
              contentId: item.contentId,
              name: item.name,
              subject: rule.subject ,
              courseId: item.courseId ,
              contentType: item.contentType,
              order: item.order,
              allowedAttempts: item.allowedAttempts,
              criteria: item.criteria,
              contentSource: item.contentSource,
            });
          });
        } else {
          return new ErrorResponse({
            errorCode: "500",
            errorMessage: `Invalid 'prog' format for programId: ${rule.programId}`,
          })
        }
      } else {
        return new ErrorResponse({
          errorCode: "500",
          errorMessage: `Missing 'rules' for programId: ${rule.programId}`,
        })
      }
    });
    const pageNumber = parseInt(body.pageNumber, 10) || 1;
    const limit = parseInt(body.limit, 10) || 10;
    const offset = (pageNumber - 1) * limit;

    // Paginate the responseData
    const paginatedData = responseData.slice(offset, offset + limit);

    // Add metadata for pagination
    const meta = {
      total: responseData.length,
      limit,
      offset,
      currentPage: pageNumber,
      totalPages: Math.ceil(responseData.length / limit),
    };

    // Create the final response
    return new SuccessResponse({
      statusCode: 200,
      message: "Ok.",
      data: { paginatedData, meta },
    });
  }
}
