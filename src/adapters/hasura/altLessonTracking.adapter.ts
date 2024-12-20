import { Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import jwt_decode from "jwt-decode";
import { SuccessResponse } from "src/success-response";
import { ALTLessonTrackingDto } from "src/altLessonTracking/dto/altLessonTracking.dto";
import { UpdateALTLessonTrackingDto } from "src/altLessonTracking/dto/updateAltLessonTracking.dto";
import { ALTLessonTrackingSearch } from "src/altLessonTracking/dto/searchAltLessonTracking.dto";
import { ProgramService } from "./altProgram.adapter";
import { ALTProgramAssociationService } from "../../adapters/hasura/altProgramAssociation.adapter";
import { ALTModuleTrackingService } from "../../adapters/hasura/altModuleTracking.adapter";
import { ErrorResponse } from "src/error-response";
import { TermsProgramtoRulesDto } from "src/altProgramAssociation/dto/altTermsProgramtoRules.dto";
import { ALTModuleTrackingDto } from "src/altModuleTracking/dto/altModuleTracking.dto";
// import { HasuraUserService } from "./user.adapter";
import { ALTHasuraUserService } from "src/adapters/hasura/altUser.adapter";
import { ALTProgramAssociationSearch } from "src/altProgramAssociation/dto/searchAltProgramAssociation.dto";

@Injectable()
export class ALTLessonTrackingService {
  axios = require("axios");

  constructor(
    private httpService: HttpService,
    private programService: ProgramService,
    private altProgramAssociationService: ALTProgramAssociationService,
    private altModuleTrackingService: ALTModuleTrackingService,
    private hasuraUserService: ALTHasuraUserService
  ) {}

  public async mappedResponse(data: any) {
    const altLessonTrackingResponse = data.map((item: any) => {
      const altLessonMapping = {
        userId: item?.userId ? `${item.userId}` : "",
        courseId: item?.courseId ? `${item.courseId}` : "",
        moduleId: item?.moduleId ? `${item.moduleId}` : "",
        lessonId: item?.lessonId ? `${item.lessonId}` : "",
        attempts: item?.attempts ? `${item.attempts}` : 0,
        score: item?.score ? `${item.score}` : 0,
        status: item?.status ? `${item.status}` : 0,
        scoreDetails: item?.scoreDetails ? `${item.scoreDetails}` : "",
        timeSpent: item?.timeSpent ? `${item.timeSpent}` : 0,
        contentType: item?.contentType ? `${item.contentType}` : "",
      };

      return new ALTLessonTrackingDto(altLessonMapping);
    });
    return altLessonTrackingResponse;
  }

  public async getExistingLessonTrackingRecords(
    request: any,
    lessonId: string,
    moduleId?: string
  ) {
    const decoded: any = jwt_decode(request.headers.authorization);
    const altUserId =
      decoded["https://hasura.io/jwt/claims"]["x-hasura-user-id"];

    const altLessonTrackingRecord = {
      query: `query GetLessonTrackingData ($userId:uuid!, $lessonId:String, $moduleId:String) {
          LessonProgressTracking(where: {userId: {_eq: $userId}, lessonId: {_eq: $lessonId},${
            moduleId ? `, moduleId: {_eq: $moduleId}` : ""
          }}) {
            userId
            moduleId
            lessonId
            created_at
            createdBy
            status
            attempts
            timeSpent
            contentType
            lessonProgressId
        } }`,
      variables: {
        userId: altUserId,
        lessonId: lessonId,
        ...(moduleId && { moduleId }),
      },
    };

    const configData = {
      method: "post",
      url: process.env.ALTHASURA,
      headers: {
        Authorization: request.headers.authorization,
        "Content-Type": "application/json",
      },
      data: altLessonTrackingRecord,
    };

    const resLessonTracking = await this.axios(configData);

    if (resLessonTracking?.data?.errors) {
      return new ErrorResponse({
        errorCode: resLessonTracking.data.errors[0].extensions,
        errorMessage: resLessonTracking.data.errors[0].message,
      });
    }

    const result = resLessonTracking.data.data.LessonProgressTracking;

    return new SuccessResponse({
      statusCode: 200,
      message: "Ok.",
      data: result,
    });
  }

  public async getLastLessonTrackingRecord(
    request: any,
    lessonId: string,
    moduleId: string,
    attemptNumber: number
  ) {
    const decoded: any = jwt_decode(request.headers.authorization);
    const userId = decoded["https://hasura.io/jwt/claims"]["x-hasura-user-id"];
    console.log(
      "getLastLessonTrackingRecord-->>",
      lessonId,
      moduleId,
      attemptNumber
    );
    const altLastLessonTrackingRecord = {
      query: `query GetLastLessonTrackingRecord ($userId:uuid!, $lessonId:String, $moduleId:String) {
          LessonProgressTracking(where: {userId: {_eq: $userId}, lessonId: {_eq: $lessonId}, moduleId: {_eq: $moduleId}}) {
            created_at
            createdBy
            status
            attempts
        } }`,
      variables: {
        userId: userId,
        lessonId: lessonId,
        moduleId: moduleId,
      },
    };

    const configData = {
      method: "post",
      url: process.env.ALTHASURA,
      headers: {
        Authorization: request.headers.authorization,
        "Content-Type": "application/json",
      },
      data: altLastLessonTrackingRecord,
    };

    const resLessonTracking = await this.axios(configData);

    if (resLessonTracking?.data?.errors) {
      throw {
        errorCode: resLessonTracking.data.errors[0].extensions,
        errorMessage: resLessonTracking.data.errors[0].message,
      };
    }

    return resLessonTracking.data.data.LessonProgressTracking;
  }

  public async getALTLessonTracking(
    request: any,
    altLessonId: string,
    userId?: string
  ) {
    const decoded: any = jwt_decode(request.headers.authorization);

    let altUserId: string;

    if (userId) {
      const userRes: any = await this.hasuraUserService.getUser(
        userId,
        request
      );
      if (userRes.data.username) {
        altUserId = userId;
      } else {
        return new ErrorResponse({
          errorCode: "400",
          errorMessage: "Invalid User Id",
        });
      }
    } else {
      altUserId = decoded["https://hasura.io/jwt/claims"]["x-hasura-user-id"];
    }

    const ALTLessonTrackingData = {
      query: `
            query GetLessonTracking($altUserId: uuid!, $altLessonId: String) {
                LessonProgressTracking(where: {lessonId: {_eq: $altLessonId}, userId: {_eq: $altUserId}}) {
                  courseId
                  lessonId
                  moduleId
                  userId
                  attempts
                  status
                  score
                  timeSpent
                  contentType
                  scoreDetails
                }
              }                 
            `,
      variables: {
        altLessonId: altLessonId,
        altUserId: altUserId,
      },
    };

    const configData = {
      method: "post",
      url: process.env.ALTHASURA,
      headers: {
        Authorization: request.headers.authorization,
        "Content-Type": "application/json",
      },
      data: ALTLessonTrackingData,
    };

    const response = await this.axios(configData);

    if (response?.data?.errors) {
      return new ErrorResponse({
        errorCode: response.data.errors[0].extensions,
        errorMessage: response.data.errors[0].message,
      });
    }

    const result = response.data.data.LessonProgressTracking;

    const data = await this.mappedResponse(result);

    return new SuccessResponse({
      statusCode: 200,
      message: "Ok.",
      data: data,
    });
  }

  public async checkAndAddALTLessonTracking(
    request: any,
    programId: string,
    subject: string,
    altLessonTrackingDto: ALTLessonTrackingDto
  ) {
    const scoreDetails = altLessonTrackingDto?.scoreDetails;

    // Not allowing blank array and objects in database
    if (Array.isArray(scoreDetails) && !scoreDetails.length) {
      return new ErrorResponse({
        errorCode: "400",
        errorMessage: "Score Details is empty",
      });
    }

    if (Object.keys(scoreDetails).length === 0) {
      return new ErrorResponse({
        errorCode: "400",
        errorMessage: "Score Details is empty",
      });
    }

    if (
      JSON.stringify(scoreDetails) === "{}" ||
      JSON.stringify(scoreDetails) === "[]"
    ) {
      return new ErrorResponse({
        errorCode: "400",
        errorMessage: "Score Details is empty",
      });
    }

    const decoded: any = jwt_decode(request.headers.authorization);
    altLessonTrackingDto.userId =
      decoded["https://hasura.io/jwt/claims"]["x-hasura-user-id"];
    altLessonTrackingDto.createdBy = altLessonTrackingDto.userId;
    altLessonTrackingDto.updatedBy = altLessonTrackingDto.userId;
    altLessonTrackingDto.timeSpent =
      altLessonTrackingDto.timeSpent > 0 ? altLessonTrackingDto.timeSpent : 0;
    altLessonTrackingDto.programId = programId;
    let errorExRec = "";
    let recordList: any;
    recordList = await this.getExistingLessonTrackingRecords(
      request,
      altLessonTrackingDto.lessonId,
      altLessonTrackingDto.moduleId
    ).catch(function (error) {
      if (error?.response?.data) {
        errorExRec = error.response.data.errorMessage;
      } else {
        errorExRec = error + ", Can't fetch existing records.";
      }
    });

    if (!recordList?.data) {
      return new ErrorResponse({
        errorCode: "400",
        errorMessage: recordList?.errorMessage,
      });
    }

    // rule is needed to check baseline assessment or course
    let currentProgramDetails: any = {};
    currentProgramDetails = await this.programService.getProgramDetailsById(
      request,
      programId
    );

    if (!currentProgramDetails.data) {
      return new ErrorResponse({
        errorCode: "400",
        errorMessage: currentProgramDetails?.errorMessage,
      });
    }

    const paramData = new TermsProgramtoRulesDto(currentProgramDetails.data);

    let progTermData: any = {};
    progTermData = await this.altProgramAssociationService.getRules(request, {
      programId: programId,
      board: paramData[0].board,
      medium: paramData[0].medium,
      grade: paramData[0].grade,
      subject: subject,
    });

    let programRules: any;

    if (progTermData?.data[0]?.rules) {
      programRules = JSON.parse(progTermData.data[0].rules);
    } else {
      return new ErrorResponse({
        errorCode: "400",
        errorMessage: "Program Rules not found for given subject!",
      });
    }

    let flag = false;
    let tracklessonModule;

    if (altLessonTrackingDto.userId) {
      for (const course of programRules?.prog) {
        if (course.contentId == altLessonTrackingDto.courseId) {
          flag = true;
          const numberOfRecords = parseInt(recordList?.data.length);
          const allowedAttempts = parseInt(course.allowedAttempts);
          if (course.contentType == "assessment" && allowedAttempts === 1) {
            // handling baseline assessment
            if (numberOfRecords === 0) {
              altLessonTrackingDto.attempts = 1;

              return await this.createALTLessonTracking(
                request,
                altLessonTrackingDto
              );
            } else if (
              numberOfRecords === 1 &&
              recordList.data[0].status !== "completed"
            ) {
              return await this.updateALTLessonTracking(
                request,
                altLessonTrackingDto.lessonId,
                altLessonTrackingDto,
                0
              );
            } else if (
              numberOfRecords === 1 &&
              recordList.data[0].status === "completed"
            ) {
              return new ErrorResponse({
                errorCode: "400",
                errorMessage: "Record for Assessment already exists!",
              });
            } else {
              return new ErrorResponse({
                errorCode: "400",
                errorMessage:
                  "Duplicate entry found in DataBase for Assessment",
              });
            }
          } else if (course.contentType == "course" && allowedAttempts === 0) {
            // if course content handling creation and updation of lesson with module
            if (numberOfRecords === 0) {
              altLessonTrackingDto.attempts = 1;
              const lessonTrack: any = await this.createALTLessonTracking(
                request,
                altLessonTrackingDto
              );

              if (
                altLessonTrackingDto.status === "completed" &&
                lessonTrack?.statusCode === 200
              ) {
                tracklessonModule = await this.lessonToModuleTracking(
                  request,
                  altLessonTrackingDto,
                  programId,
                  subject,
                  false
                );
              }

              return {
                lessonTrack: lessonTrack,
                tracking: tracklessonModule,
              };
            } else if (numberOfRecords >= 1) {
              const lastRecord = await this.getLastLessonTrackingRecord(
                request,
                altLessonTrackingDto.lessonId,
                altLessonTrackingDto.moduleId,
                numberOfRecords
              ).catch(function (error) {
                return new ErrorResponse({
                  errorCode: "400",
                  errorMessage: error,
                });
              });

              if (!lastRecord[0]?.status) {
                return new ErrorResponse({
                  errorCode: "400",
                  errorMessage: lastRecord + "Error getting last record",
                });
              }

              if (lastRecord[0]?.status !== "completed") {
                // if last record is not completed complete it first and update
                const lessonTrack: any = await this.updateALTLessonTracking(
                  request,
                  altLessonTrackingDto.lessonId,
                  altLessonTrackingDto,
                  lastRecord[0]?.attempts
                );

                // Adding to module only when its first attempt and increasing count in module for lesson
                if (
                  altLessonTrackingDto.status === "completed" &&
                  lastRecord[0].attempts === 1 &&
                  lessonTrack?.statusCode === 200
                ) {
                  tracklessonModule = await this.lessonToModuleTracking(
                    request,
                    altLessonTrackingDto,
                    programId,
                    subject,
                    false
                  );
                }

                return {
                  lessonTrack: lessonTrack,
                  tracking: tracklessonModule,
                };
              } else if (lastRecord[0]?.status === "completed") {
                // for repeat attempts
                altLessonTrackingDto.attempts = numberOfRecords + 1;
                const lessonTrack: any = await this.createALTLessonTracking(
                  request,
                  altLessonTrackingDto
                );

                // modify module time here
                if (
                  altLessonTrackingDto.status === "completed" &&
                  lessonTrack?.statusCode === 200
                ) {
                  tracklessonModule = await this.lessonToModuleTracking(
                    request,
                    altLessonTrackingDto,
                    programId,
                    subject,
                    true
                  );
                }

                return {
                  lessonTrack: lessonTrack,
                  tracking: "Multiple attempt for lesson added",
                };
              } else {
                return new ErrorResponse({
                  errorCode: "400",
                  errorMessage: lastRecord,
                });
              }
            }
          }
        }
      }
      if (!flag) {
        return new ErrorResponse({
          errorCode: "400",
          errorMessage: `Course provided does not exist in the current program.`,
        });
      }
    }
  }

  public async createALTLessonTracking(
    request: any,
    altLessonTrackingDto: ALTLessonTrackingDto
  ) {
    const decoded: any = jwt_decode(request.headers.authorization);
    altLessonTrackingDto.userId =
      decoded["https://hasura.io/jwt/claims"]["x-hasura-user-id"];

    const altLessonTracking = new ALTLessonTrackingDto(altLessonTrackingDto);
    let newAltLessonTracking = "";
    Object.keys(altLessonTrackingDto).forEach((key) => {
      if (
        altLessonTrackingDto[key] &&
        altLessonTrackingDto[key] != "" &&
        Object.keys(altLessonTracking).includes(key)
      ) {
        if (key === "status") {
          newAltLessonTracking += `${key}: ${altLessonTrackingDto[key]},`;
        } else {
          newAltLessonTracking += `${key}: ${JSON.stringify(
            altLessonTrackingDto[key]
          )},`;
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
                moduleId
                lessonProgressId
                score
                timeSpent
                contentType
                scoreDetails  
                programId
          }
        }`,
      variables: {},
    };
    console.log(altLessonTrackingData.query);

    const configDataforCreate = {
      method: "post",
      url: process.env.ALTHASURA,
      headers: {
        Authorization: request.headers.authorization,
        "Content-Type": "application/json",
      },
      data: altLessonTrackingData,
    };

    const response = await this.axios(configDataforCreate);

    if (response?.data?.errors) {
      return new ErrorResponse({
        errorCode: response.data.errors[0].extensions,
        errorMessage: response.data.errors[0].message,
      });
    }

    const result = response.data.data.insert_LessonProgressTracking_one;

    return new SuccessResponse({
      statusCode: 200,
      message: "Ok.",
      data: result,
    });
  }

  public async updateALTLessonTracking(
    request: any,
    lessonId: string,
    updateAltLessonTrackDto: any,
    lastAttempt: number,
    data?: any
  ) {
    const decoded: any = jwt_decode(request.headers.authorization);
    const userId = decoded["https://hasura.io/jwt/claims"]["x-hasura-user-id"];
    const courseId = data?.courseId;
    const moduleId = data?.moduleId;

    const updateAltLessonTracking = updateAltLessonTrackDto;

    let newUpdateAltLessonTracking = "";
    Object.keys(updateAltLessonTrackDto).forEach((key) => {
      if (
        updateAltLessonTrackDto[key] &&
        updateAltLessonTrackDto[key] != "" &&
        Object.keys(updateAltLessonTracking).includes(key)
      ) {
        if (key === "status") {
          newUpdateAltLessonTracking += `${key}: ${updateAltLessonTrackDto[key]},`;
        } else {
          newUpdateAltLessonTracking += `${key}: ${JSON.stringify(
            updateAltLessonTrackDto[key]
          )}, `;
        }
      }
    });

    let altLessonUpdateTrackingData;

    if (!lastAttempt) {
      altLessonUpdateTrackingData = {
        query: `mutation updateAltLessonTracking ($userId:uuid!, $lessonId:String, $courseId: String, $moduleId: String) {
              update_LessonProgressTracking(where: {lessonId: {_eq: $lessonId}, userId: {_eq: $userId},courseId: {_eq: $courseId}, moduleId: {_eq:$moduleId} }, _set: {${newUpdateAltLessonTracking}}) {
              affected_rows
              returning{
              lessonProgressId
              }
            }
        }`,
        variables: {
          userId: userId,
          lessonId: lessonId,
          courseId: courseId,
          moduleId: moduleId,
        },
      };
    } else {
      // newUpdateAltLessonTracking[attemp] = lastAttempt + 1;
      lastAttempt = lastAttempt + 1;
      newUpdateAltLessonTracking += `attempts: ${lastAttempt}, `;
      if (updateAltLessonTrackDto?.score === 0) {
        newUpdateAltLessonTracking += `score:${updateAltLessonTrackDto?.score}`;
      }

      altLessonUpdateTrackingData = {
        query: `mutation updateAltLessonTracking ($userId:uuid!, $lessonId:String, $courseId: String, $moduleId: String) {
              update_LessonProgressTracking(where: {lessonId: {_eq: $lessonId}, userId: {_eq: $userId}, courseId: {_eq: $courseId}, moduleId: {_eq:$moduleId}}, _set: {${newUpdateAltLessonTracking}}) {
              affected_rows
              returning{
              lessonProgressId
              }
            }
        }`,
        variables: {
          userId: userId,
          lessonId: lessonId,
          courseId: courseId,
          moduleId: moduleId,
        },
      };
    }

    const configData = {
      method: "post",
      url: process.env.ALTHASURA,
      headers: {
        Authorization: request.headers.authorization,
        "Content-Type": "application/json",
      },
      data: altLessonUpdateTrackingData,
    };

    const response = await this.axios(configData);

    if (response?.data?.errors) {
      return new ErrorResponse({
        errorCode: "422",
        errorMessage: response.data.errors[0].message,
      });
    }

    const result = response.data.data.update_LessonProgressTracking;

    return new SuccessResponse({
      statusCode: 200,
      message: "Ok.",
      data: result,
    });
  }

  public async searchALTLessonTracking(
    request: any,
    userId: string,
    altLessonTrackingSearch: ALTLessonTrackingSearch
  ) {
    var axios = require("axios");

    const decoded: any = jwt_decode(request.headers.authorization);
    const altUserId =
      decoded["https://hasura.io/jwt/claims"]["x-hasura-user-id"];

    altLessonTrackingSearch.filters.userId = userId;
    let query = "";
    Object.keys(altLessonTrackingSearch.filters).forEach((e) => {
      if (
        altLessonTrackingSearch.filters[e] &&
        altLessonTrackingSearch.filters[e] != ""
      ) {
        if (e === "status") {
          query += `${e}:{_eq: ${altLessonTrackingSearch.filters[e]}},`;
        } else {
          query += `${e}:{_eq:"${altLessonTrackingSearch.filters[e]}"}`;
        }
      }
    });

    var searchData = {
      query: `query SearchALTLessonTracking($limit:Int) {
        LessonProgressTracking(limit: $limit, where: {${query}}) {
          userId
          courseId
          lessonId
          moduleId
          status
          attempts
          score
          timeSpent
          contentType
          scoreDetails
        }
    }`,
      variables: {
        limit: altLessonTrackingSearch.limit,
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

    let result = response.data.data.LessonProgressTracking;
    const altLessonTrackingList = await this.mappedResponse(result);

    return new SuccessResponse({
      statusCode: 200,
      message: "Ok.",
      data: altLessonTrackingList,
    });
  }

  public async lessonToModuleTracking(
    request: any,
    altLessonTrackingDto: ALTLessonTrackingDto,
    programId: string,
    subject: string,
    repeatAttempt: boolean
  ) {
    const currentUrl = process.env.SUNBIRDURL;

    let config = {
      method: "get",
      url:
        currentUrl +
        `/api/course/v1/hierarchy/${altLessonTrackingDto.courseId}?orgdetails=orgName,email&licenseDetails=name,description,url`,
    };

    const courseHierarchy = await this.axios(config);
    const data = courseHierarchy?.data.result.content;
    let noOfModules = data.children.length;

    let currentModule = data.children.find((item) => {
      return item.identifier === altLessonTrackingDto.moduleId;
    });

    let altModuleTracking = {
      userId: altLessonTrackingDto.userId,
      courseId: altLessonTrackingDto.courseId,
      moduleId: altLessonTrackingDto.moduleId,
      status: "ongoing",
      totalNumberOfLessonsCompleted: 1,
      totalNumberOfLessons: currentModule.children.length,
      timeSpent: altLessonTrackingDto.timeSpent,
      createdBy: altLessonTrackingDto.userId,
      updatedBy: altLessonTrackingDto.userId,
    };

    const altModuleTrackingDto = new ALTModuleTrackingDto(altModuleTracking);

    let moduleTracking: any;
    moduleTracking =
      await this.altModuleTrackingService.checkAndAddALTModuleTracking(
        request,
        programId,
        subject,
        noOfModules,
        repeatAttempt,
        altModuleTrackingDto
      );

    if (moduleTracking?.statusCode != 200) {
      return new ErrorResponse({
        errorCode: moduleTracking?.statusCode,
        errorMessage:
          moduleTracking?.errorMessage + "Could not create Module Tracking",
      });
    } else {
      if (moduleTracking.data.moduleProgressId) {
        return new SuccessResponse({
          statusCode: moduleTracking?.statusCode,
          message: "Ok.",
          data: { ack: "Module and Course Tracking created" },
        });
      } else if (moduleTracking.data.affected_rows) {
        return new SuccessResponse({
          statusCode: moduleTracking?.statusCode,
          message: "Ok.",
          data: { ack: "Module and Course Tracking updated" },
        });
      } else {
        return new SuccessResponse({
          statusCode: moduleTracking?.statusCode,
          message: "Ok.",
          data: { ack: "Course completed" },
        });
      }
    }
  }
  public async glaAddLessonTracking(
    request: any,
    altLessonTrackingDto: ALTLessonTrackingDto,
    programId: string,
    subject: string,
    response: any
  ) {
    //  Validate the `scoreDetails` field
    const scoreDetails = altLessonTrackingDto?.scoreDetails;

    if (Array.isArray(scoreDetails) && !scoreDetails.length) {
      return response.status(422).json(
        new ErrorResponse({
          errorCode: "422",
          errorMessage: "Score Details is empty",
        })
      );
    }

    if (Object.keys(scoreDetails).length === 0) {
      return response.status(422).json(
        new ErrorResponse({
          errorCode: "422",
          errorMessage: "Score Details is empty",
        })
      );
    }
    let lessonProgressId;
    //  Decode the JWT token for user identification

    const decoded: any = jwt_decode(request.headers.authorization);
    altLessonTrackingDto.userId =
      decoded["https://hasura.io/jwt/claims"]["x-hasura-user-id"];
    altLessonTrackingDto.createdBy = altLessonTrackingDto.userId;
    altLessonTrackingDto.updatedBy = altLessonTrackingDto.userId;
    altLessonTrackingDto.timeSpent =
      altLessonTrackingDto.timeSpent > 0
        ? Math.round(altLessonTrackingDto.timeSpent)
        : 0;
    altLessonTrackingDto.programId = programId;

    //  Fetch existing lesson tracking records
    let recordList: any;
    try {
      recordList = await this.getExistingLessonTrackingRecords(
        request,
        altLessonTrackingDto.lessonId
      );
    } catch (error) {
      return response.status(422).json(
        new ErrorResponse({
          errorCode: "422",
          errorMessage:
            error?.response?.data?.errorMessage ||
            "Can't fetch existing records.",
        })
      );
    }
    if (!recordList?.data) {
      return response.status(422).json(
        new ErrorResponse({
          errorCode: "422",
          errorMessage: recordList?.errorMessage,
        })
      );
    }

    // Determine if a record already exists
    lessonProgressId = recordList?.data[0]
      ? recordList?.data[0]?.lessonProgressId
      : 0;

    //  Fetch program details
    let currentProgramDetails: any = {};
    try {
      currentProgramDetails = await this.programService.getProgramDetailsById(
        request,
        programId
      );
    } catch (error) {
      return response.status(422).json(
        new ErrorResponse({
          errorCode: "422",
          errorMessage:
            error?.response?.data?.errorMessage ||
            "Can't fetch program details.",
        })
      );
    }

    // Map program details to DTO for fetching rules

    const paramData = new TermsProgramtoRulesDto(currentProgramDetails.data);
    //  Fetch program rules for the given subject

    let progTermData: any = {};
    try {
      progTermData = await this.altProgramAssociationService.getRules(request, {
        programId: programId,
        board: paramData[0].board,
        medium: paramData[0].medium,
        grade: paramData[0].grade,
        subject: subject,
      });
    } catch (error) {
      return response.status(422).json(
        new ErrorResponse({
          errorCode: "422",
          errorMessage: "Program Rules not found for given subject!",
        })
      );
    }

    let programRules: any;
    if (progTermData?.data[0]?.rules) {
      programRules = JSON.parse(progTermData.data[0].rules);
    } else {
      return response.status(422).json(
        new ErrorResponse({
          errorCode: "422",
          errorMessage: "Program Rules not found for given subject!",
        })
      );
    }
    //  Loop through program rules to process the lesson tracking

    //  Check lessonId and courseId in programRules
    const currentLessonId = altLessonTrackingDto.lessonId;
    let courseId;

    for (const program of programRules.prog) {
      if (
        program.contentId === currentLessonId ||
        program.lesson_questionset === currentLessonId
      ) {
        courseId = program; // Fetch courseId for the matched lessonId
        break;
      }
    }

    if (!courseId) {
      return response.status(422).json(
        new ErrorResponse({
          errorCode: "422",
          errorMessage: `Program details not available for LessonId ${currentLessonId}`,
        })
      );
    } else if (!courseId?.courseId) {
      return response.status(422).json(
        new ErrorResponse({
          errorCode: "422",
          errorMessage: `Course Id not available in the program rules for LessonId ${currentLessonId}`,
        })
      );
    }

    // Call checkLessonAndModuleExistInCourse with the found courseId
    const checkLessonExist = await this.checkLessonAndModuleExistInCourse({
      ...altLessonTrackingDto,
      courseId,
    });
    if (checkLessonExist instanceof ErrorResponse) {
      return checkLessonExist; // Return the error directly
    }

    const moduleId = checkLessonExist.data;
    altLessonTrackingDto.courseId = courseId?.courseId;
    altLessonTrackingDto.moduleId = moduleId;

    let flag = false;
    let tracklessonModule;

    if (altLessonTrackingDto.userId) {
      for (const course of programRules?.prog) {
        const numberOfRecords = parseInt(recordList?.data.length);
        // Check if the course matches
        if (
          course.contentId == altLessonTrackingDto.lessonId ||
          course.lesson_questionset == altLessonTrackingDto.lessonId
        ) {
          flag = true;

          // if course content handling creation and updation of lesson with module

          if (numberOfRecords === 0) {
            altLessonTrackingDto.attempts = 1; // keeping it one
            const lessonTrack: any = await this.createALTLessonTracking(
              request,
              altLessonTrackingDto
            );

            lessonProgressId = lessonTrack?.data?.lessonProgressId;

            if (
              altLessonTrackingDto.status === "completed" &&
              lessonTrack?.statusCode === 200
            ) {
              tracklessonModule = await this.glalessonToModuleTracking(
                request,
                altLessonTrackingDto,
                programId,
                subject,
                false
              );
            }
            // Log progress tracking after insertion
            const loggedAttempt = await this.logLessonAttemptProgressTracking(
              request,
              altLessonTrackingDto,
              lessonProgressId
            );

            return response.status(200).json({
              lessonTrack: lessonTrack,
              tracking: tracklessonModule,
              loggedAttempt: loggedAttempt,
            });
          } else if (numberOfRecords >= 1) {
            //fetching the last records from database and checking its status
            const lastRecord = await this.getLastLessonTrackingRecord(
              request,
              altLessonTrackingDto.lessonId,
              altLessonTrackingDto.moduleId,
              numberOfRecords
            ).catch(function (error) {
              return response.status(422).json(
                new ErrorResponse({
                  errorCode: "422",
                  errorMessage: error,
                })
              );
            });

            if (!lastRecord[0]?.status) {
              return response.status(422).json(
                new ErrorResponse({
                  errorCode: "422",
                  errorMessage: lastRecord + "Error getting last record",
                })
              );
            }

            if (lastRecord[0]?.status !== "completed") {
              const lessonTrack: any = await this.updateALTLessonTracking(
                request,
                altLessonTrackingDto.lessonId,
                altLessonTrackingDto,
                lastRecord[0]?.attempts,
                {
                  courseId: altLessonTrackingDto.courseId,
                  moduleId: altLessonTrackingDto.moduleId,
                }
              );

              // Adding to module only when its first attempt and increasing count in module for lesson
              if (
                altLessonTrackingDto.status === "completed" &&
                lessonTrack?.statusCode === 200
              ) {
                tracklessonModule = await this.glalessonToModuleTracking(
                  request,
                  altLessonTrackingDto,
                  programId,
                  subject,
                  false
                );
              }
              // Log progress tracking after insertion
              const loggedAttempt = await this.logLessonAttemptProgressTracking(
                request,
                altLessonTrackingDto,
                lessonProgressId
              );

              return {
                lessonTrack: lessonTrack,
                tracking: tracklessonModule,
                loggedAttempt: loggedAttempt,
              };
            } else if (lastRecord[0]?.status === "completed") {
              altLessonTrackingDto.score = altLessonTrackingDto.score;
              const lessonTrack: any = await this.updateALTLessonTracking(
                request,
                altLessonTrackingDto.lessonId,
                altLessonTrackingDto,
                lastRecord[0]?.attempts,
                {
                  courseId: altLessonTrackingDto.courseId,
                  moduleId: altLessonTrackingDto.moduleId,
                }
              );
              const loggedAttempt = await this.logLessonAttemptProgressTracking(
                request,
                altLessonTrackingDto,
                lessonProgressId
              );
              return response.status(201).json({
                lessonTrack: lessonTrack,
                tracking: tracklessonModule,
                loggedAttempt: loggedAttempt,
              });
            } else {
              return response.status(422).json(
                new ErrorResponse({
                  errorCode: "422",
                  errorMessage: lastRecord,
                })
              );
            }
          }
        }
      }
    }

    //If no valid course is found in the program
    if (!flag) {
      return response.status(422).json(
        new ErrorResponse({
          errorCode: "422",
          errorMessage: `Course provided does not exist in the current program.`,
        })
      );
    }
  }
  public async logLessonAttemptProgressTracking(
    request,
    data,
    lessonProgressId
  ) {
    const decoded: any = jwt_decode(request.headers.authorization);
    const userId = decoded["https://hasura.io/jwt/claims"]["x-hasura-user-id"];
    const query = {
      query: `mutation MyMutation($score: Int, $scoreDetails: String, $status: String, $timeSpent: Int, $userId: uuid, $createdBy: String, $updatedBy: String, $lessonProgressId: Int) {
  insert_LessonProgressAttemptTracking(objects: {score: $score, scoreDetails: $scoreDetails, status: $status, timeSpent: $timeSpent, userId: $userId, createdBy: $createdBy, updatedBy: $updatedBy, lessonProgressId: $lessonProgressId}) {
    affected_rows
  }
}


`,
      variables: {
        userId: userId,
        createdBy: userId,
        updatedBy: userId,
        score: data.score,
        scoreDetails: data.scoreDetails,
        status: data.status,
        timeSpent: data.timeSpent,
        lessonProgressId: lessonProgressId,
      },
    };
    const configData = {
      method: "post",
      url: process.env.ALTHASURA,
      headers: {
        Authorization: request.headers.authorization,
        "Content-Type": "application/json",
      },
      data: query,
    };
    const response = await this.axios(configData);

    if (response?.data?.errors) {
      return new ErrorResponse({
        errorCode: response.data.errors[0].extensions,
        errorMessage: response.data.errors[0].message,
      });
    }

    const result = response.data.data.update_LessonProgressTracking;

    return new SuccessResponse({
      statusCode: 200,
      message: "Ok.",
      data: result,
    });
  }
  public async checkLessonAndModuleExistInCourse(altLessonTrackingDto: any) {
    console.log("caltourseId-->>", altLessonTrackingDto?.courseId?.courseId);
    const currentUrl = process.env.SUNBIRDURL;
    const config = {
      method: "get",
      url: `${currentUrl}/api/course/v1/hierarchy/${altLessonTrackingDto.courseId?.courseId}?orgdetails=orgName,email&licenseDetails=name,description,url`,
    };

    console.log("axiosherer-->>>", config.url);
    const courseHierarchy = await this.axios(config);
    const data = courseHierarchy?.data.result.content;
    console.log("axiosData-->>", data);

    let moduleId = null;

    for (const module of data.children) {
      if (module.children) {
        // Search for the lesson in the nested `children` array
        const foundLesson = module.children.find(
          (lesson) => lesson.identifier === altLessonTrackingDto.lessonId
        );

        if (foundLesson) {
          // Assign the `parent` of the lesson as `moduleId`
          moduleId = foundLesson.parent;
          break; // Exit the loop once the lesson is found
        }
      }
    }

    // Check if the lesson was found
    if (!moduleId) {
      return new ErrorResponse({
        errorCode: "404",
        errorMessage: "ModuleId Not Found",
      });
    }
    // If lesson is found, return success response
    return new SuccessResponse({
      statusCode: 200,
      message: "Lesson found in the course hierarchy",
      data: moduleId,
    });
  }
  public async glalessonToModuleTracking(
    request: any,
    altLessonTrackingDto: ALTLessonTrackingDto,
    programId: string,
    subject: string,
    repeatAttempt: boolean
  ) {
    //add or update the recond in the moduleTRacking table
    const currentUrl = process.env.SUNBIRDURL;

    let config = {
      method: "get",
      url:
        currentUrl +
        `/api/course/v1/hierarchy/${altLessonTrackingDto.courseId}?orgdetails=orgName,email&licenseDetails=name,description,url`,
    };

    const courseHierarchy = await this.axios(config);
    const data = courseHierarchy?.data.result.content;
    let noOfModules = data.children.length;

    let currentModule = data.children.find((item) => {
      return item.identifier === altLessonTrackingDto.moduleId;
    });

    let altModuleTracking = {
      userId: altLessonTrackingDto.userId,
      courseId: altLessonTrackingDto.courseId,
      moduleId: altLessonTrackingDto.moduleId,
      status: "ongoing",
      totalNumberOfLessonsCompleted: 1,
      totalNumberOfLessons: currentModule.children.length,
      timeSpent: altLessonTrackingDto.timeSpent,
      createdBy: altLessonTrackingDto.userId,
      updatedBy: altLessonTrackingDto.userId,
    };

    const altModuleTrackingDto = new ALTModuleTrackingDto(altModuleTracking);
    let moduleTracking: any;
    moduleTracking =
      await this.altModuleTrackingService.glaCheckAndAddALTModuleTracking(
        request,
        programId,
        subject,
        noOfModules,
        repeatAttempt,
        altModuleTrackingDto
      );

    if (moduleTracking?.statusCode != 200) {
      return new ErrorResponse({
        errorCode: moduleTracking?.statusCode,
        errorMessage:
          moduleTracking?.errorMessage + "Could not create Module Tracking",
      });
    } else {
      if (moduleTracking.data.moduleProgressId) {
        return new SuccessResponse({
          statusCode: moduleTracking?.statusCode,
          message: "Ok.",
          data: { ack: "Module and Course Tracking created" },
        });
      } else if (moduleTracking.data.affected_rows) {
        return new SuccessResponse({
          statusCode: moduleTracking?.statusCode,
          message: "Ok.",
          data: { ack: "Module and Course Tracking updated" },
        });
      } else {
        return new SuccessResponse({
          statusCode: moduleTracking?.statusCode,
          message: "Ok.",
          data: { ack: "Course completed" },
        });
      }
    }
  }
}
