import { Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import jwt_decode from "jwt-decode";
import { SuccessResponse } from "src/success-response";
import { ALTCourseTrackingDto } from "src/altCourseTracking/dto/altCourseTracking.dto";
import { UpdateALTCourseTrackingDto } from "src/altCourseTracking/dto/updatealtCourseTracking.dto";
import { ALTCourseTrackingSearch } from "src/altCourseTracking/dto/searchaltCourseTracking.dto";
import { ErrorResponse } from "src/error-response";
// import { HasuraUserService } from "./user.adapter";
import { ALTHasuraUserService } from "src/adapters/hasura/altUser.adapter";

@Injectable()
export class ALTCourseTrackingService {
  axios = require("axios");

  constructor(
    private httpService: HttpService,
    private hasuraUserService: ALTHasuraUserService
  ) {}

  public async mappedResponse(data: any) {
    const altCourseTrackingResponse = data.map((item: any) => {
      const altCourseMapping = {
        userId: item?.userId ? `${item.userId}` : "",
        courseId: item?.courseId ? `${item.courseId}` : "",
        totalNumberOfModulesCompleted: item?.totalNumberOfModulesCompleted
          ? `${item.totalNumberOfModulesCompleted}`
          : 0,
        totalNumberOfModules: item?.totalNumberOfModules
          ? `${item.totalNumberOfModules}`
          : 0,
        timeSpent: item?.timeSpent ? `${item.timeSpent}` : 0,
        status: item?.status ? `${item.status}` : "",
        createdBy: item?.createdBy ? `${item.createdBy}` : "",
        updatedBy: item?.updatedBy ? `${item.updatedBy}` : "",
        createdAt: item?.created_at ? `${item.created_at}` : "",
        updatedAt: item?.updated_at ? `${item.updated_at}` : "",
      };
      return new ALTCourseTrackingDto(altCourseMapping);
    });

    return altCourseTrackingResponse;
  }

  public async getExistingCourseTrackingRecords(
    request: any,
    altCourseId: string,
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
      const decoded: any = jwt_decode(request.headers.authorization);
      altUserId = decoded["https://hasura.io/jwt/claims"]["x-hasura-user-id"];
    }

    const ALTCourseTrackingData = {
      query: `
            query MyQuery($altUserId: uuid!, $altCourseId: String) {
                CourseProgressTracking(where: {courseId: {_eq: $altCourseId}, userId: {_eq: $altUserId}}) {
                  courseId
                  userId
                  totalNumberOfModulesCompleted
                  totalNumberOfModules
                  timeSpent
                  status
                  created_at
                  updated_at
                  createdBy
                  updatedBy
                }
              }                 
            `,
      variables: {
        altCourseId: altCourseId,
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
      data: ALTCourseTrackingData,
    };

    const response = await this.axios(configData);

    if (response?.data?.errors) {
      return new ErrorResponse({
        errorCode: response.data.errors[0].extensions,
        errorMessage: response.data.errors[0].message,
      });
    }

    const result = response.data.data.CourseProgressTracking;

    const data = await this.mappedResponse(result);

    return new SuccessResponse({
      statusCode: 200,
      message: "Ok.",
      data: data,
    });
  }

  public async createALTCourseTracking(
    request: any,
    altCourseTrackingDto: ALTCourseTrackingDto
  ) {
    const decoded: any = jwt_decode(request.headers.authorization);
    altCourseTrackingDto.userId =
      decoded["https://hasura.io/jwt/claims"]["x-hasura-user-id"];

    const altCourseTracking = new ALTCourseTrackingDto(altCourseTrackingDto);
    let newAltCourseTracking = "";
    Object.keys(altCourseTrackingDto).forEach((key) => {
      if (
        altCourseTrackingDto[key] &&
        altCourseTrackingDto[key] != "" &&
        Object.keys(altCourseTracking).includes(key)
      ) {
        if (key === "status") {
          newAltCourseTracking += `${key}: ${altCourseTrackingDto[key]},`;
        } else {
          newAltCourseTracking += `${key}: ${JSON.stringify(
            altCourseTrackingDto[key]
          )}, `;
        }
      }
    });

    const altCourseTrackingData = {
      query: `mutation CreateALTProgressTracking {
            insert_CourseProgressTracking_one(object: {${newAltCourseTracking}}) {
              courseProgressId
              courseId
              userId
              timeSpent
              status
              created_at
              updated_at
              createdBy
              updatedBy
              programId
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
      data: altCourseTrackingData,
    };

    const response = await this.axios(configData);

    if (response?.data?.errors) {
      return new ErrorResponse({
        errorCode: response.data.errors[0].extensions,
        errorMessage: response.data.errors[0].message,
      });
    }

    const result = response.data.data.insert_CourseProgressTracking_one;

    return new SuccessResponse({
      statusCode: 200,
      message: "Ok.",
      data: result,
    });
  }

  public async updateALTCourseTracking(
    request: any,
    updateCourseTrackingDto: UpdateALTCourseTrackingDto
  ) {
    const decoded: any = jwt_decode(request.headers.authorization);
    updateCourseTrackingDto.userId =
      decoded["https://hasura.io/jwt/claims"]["x-hasura-user-id"];

    const updateAltCourseTracking = new UpdateALTCourseTrackingDto(
      updateCourseTrackingDto
    );
    let newUpdateAltCourseTracking = "";
    Object.keys(updateCourseTrackingDto).forEach((key) => {
      if (
        updateCourseTrackingDto[key] &&
        updateCourseTrackingDto[key] != "" &&
        Object.keys(updateAltCourseTracking).includes(key)
      ) {
        if (key === "status") {
          newUpdateAltCourseTracking += `${key}: ${updateCourseTrackingDto[key]},`;
        } else {
          newUpdateAltCourseTracking += `${key}: ${JSON.stringify(
            updateCourseTrackingDto[key]
          )}, `;
        }
      }
    });

    const altCourseUpdateTrackingQuery = {
      query: `mutation updateAltCourseTracking ($userId:uuid! , $courseId:String) {
          update_CourseProgressTracking(where: {courseId: {_eq: $courseId}, userId: {_eq: $userId}}, _set: {${newUpdateAltCourseTracking}}) {
            affected_rows
          }
      }`,
      variables: {
        userId: updateAltCourseTracking.userId,
        courseId: updateAltCourseTracking.courseId,
      },
    };

    const configData = {
      method: "post",
      url: process.env.ALTHASURA,
      headers: {
        Authorization: request.headers.authorization,
        "Content-Type": "application/json",
      },
      data: altCourseUpdateTrackingQuery,
    };

    const response = await this.axios(configData);

    if (response?.data?.errors) {
      return new ErrorResponse({
        errorCode: response.data.errors[0].extensions,
        errorMessage: response.data.errors[0].message,
      });
    }

    const result = response.data.data.update_CourseProgressTracking;

    return new SuccessResponse({
      statusCode: 200,
      message: "Ok.",
      data: result,
    });
  }

  public async searchALTCourseTracking(
    request: any,
    userId: string,
    altCourseTrackingSearch: ALTCourseTrackingSearch
  ) {
    var axios = require("axios");

    const decoded: any = jwt_decode(request.headers.authorization);
    const altUserId =
      decoded["https://hasura.io/jwt/claims"]["x-hasura-user-id"];

    altCourseTrackingSearch.filters.userId = userId;

    let query = "";
    Object.keys(altCourseTrackingSearch.filters).forEach((e) => {
      if (
        altCourseTrackingSearch.filters[e] &&
        altCourseTrackingSearch.filters[e] != ""
      ) {
        if (e === "status") {
          query += `${e}:{_eq: ${altCourseTrackingSearch.filters[e]}},`;
        } else {
          query += `${e}:{_eq:"${altCourseTrackingSearch.filters[e]}"}`;
        }
      }
    });

    var searchData = {
      query: `query SearchALTCourseTracking($limit:Int) {
        CourseProgressTracking(limit: $limit, where: {${query}}) {
          userId
          courseId
          status
          timeSpent
          status
          created_at
          updated_at
          createdBy
          updatedBy
        }
    }`,
      variables: {
        limit: altCourseTrackingSearch.limit,
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

    let result = response.data.data.CourseProgressTracking;
    const altCourseTrackingList = await this.mappedResponse(result);

    return new SuccessResponse({
      statusCode: 200,
      message: "Ok.",
      data: altCourseTrackingList,
    });
  }

  public async addALTCourseTracking(
    request: any,
    altCourseTrackingDto: ALTCourseTrackingDto,
    moduleStatus: string,
    repeatAttempt: boolean
  ) {
    let errorExRec = "";
    let recordList: any = {};
    recordList = await this.getExistingCourseTrackingRecords(
      request,
      altCourseTrackingDto.courseId,
      null
    ).catch(function (error) {
      errorExRec = error;
    });

    if (!recordList?.data) {
      return new ErrorResponse({
        errorCode: "400",
        errorMessage: recordList?.errorMessage,
      });
    }

    const numberOfRecords = parseInt(recordList?.data.length);

    if (numberOfRecords === 0) {
      if (
        altCourseTrackingDto.totalNumberOfModulesCompleted + 1 ===
        altCourseTrackingDto.totalNumberOfModules
      ) {
        altCourseTrackingDto.status = "completed";
      } else if (moduleStatus === "completed") {
        altCourseTrackingDto.status = "ongoing";
      }

      if (moduleStatus === "completed") {
        altCourseTrackingDto.totalNumberOfModulesCompleted =
          altCourseTrackingDto.totalNumberOfModulesCompleted + 1;
      }

      return this.createALTCourseTracking(request, altCourseTrackingDto);
    } else if (
      numberOfRecords === 1 &&
      recordList.data[0].status !== "completed" &&
      !repeatAttempt
    ) {
      if (
        parseInt(recordList.data[0].totalNumberOfModulesCompleted) + 1 ===
        parseInt(recordList.data[0].totalNumberOfModules)
      ) {
        altCourseTrackingDto.status = "completed";
      } else {
        altCourseTrackingDto.status = "ongoing";
      }

      if (moduleStatus === "completed") {
        altCourseTrackingDto.totalNumberOfModulesCompleted =
          parseInt(recordList.data[0].totalNumberOfModulesCompleted) + 1;
      }

      altCourseTrackingDto.timeSpent =
        parseInt(recordList.data[0].timeSpent) + altCourseTrackingDto.timeSpent;

      return await this.updateALTCourseTracking(request, altCourseTrackingDto);
    } else if (numberOfRecords === 1 && repeatAttempt) {
      // for repeat attempts

      if (
        parseInt(recordList.data[0].totalNumberOfModules) ===
        parseInt(recordList.data[0].totalNumberOfModulesCompleted)
      ) {
        altCourseTrackingDto.status = "completed";
      }

      // keep existing module count as it is
      altCourseTrackingDto.totalNumberOfModulesCompleted =
        recordList.data[0].totalNumberOfModulesCompleted;

      altCourseTrackingDto.timeSpent =
        parseInt(recordList.data[0].timeSpent) + altCourseTrackingDto.timeSpent;

      return await this.updateALTCourseTracking(request, altCourseTrackingDto);
    } else if (numberOfRecords > 1) {
      return new ErrorResponse({
        errorCode: "400",
        errorMessage: "Duplicate entry found in DataBase for Course",
      });
    } else if (recordList.data[0].status === "completed") {
      return new SuccessResponse({
        statusCode: 200,
        message: "Course is completed.",
      });
    }
  }

  public async getOngoingCourses(request: any, courseIdList: string[]) {
    var axios = require("axios");

    const decoded: any = jwt_decode(request.headers.authorization);
    const altUserId =
      decoded["https://hasura.io/jwt/claims"]["x-hasura-user-id"];

    const ALTCourseTrackingData = {
      query: `
              query MyQuery($altUserId: uuid!, $altCourseIdList: [String!]) {
                  CourseProgressTracking(where: {courseId: {_in: $altCourseIdList}, userId: {_eq: $altUserId}, status: {_eq: ongoing}}) {
                    userId
                    courseId
                    status
                    totalNumberOfModulesCompleted
                    totalNumberOfModules
                    timeSpent
                    status
                    createdBy
                    updatedBy
                    created_at
                    updated_at
                  }
                }                 
              `,
      variables: {
        altCourseIdList: courseIdList,
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
      data: ALTCourseTrackingData,
    };

    const response = await this.axios(configData);

    if (response?.data?.errors) {
      return new ErrorResponse({
        errorCode: response.data.errors[0].extensions,
        errorMessage: response.data.errors[0].message,
      });
    }

    const result = response.data.data.CourseProgressTracking;

    const data = await this.mappedResponse(result);

    return new SuccessResponse({
      statusCode: 200,
      message: "Ok.",
      data: data,
    });
  }
}
