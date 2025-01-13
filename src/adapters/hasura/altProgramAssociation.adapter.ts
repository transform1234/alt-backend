import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { SuccessResponse } from "src/success-response";
import { ALTSubjectListDto } from "src/altProgramAssociation/dto/altSubjectList.dto";
import { TermsProgramtoRulesDto } from "src/altProgramAssociation/dto/altTermsProgramtoRules.dto";
import { ProgramAssociationDto } from "src/altProgramAssociation/dto/altProgramAssociation.dto";
import { UpdateALTProgramAssociationDto } from "src/altProgramAssociation/dto/updateAltProgramAssociation.dto";
import { ErrorResponse } from "src/error-response";
import { ALTProgramAssociationSearch } from "src/altProgramAssociation/dto/searchAltProgramAssociation.dto";
import jwt_decode from "jwt-decode";
import { firstValueFrom } from 'rxjs';
import moment from 'moment';
import { lastValueFrom } from 'rxjs';


Injectable();
export class ALTProgramAssociationService {
  axios = require("axios");

  constructor(private readonly httpService: HttpService) { }

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
              subject: rule.subject,
              courseId: item.courseId,
              contentType: item.contentType,
              order: item.order,
              allowedAttempts: item.allowedAttempts,
              criteria: item.criteria,
              contentSource: item.contentSource,
              lesson_questionset: item.lesson_questionset,
              thumbnailUrl: item.thumbnailUrl,
            });
          });
        } else {
          return new ErrorResponse({
            errorCode: "500",
            errorMessage: `Invalid 'prog' format for programId: ${rule.programId}`,
          });
        }
      } else {
        return new ErrorResponse({
          errorCode: "500",
          errorMessage: `Missing 'rules' for programId: ${rule.programId}`,
        });
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

  // async likeContent(request, data: {
  //   programId: string;
  //   subject: string;
  //   userId: string;
  //   contentId: string;
  //   like: boolean;
  // }) {
  //   const graphqlMutation = {
  //     query: `
  //       mutation ($input: GlaLikedContents_insert_input!) {
  //         insert_GlaLikedContents_one(object: $input) {
  //           id
  //         }
  //       }
  //     `,
  //     variables: {
  //       input: data,
  //     },
  //   };

  //   console.log(graphqlMutation.query);

  //   const config_data = {
  //     method: "post",
  //     url: process.env.ALTHASURA,
  //     headers: {
  //       Authorization: request.headers.authorization,
  //       "Content-Type": "application/json",
  //     },
  //     data: graphqlMutation,
  //   };
  //   const response = await this.axios(config_data);

  //   if (response?.data?.errors) {
  //     return new ErrorResponse({
  //       errorCode: response.data.errors[0].extensions,
  //       errorMessage: response.data.errors[0].message,
  //     });
  //   }
  //   return response

  // }

  // async likeContent(request, data: {
  //   programId: string;
  //   subject: string;
  //   contentId: string;
  //   like: boolean;
  // }) {

  //   const decoded: any = jwt_decode(request.headers.authorization);
  //   const altUserId =
  //     decoded["https://hasura.io/jwt/claims"]["x-hasura-user-id"];

  //   console.log("altUserId", altUserId);
  //   //console.log("altTermsProgramDto", altTermsProgramDto);
  //   const graphqlMutation = {
  //     query: `
  //       mutation InsertLike($contentId: String!, $like: Boolean!, $programId: String!, $subject: String!, $userId: String!) {
  //         insert_GlaLikedContents_one(object: {
  //           contentId: $contentId,
  //           like: $like,
  //           programId: $programId,
  //           subject: $subject,
  //           userId: $userId
  //         }) {
  //           id
  //           like
  //           programId
  //           subject
  //           userId
  //           contentId
  //           created_at
  //           updated_at
  //         }
  //       }
  //     `,
  //     variables: {
  //       contentId: data.contentId,
  //       like: data.like,
  //       programId: data.programId,
  //       subject: data.subject,
  //       userId: altUserId,
  //     },
  //   };

  //   console.log('GraphQL Mutation:', graphqlMutation.query);

  //   const config_data = {
  //     method: 'post',
  //     url: process.env.ALTHASURA,
  //     headers: {
  //       Authorization: request.headers.authorization,
  //       'Content-Type': 'application/json',
  //     },
  //     data: graphqlMutation,
  //   };

  //   try {
  //     const response = await this.axios(config_data);

  //     console.log("response", response.data.data)

  //     if (response?.data?.errors) {
  //       console.error('GraphQL Errors:', response.data.errors);
  //       return new ErrorResponse({
  //         errorCode: response.data.errors[0]?.extensions?.code || 'UNKNOWN_ERROR',
  //         errorMessage: response.data.errors[0]?.message || 'An unknown error occurred.',
  //       });
  //     }

  //     return new SuccessResponse({
  //       statusCode: 200,
  //       message: 'Content like status updated successfully.',
  //       data: response.data.data,
  //     });
  //   } catch (error) {
  //     console.error('Axios Error:', error.message);
  //     throw new ErrorResponse({
  //       errorCode: 'AXIOS_ERROR',
  //       errorMessage: 'Failed to execute the GraphQL mutation.',
  //     });
  //   }
  // }

  // Like content
  async likeContent(
    request,
    data: {
      programId: string;
      subject: string;
      contentId: string;
      like: boolean;
    }
  ) {
    const decoded: any = jwt_decode(request.headers.authorization);
    const altUserId =
      decoded["https://hasura.io/jwt/claims"]["x-hasura-user-id"];

    console.log("altUserId", altUserId);

    // First, check if the combination exists
    const checkGraphQLQuery = {
      query: `
        query CheckLikeStatus($contentId: String!, $programId: String!, $subject: String!, $userId: String!) {
          GlaLikedContents(where: {
            contentId: { _eq: $contentId },
            programId: { _eq: $programId },
            subject: { _eq: $subject },
            userId: { _eq: $userId }
          }) {
            id
            like
          }
        }
      `,
      variables: {
        contentId: data.contentId,
        programId: data.programId,
        subject: data.subject,
        userId: altUserId,
      },
    };

    const config_data = {
      method: "post",
      url: process.env.ALTHASURA,
      headers: {
        Authorization: request.headers.authorization,
        "Content-Type": "application/json",
      },
      data: checkGraphQLQuery,
    };

    try {
      // Check if the like entry already exists
      const checkResponse = await this.axios(config_data);
      console.log("checkResponse", checkResponse.data.data);
      const existingLike = checkResponse?.data?.data?.GlaLikedContents[0];
      console.log("existingLike", existingLike);

      if (existingLike) {
        // If entry exists, update the like status
        console.log("entry exists");
        const updateGraphQLQuery = {
          query: `
            mutation UpdateLike($contentId: String!, $like: Boolean!, $programId: String!, $subject: String!, $userId: String!) {
              update_GlaLikedContents(where: {
                contentId: { _eq: $contentId },
                programId: { _eq: $programId },
                subject: { _eq: $subject },
                userId: { _eq: $userId }
              }, _set: { like: $like }) {
                affected_rows
                returning {
                  id
                  like
                  programId
                  subject
                  userId
                  contentId
                  created_at
                  updated_at
                }
              }
            }
          `,
          variables: {
            contentId: data.contentId,
            like: data.like,
            programId: data.programId,
            subject: data.subject,
            userId: altUserId,
          },
        };

        config_data.data = updateGraphQLQuery;

        const updateResponse = await this.axios(config_data);
        console.log("Updated Like:", updateResponse.data.data);

        return new SuccessResponse({
          statusCode: 200,
          message: "Content like status updated successfully.",
          data: updateResponse.data.data,
        });
      } else {
        // If no entry exists, insert a new one
        console.log("no entry exists");
        const insertGraphQLQuery = {
          query: `
            mutation InsertLike($contentId: String!, $like: Boolean!, $programId: String!, $subject: String!, $userId: String!) {
              insert_GlaLikedContents_one(object: {
                contentId: $contentId,
                like: $like,
                programId: $programId,
                subject: $subject,
                userId: $userId
              }) {
                id
                like
                programId
                subject
                userId
                contentId
                created_at
                updated_at
              }
            }
          `,
          variables: {
            contentId: data.contentId,
            like: data.like,
            programId: data.programId,
            subject: data.subject,
            userId: altUserId,
          },
        };

        config_data.data = insertGraphQLQuery;

        const insertResponse = await this.axios(config_data);
        console.log("Inserted Like:", insertResponse.data.data);

        return new SuccessResponse({
          statusCode: 200,
          message: "Content like status inserted successfully.",
          data: insertResponse.data.data,
        });
      }
    } catch (error) {
      console.error("Axios Error:", error.message);
      throw new ErrorResponse({
        errorCode: "AXIOS_ERROR",
        errorMessage: "Failed to execute the GraphQL mutation.",
      });
    }
  }

  async isContentLike(
    request,
    data: {
      programId: string;
      subject: string;
      contentId: string;
    }
  ) {
    const decoded: any = jwt_decode(request.headers.authorization);
    const altUserId =
      decoded["https://hasura.io/jwt/claims"]["x-hasura-user-id"];

    console.log("altUserId", altUserId);

    // First, check if the combination exists
    const checkGraphQLQuery = {
      query: `
        query CheckLikeStatus($contentId: String!, $programId: String!, $subject: String!) {
          GlaLikedContents(where: {
            contentId: { _eq: $contentId },
            programId: { _eq: $programId },
            subject: { _eq: $subject }
          }) {
            id
            userId
            contentId
            programId
            subject
            like
          }
        }
      `,
      variables: {
        contentId: data.contentId,
        programId: data.programId,
        subject: data.subject,
      },
    };

    const config_data = {
      method: "post",
      url: process.env.ALTHASURA,
      headers: {
        Authorization: request.headers.authorization,
        "Content-Type": "application/json",
      },
      data: checkGraphQLQuery,
    };

    try {
      // Check if the like entry already exists
      const checkResponse = await this.axios(config_data);
      console.log("checkResponse", checkResponse.data);
      const existingLike = checkResponse?.data?.data?.GlaLikedContents[0];
      console.log("existingLike", existingLike);

      if (existingLike) {
        // If entry exists, update the like status

        return new SuccessResponse({
          statusCode: 200,
          message: "Content fetched successfully.",
          data: checkResponse?.data?.data?.GlaLikedContents,
        });
      } else {
        // If no entry exists, insert a new one
        console.log("no entry exists");

        return new SuccessResponse({
          statusCode: 200,
          message: "Content not exists.",
          data: [],
        });
      }
    } catch (error) {
      console.error("Axios Error:", error.message);
      throw new ErrorResponse({
        errorCode: "AXIOS_ERROR",
        errorMessage: "Failed to execute the GraphQL mutation.",
      });
    }
  }

  // Rate Quiz
  async rateQuiz(
    request,
    data: {
      programId: string;
      subject: string;
      contentId: string;
      rating: boolean;
    }
  ) {
    const decoded: any = jwt_decode(request.headers.authorization);
    const altUserId =
      decoded["https://hasura.io/jwt/claims"]["x-hasura-user-id"];

    console.log("altUserId", altUserId);

    // First, check if the combination exists
    const checkGraphQLQuery = {
      query: `
        query CheckLikeStatus($contentId: String!, $programId: String!, $subject: String!, $userId: String!) {
          GlaQuizRating(where: {
            contentId: { _eq: $contentId },
            programId: { _eq: $programId },
            subject: { _eq: $subject },
            userId: { _eq: $userId }
          }) {
            id
            rating
          }
        }
      `,
      variables: {
        contentId: data.contentId,
        programId: data.programId,
        subject: data.subject,
        userId: altUserId,
      },
    };

    const config_data = {
      method: "post",
      url: process.env.ALTHASURA,
      headers: {
        Authorization: request.headers.authorization,
        "Content-Type": "application/json",
      },
      data: checkGraphQLQuery,
    };

    try {
      // Check if the like entry already exists
      const checkResponse = await this.axios(config_data);
      console.log("checkResponse", checkResponse.data.data);
      const existingLike = checkResponse?.data?.data?.GlaQuizRating[0];
      console.log("existingLike", existingLike);

      if (existingLike) {
        // If entry exists, update the like status
        console.log("entry exists");
        const updateGraphQLQuery = {
          query: `
            mutation UpdateLike($contentId: String!, $rating: Int!, $programId: String!, $subject: String!, $userId: String!) {
              update_GlaQuizRating(where: {
                contentId: { _eq: $contentId },
                programId: { _eq: $programId },
                subject: { _eq: $subject },
                userId: { _eq: $userId }
              }, _set: { rating: $rating }) {
                affected_rows
                returning {
                  id
                  rating
                  programId
                  subject
                  userId
                  contentId
                  created_at
                  updated_at
                }
              }
            }
          `,
          variables: {
            contentId: data.contentId,
            rating: data.rating,
            programId: data.programId,
            subject: data.subject,
            userId: altUserId,
          },
        };

        config_data.data = updateGraphQLQuery;

        const updateResponse = await this.axios(config_data);
        console.log("Updated Like:", updateResponse.data.data);

        return new SuccessResponse({
          statusCode: 200,
          message: "Content like status updated successfully.",
          data: updateResponse.data.data,
        });
      } else {
        // If no entry exists, insert a new one
        console.log("no entry exists");
        const insertGraphQLQuery = {
          query: `
            mutation InsertLike($contentId: String!, $rating: Int!, $programId: String!, $subject: String!, $userId: String!) {
              insert_GlaQuizRating_one(object: {
                contentId: $contentId,
                rating: $rating,
                programId: $programId,
                subject: $subject,
                userId: $userId
              }) {
                id
                rating
                programId
                subject
                userId
                contentId
                created_at
                updated_at
              }
            }
          `,
          variables: {
            contentId: data.contentId,
            rating: data.rating,
            programId: data.programId,
            subject: data.subject,
            userId: altUserId,
          },
        };

        config_data.data = insertGraphQLQuery;

        const insertResponse = await this.axios(config_data);
        console.log("Inserted Like:", insertResponse.data.data);

        return new SuccessResponse({
          statusCode: 200,
          message: "Content like status inserted successfully.",
          data: insertResponse.data.data,
        });
      }
    } catch (error) {
      console.error("Axios Error:", error.message);
      throw new ErrorResponse({
        errorCode: "AXIOS_ERROR",
        errorMessage: "Failed to execute the GraphQL mutation.",
      });
    }
  }

  async isQuizRated(
    request,
    data: {
      programId: string;
      subject: string;
      contentId: string;
    }
  ) {
    const decoded: any = jwt_decode(request.headers.authorization);
    const altUserId =
      decoded["https://hasura.io/jwt/claims"]["x-hasura-user-id"];

    console.log("altUserId", altUserId);

    // First, check if the combination exists
    const checkGraphQLQuery = {
      query: `
        query CheckLikeStatus($contentId: String!, $programId: String!, $subject: String!) {
          GlaQuizRating(where: {
            contentId: { _eq: $contentId },
            programId: { _eq: $programId },
            subject: { _eq: $subject }
          }) {
            id
            userId
            contentId
            programId
            subject
            rating
          }
        }
      `,
      variables: {
        contentId: data.contentId,
        programId: data.programId,
        subject: data.subject,
      },
    };

    const config_data = {
      method: "post",
      url: process.env.ALTHASURA,
      headers: {
        Authorization: request.headers.authorization,
        "Content-Type": "application/json",
      },
      data: checkGraphQLQuery,
    };

    try {
      // Check if the like entry already exists
      const checkResponse = await this.axios(config_data);
      console.log("checkResponse", checkResponse.data);
      const existingLike = checkResponse?.data?.data?.GlaQuizRating[0];
      console.log("existingLike", existingLike);

      if (existingLike) {
        // If entry exists, update the like status

        return new SuccessResponse({
          statusCode: 200,
          message: "Content fetched successfully.",
          data: checkResponse?.data?.data?.GlaQuizRating,
        });
      } else {
        // If no entry exists, insert a new one
        console.log("no entry exists");

        return new SuccessResponse({
          statusCode: 200,
          message: "Content not exists.",
          data: [],
        });
      }
    } catch (error) {
      console.error("Axios Error:", error.message);
      throw new ErrorResponse({
        errorCode: "AXIOS_ERROR",
        errorMessage: "Failed to execute the GraphQL mutation.",
      });
    }
  }

  async getUserPoints(request) {
    const decoded: any = jwt_decode(request.headers.authorization);
    const altUserId =
      decoded["https://hasura.io/jwt/claims"]["x-hasura-user-id"];

    console.log("altUserId", altUserId);

    const checkGraphQLQuery = {
      query: `
      query MyQuery($userId: uuid!) {
        UserPoints(
          where: { user_id: { _eq: $userId } }
          order_by: { created_at: desc }

        ) {
          id
          identifier
          points
          description
          user_id
          created_at
          updated_at
        }
      }
      `,
      variables: {
        userId: altUserId,
      },
    };

    const config_data = {
      method: "post",
      url: process.env.ALTHASURA,
      headers: {
        Authorization: request.headers.authorization,
        "Content-Type": "application/json",
      },
      data: checkGraphQLQuery,
    };

    try {
      const checkResponse = await this.axios(config_data);
      console.log("checkResponse", checkResponse.data);

      if (checkResponse) {
        return new SuccessResponse({
          statusCode: 200,
          message: "User Points fetched successfully.",
          data: checkResponse?.data?.data,
        });
      } else {
        return new SuccessResponse({
          statusCode: 200,
          message: "User Points not exists.",
          data: [],
        });
      }
    } catch (error) {
      console.error("Axios Error:", error.message);
      throw new ErrorResponse({
        errorCode: "AXIOS_ERROR",
        errorMessage: "Failed to execute the GraphQL mutation.",
      });
    }
  }

  async addUserPoints(request, data) {
    const decoded: any = jwt_decode(request.headers.authorization);
    const altUserId =
      decoded["https://hasura.io/jwt/claims"]["x-hasura-user-id"];

    console.log("altUserId", altUserId);
    console.log("identifier", data.identifier);

    // get the points to be allocated to the user for a given identifier
    const checkGraphQLQuery = {
      query: `
      query MyQuery($identifier: String!) {
        PointsConfig(
          where: { identifier: { _eq: $identifier } }

        ) {
          id
          title
          description
          points
          identifier
          created_at
          updated_at
        }
      }
      `,
      variables: {
        identifier: data.identifier,
      },
    };

    const config_data = {
      method: "post",
      url: process.env.ALTHASURA,
      headers: {
        Authorization: request.headers.authorization,
        "Content-Type": "application/json",
      },
      data: checkGraphQLQuery,
    };

    const checkResponse = await this.axios(config_data);
    console.log("checkResponse", checkResponse.data.data);

    const points = checkResponse.data.data.PointsConfig[0].points || 0;

    // Create description with points value
    const description = `${data.description} ${points} points`;

    const insertGraphQLQuery = {
      query: `
        mutation InsertUserPoints($userId: uuid!, $identifier: String!, $points: Int!, $description: String!, $earning_context: jsonb) {
          insert_UserPoints_one(object: {
            user_id: $userId,
            identifier: $identifier,
            points: $points,
            description: $description,
            earning_context: $earning_context
          }) {
            id
            identifier
            user_id
            points
            description
            created_at
            updated_at
            earning_context
          }
        }
      `,
      variables: {
        userId: altUserId,
        identifier: data.identifier,
        points: points,
        description: description, // Use the new description with points
        earning_context: data.earning_context,
      },
    };
    console.log(insertGraphQLQuery.query, insertGraphQLQuery.variables);
    console.log();

    config_data.data = insertGraphQLQuery;

    const insertResponse = await this.axios(config_data);
    console.log("Inserted Like:", insertResponse.data);

    return new SuccessResponse({
      statusCode: 200,
      message: "User points added successfully.",
      data: insertResponse.data.data,
    });
  }

  // async leaderBoardPoints(request, data) {

  //   console.log("timeframe", data.timeframe)

  //   const { startDate, endDate } = await this.getDateRange(data.timeframe);

  //   console.log("startDate", moment(startDate).format("DD-MM-YYYY"))
  //   console.log("endDate", moment(endDate).format("DD-MM-YYYY"))

  //   console.log("board", data.filters.board)
  //   const board = data.filters.board;

  //   console.log("schoolUdise", data.filters.schoolUdise)
  //   const schoolUdise = data.filters.schoolUdise;

  //   console.log("groupid", data.filters.groupId)
  //   const groupId = data.filters.groupId;

  //   const decoded: any = jwt_decode(request.headers.authorization);
  //   const altUserId = decoded["https://hasura.io/jwt/claims"]["x-hasura-user-id"];

  //   console.log("altUserId", altUserId);

  //    return this.getPointsByBoard(request, board, startDate, endDate)

  //   // return this.getPointsBySchoolId(request, schoolUdise, startDate, endDate)

  //   // return this.getPointsByClassId(request, groupId, startDate, endDate)


  // }




  async leaderBoardPoints(request, data) {
    console.log("timeframe", data.timeframe);

    const { startDate, endDate } = await this.getDateRange(data.timeframe);

    console.log("startDate", moment(startDate).format("DD-MM-YYYY"));
    console.log("endDate", moment(endDate).format("DD-MM-YYYY"));

    const filters = data.filters || {};
    const groupId = filters.groupId;
    const schoolUdise = filters.schoolUdise;
    const board = filters.board;

    const decoded: any = jwt_decode(request.headers.authorization);
    const altUserId = decoded["https://hasura.io/jwt/claims"]["x-hasura-user-id"];
    console.log("altUserId", altUserId);

    if (groupId) {
      console.log("Fetching data by Group ID:", groupId);
      return this.getPointsByClassId(request, groupId, startDate, endDate);
    } else if (schoolUdise) {
      console.log("Fetching data by School UDISE:", schoolUdise);
      return this.getPointsBySchoolId(request, schoolUdise, startDate, endDate);
    } else if (board) {
      console.log("Fetching data by Board:", board);
      return this.getPointsByBoard(request, board, startDate, endDate);
    } else {
      throw new Error("Invalid filters: At least one of groupId, schoolUdise, or board is required.");
    }
  }

  // async getPointsByClassId(request, groupId, startDate, endDate) {


  //   console.log("classId")

  //   const checkGraphQLQuery = {
  //     query: `
  //     query MyQuery($groupId: uuid!, $startDate: timestamptz, $endDate: timestamptz) {
  //       Group(where: { groupId: { _eq: $groupId } }) {
  //         groupId
  //         type
  //         grade
  //         name

  //       }
  //       topUsers: GroupMembership(
  //         where: { groupId: { _eq: $groupId } },
  //         order_by: { User: { Points_aggregate: { sum: { points: asc } } } },
  //         limit: 10
  //       ) {
  //         User {
  //           name
  //           email
  //           role
  //           status
  //           totalPoints: Points_aggregate(where: { created_at: { _gte: $startDate, _lte: $endDate } }) {
  //             aggregate {
  //               sum {
  //                 points
  //               }
  //             }
  //           }
  //         }
  //       }
  //     }
  //     `,
  //     variables: {
  //       groupId: groupId,
  //       startDate,
  //       endDate,
  //     },
  //   };

  //   const config_data = {
  //     method: 'post',
  //     url: process.env.ALTHASURA,
  //     headers: {
  //       Authorization: request.headers.authorization,
  //       'Content-Type': 'application/json',
  //     },
  //     data: checkGraphQLQuery,
  //   };

  //   try {
  //     const checkResponse = await this.axios(config_data);
  //     console.log("checkResponse", checkResponse.data);

  //     if (checkResponse?.data?.errors) {
  //       return new SuccessResponse({
  //         statusCode: 401,
  //         message: checkResponse?.data?.errors,
  //         data: checkResponse?.data?.data,
  //       });
  //     } else if (checkResponse?.data?.data) {

  //       const formattedData = this.transformClassData(checkResponse?.data?.data)
  //       return new SuccessResponse({
  //         statusCode: 200,
  //         message: 'User Points fetched successfully.',
  //         data: formattedData,
  //       });
  //     } else {
  //       return new SuccessResponse({
  //         statusCode: 200,
  //         message: 'User Points not exists.',
  //         data: [],
  //       });
  //     }
  //   } catch (error) {
  //     console.error('Axios Error:', error.message);
  //     throw new ErrorResponse({
  //       errorCode: 'AXIOS_ERROR',
  //       errorMessage: 'Failed to execute the GraphQL mutation.',
  //     });
  //   }
  // }

  async getPointsByClassId(request, groupId, startDate, endDate) {

    const variables: any = { groupId };
    if (startDate && endDate) {
      variables.startDate = startDate;
      variables.endDate = endDate;
    }

    const checkGraphQLQuery = {
      query: `
      query MyQuery($groupId: uuid!, $startDate: timestamptz, $endDate: timestamptz) {
        Group(where: { groupId: { _eq: $groupId } }) {
          groupId
          type
          grade
          name
        }
        topUsers: GroupMembership(
          where: { groupId: { _eq: $groupId } },
          order_by: { User: { Points_aggregate: { sum: { points: asc } } } },
          limit: 10
        ) {
          User {
            name
            email
            role
            status
            totalPoints: Points_aggregate(
              ${startDate && endDate ? 'where: { created_at: { _gte: $startDate, _lte: $endDate } }' : ''}
            ) {
              aggregate {
                sum {
                  points
                }
              }
            }
          }
        }
      }
      `,
      variables,
    };

    console.log("checkGraphQLQuery", checkGraphQLQuery)

    const config_data = {
      method: 'post',
      url: process.env.ALTHASURA,
      headers: {
        Authorization: request.headers.authorization,
        'Content-Type': 'application/json',
      },
      data: checkGraphQLQuery,
    };

    try {
      const checkResponse = await this.axios(config_data);
      console.log("checkResponse", checkResponse.data);

      if (checkResponse?.data?.errors) {
        return new SuccessResponse({
          statusCode: 401,
          message: checkResponse?.data?.errors,
          data: checkResponse?.data?.data,
        });
      } else if (checkResponse?.data?.data) {

        const formattedData = this.transformClassData(checkResponse?.data?.data)
        return new SuccessResponse({
          statusCode: 200,
          message: 'User Points fetched successfully.',
          data: formattedData,
        });
      } else {
        return new SuccessResponse({
          statusCode: 200,
          message: 'User Points not exists.',
          data: [],
        });
      }
    } catch (error) {
      console.error('Axios Error:', error.message);
      throw new ErrorResponse({
        errorCode: 'AXIOS_ERROR',
        errorMessage: 'Failed to execute the GraphQL mutation.',
      });
    }
  }

  async getPointsBySchoolId(request, schoolUdise, startDate, endDate) {


    const checkGraphQLQuery = {
      query: `
      query MyQuery($schoolUdise: String!, $startDate: timestamptz, $endDate: timestamptz) {
        Group(where: { schoolUdise: { _eq: $schoolUdise } }) {
          groupId
          type
          grade
          name
          topUsers: GroupMemberships(
            order_by: { User: { Points_aggregate: { sum: { points: asc } } } },
            limit: 10
          ) {
            userId
            User {
              name
              email
              role
              status
              totalPoints: Points_aggregate(where: { created_at: { _gte: $startDate, _lte: $endDate } }) {
                aggregate {
                  sum {
                    points
                  }
                }
              }
            }
          }
        }
      }
      `,
      variables: {
        schoolUdise: schoolUdise,
        startDate,
        endDate,
      },
    };

    const config_data = {
      method: 'post',
      url: process.env.ALTHASURA,
      headers: {
        Authorization: request.headers.authorization,
        'Content-Type': 'application/json',
      },
      data: checkGraphQLQuery,
    };

    try {
      const checkResponse = await this.axios(config_data);
      console.log("checkResponse", checkResponse.data);

      if (checkResponse?.data?.errors) {
        return new SuccessResponse({
          statusCode: 401,
          message: checkResponse?.data?.errors,
          data: checkResponse?.data?.data,
        });
      } else if (checkResponse?.data?.data) {

        const formattedData = this.transformSchoolData(checkResponse?.data?.data)
        return new SuccessResponse({
          statusCode: 200,
          message: 'User Points fetched successfully.',
          data: formattedData,
        });
      } else {
        return new SuccessResponse({
          statusCode: 200,
          message: 'User Points not exists.',
          data: [],
        });
      }
    } catch (error) {
      console.error('Axios Error:', error.message);
      throw new ErrorResponse({
        errorCode: 'AXIOS_ERROR',
        errorMessage: 'Failed to execute the GraphQL mutation.',
      });
    }
  }

  async getPointsByBoard(request, board, startDate, endDate) {

    const checkGraphQLQuery = {
      query: `
      query MyQuery($board: String!, $startDate: timestamptz, $endDate: timestamptz) {
        School(where: { board: { _eq: $board } }) {
          board
          udiseCode
          Groups {
            schoolUdise
            groupId
            type
            grade
            name
            topUsers: GroupMemberships(
              order_by: { User: { Points_aggregate: { sum: { points: asc } } } },
              limit: 10
            ) {
              groupId
              User {
                name
                email
                role
                status
                totalPoints: Points_aggregate(where: { created_at: { _gte: $startDate, _lte: $endDate } }) {
                  aggregate {
                    sum {
                      points
                    }
                  }
                }
              }
            }
          }
        }
      }
      `,
      variables: {
        board: board,
        startDate,
        endDate,
      },
    };

    const config_data = {
      method: 'post',
      url: process.env.ALTHASURA,
      headers: {
        Authorization: request.headers.authorization,
        'Content-Type': 'application/json',
      },
      data: checkGraphQLQuery,
    };

    try {
      const checkResponse = await this.axios(config_data);
      console.log("checkResponse", checkResponse.data);

      if (checkResponse?.data?.errors) {
        return new SuccessResponse({
          statusCode: 401,
          message: checkResponse?.data?.errors,
          data: checkResponse?.data?.data,
        });
      } else if (checkResponse?.data?.data) {
        const formattedData = this.transformBoardData(checkResponse?.data?.data)
        return new SuccessResponse({
          statusCode: 200,
          message: 'User Points fetched successfully.',
          data: formattedData,
        });
      } else {
        return new SuccessResponse({
          statusCode: 200,
          message: 'User Points not exists.',
          data: [],
        });
      }
    } catch (error) {
      console.error('Axios Error:', error.message);
      throw new ErrorResponse({
        errorCode: 'AXIOS_ERROR',
        errorMessage: 'Failed to execute the GraphQL mutation.',
      });
    }
  }


  async getDateRange(timeframes: string): Promise<{ startDate: string; endDate: string }> {
    const today = moment(); // Get today's date

    switch (timeframes) {
      case 'today':
        return {
          startDate: today.clone().startOf('day').toISOString(),
          endDate: today.clone().endOf('day').toISOString(),
        };
      case 'last7days':
        return {
          startDate: moment().subtract(7, 'days').startOf('day').toISOString(),
          endDate: today.clone().endOf('day').toISOString(),
        };
      case 'last30days':
        return {
          startDate: moment().subtract(30, 'days').startOf('day').toISOString(),
          endDate: today.clone().endOf('day').toISOString(),
        };
        default:
          // Infinite time range for default
          return {
            startDate: '1900-01-01T00:00:00Z',
            endDate: '9999-12-31T23:59:59Z',
          };
    }
  }

  transformClassData(data: any) {
    const result = {
      group: data.Group.map((group: any) => ({
        name: group.name || "",
        class: group.grade || "",
      }))[0], // Assuming there's only one group object

      topUsers: data.topUsers.map((userEntry: any, index: number) => {
        const user = userEntry.User;
        return {
          name: user.name || "",
          class: data.Group[0]?.grade || "", // Assuming all users belong to the same group
          className: data.Group[0]?.name || "",
          rank: index + 1, // Assuming rank is the index+1 in the topUsers array
          points: user.totalPoints?.aggregate?.sum?.points || 0,
        };
      }),
    };

    return result;
  }

  transformSchoolData(data: any) {
    const result = data.Group.map((group: any) => ({
      groupName: group.name || "",
      grade: group.grade || "",
      topUsers: group.topUsers.map((userEntry: any, index: number) => {
        const user = userEntry.User;
        return {
          name: user.name || "",
          class: data.Group[0]?.grade || "",
          className: data.Group[0]?.name || "",
          rank: index + 1,
          points: user.totalPoints?.aggregate?.sum?.points || 0,
        };
      }),
    }));

    return result;
  }

  transformBoardData(data: any) {
    const result = data.School.map((school: any) => {
      // Collect all topUsers across all groups
      const allTopUsers = school.Groups.flatMap((group: any) =>
        group.topUsers.map((userEntry: any, index: number) => {
          const user = userEntry.User;
          return {
            name: user.name || "",
            class: group.grade || "",
            className: group.name || "",
            rank: index + 1,
            points: user.totalPoints?.aggregate?.sum?.points || 0,
          };
        })
      );

      return {
        board: school.board || "",
        udiseCode: school.udiseCode || "",
        topUsers: allTopUsers, // Unified array of all topUsers
      };
    });

    return result;
  }


}
