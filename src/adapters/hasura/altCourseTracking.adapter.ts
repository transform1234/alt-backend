import { Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { SuccessResponse } from "src/success-response";
import { ALTCourseTrackingDto } from "src/altCourseTracking/dto/altCourseTracking.dto";
import { UpdateALTCourseTrackingDto } from "src/altCourseTracking/dto/updatealtCourseTracking.dto";
import { ALTCourseTrackingSearch } from "src/altCourseTracking/dto/searchaltCourseTracking.dto";
import { ErrorResponse } from "src/error-response";

@Injectable()
export class ALTCourseTrackingService {
  axios = require("axios");

  constructor(private httpService: HttpService) {}

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
        calculatedScore: item?.calculatedScore ? `${item.calculatedScore}` : 0,
        status: item?.status ? `${item.status}` : "",
        createdBy: item?.createdBy ? `${item.createdBy}` : "",
        updatedBy: item?.updatedBy ? `${item.updatedBy}` : "",
        created_at: item?.created_at ? `${item.created_at}` : "",
        updated_at: item?.updated_at ? `${item.updated_at}` : "",
      };
      return new ALTCourseTrackingDto(altCourseMapping);
    });

    return altCourseTrackingResponse;
  }

  public async getExistingCourseTrackingRecords(
    altCourseId: string,
    altUserId: string
  ) {
    const ALTCourseTrackingData = {
      query: `
            query MyQuery($altUserId: uuid!, $altCourseId: String) {
                CourseProgressTracking(where: {courseId: {_eq: $altCourseId}, userId: {_eq: $altUserId}}) {
                  courseId
                  userId
                  totalNumberOfModulesCompleted
                  totalNumberOfModules
                  calculatedScore
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
        "x-hasura-admin-secret": process.env.REGISTRYHASURAADMINSECRET,
        "Content-Type": "application/json",
      },
      data: ALTCourseTrackingData,
    };

    const response = await this.axios(configData);

    const result = response.data.data.CourseProgressTracking;

    const data = await this.mappedResponse(result);

    if (response?.data?.errors) {
      return new ErrorResponse({
        errorCode: response.data.errors[0].extensions,
        errorMessage: response.data.errors[0].message,
      });
    }

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
              calculatedScore
              status
              created_at
              updated_at
              createdBy
              updatedBy
          }
        }`,
      variables: {},
    };

    const configData = {
      method: "post",
      url: process.env.ALTHASURA,
      headers: {
        //"x-hasura-admin-secret": process.env.REGISTRYHASURAADMINSECRET,
        "Authorization": request.headers.authorization,
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
    userId: string,
    courseId: string,
    updateCourseTrackingDto: UpdateALTCourseTrackingDto
  ) {
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

    const altCourseUpdateTrackingData = {
      query: `mutation updateAltCourseTracking ($userId:uuid! , $courseId:String) {
          update_CourseProgressTracking(where: {courseId: {_eq: $courseId}, userId: {_eq: $userId}}, _set: {${newUpdateAltCourseTracking}}) {
            affected_rows
          }
      }`,
      variables: {
        userId: userId,
        courseId: courseId,
      },
    };

    const configData = {
      method: "post",
      url: process.env.ALTHASURA,
      headers: {
        "x-hasura-admin-secret": process.env.REGISTRYHASURAADMINSECRET,
        "Content-Type": "application/json",
      },
      data: altCourseUpdateTrackingData,
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
    altCourseTrackingSearch: ALTCourseTrackingSearch
  ) {
    var axios = require("axios");

    let query = "";
    Object.keys(altCourseTrackingSearch.filters).forEach((e) => {
      if (
        altCourseTrackingSearch.filters[e] &&
        altCourseTrackingSearch.filters[e] != ""
      ) {
        query += `${e}:{_eq:"${altCourseTrackingSearch.filters[e]}"}`;
      }
    });

    var searchData = {
      query: `query SearchALTCourseTracking($limit:Int) {
        CourseProgressTracking(limit: $limit, where: {${query}}) {
          userId
          courseId
          status
          calculatedScore
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
        "x-hasura-admin-secret": process.env.REGISTRYHASURAADMINSECRET,
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
    moduleStatus: string
  ) {
    let errorExRec = "";
    let recordList: any = {};
    recordList = await this.getExistingCourseTrackingRecords(
      altCourseTrackingDto.courseId,
      altCourseTrackingDto.userId
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
        altCourseTrackingDto.totalNumberOfModulesCompleted =
          altCourseTrackingDto.totalNumberOfModulesCompleted + 1;
        altCourseTrackingDto.status = "ongoing";
      }
      return this.createALTCourseTracking(request, altCourseTrackingDto);
    } else if (
      numberOfRecords === 1 &&
      recordList.data[0].status !== "completed"
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

      return await this.updateALTCourseTracking(
        altCourseTrackingDto.userId,
        altCourseTrackingDto.courseId,
        altCourseTrackingDto
      );
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
}
