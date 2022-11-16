import { Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { SuccessResponse } from "src/success-response";
import { ErrorResponse } from "src/error-response";
import { ProgramService } from "./altProgram.adapter";
import { ALTProgramAssociationService } from "../../adapters/hasura/altProgramAssociation.adapter";
import { ALTModuleTrackingDto } from "src/altModuleTracking/dto/altModuleTracking.dto";
import { TermsProgramtoRulesDto } from "src/altProgramAssociation/dto/altTermsProgramtoRules.dto";
import { UpdateALTModuleTrackingDto } from "src/altModuleTracking/dto/updateAltModuleTracking.dto";
import { ALTModuleTrackingSearch } from "src/altModuleTracking/dto/searchAltModuleTracking.dto";

@Injectable()
export class ALTModuleTrackingService {
  axios = require("axios");

  constructor(
    private httpService: HttpService,
    private programService: ProgramService,
    private altProgramAssociationService: ALTProgramAssociationService
  ) {}

  public async mappedResponse(data: any) {
    const altModuleTrackingResponse = data.map((item: any) => {
      const altModuleMapping = {
        userId: item?.userId ? `${item.userId}` : "",
        courseId: item?.courseId ? `${item.courseId}` : "",
        moduleId: item?.moduleId ? `${item.moduleId}` : "",
        calculatedScore: item?.calculatedScore ? `${item.calculatedScore}` : 0,
        status: item?.status ? `${item.status}` : "",
        totalNumberOfLessonsCompleted: item?.totalNumberOfLessonsCompleted
          ? `${item.totalNumberOfLessonsCompleted}`
          : 0,
        totalNumberOfLessons: item?.totalNumberOfLessons
          ? `${item.totalNumberOfLessons}`
          : 0,
        createdBy: item?.createdBy ? `${item.createdBy}` : "",
        updatedBy: item?.updatedBy ? `${item.updatedBy}` : "",
        created_at: item?.created_at ? `${item.created_at}` : "",
        updated_at: item?.updated_at ? `${item.updated_at}` : "",
      };

      return new ALTModuleTrackingDto(altModuleMapping);
    });
    return altModuleTrackingResponse;
  }

  public async getExistingModuleTrackingRecords(
    userId: string,
    moduleId: string,
    courseId: string
  ) {
    const altModuleTrackingRecord = {
      query: `query GetModuleTrackingData ($userId:uuid!, $moduleId:String, $courseId:String) {
          ModuleProgressTracking(where: {userId: {_eq: $userId}, moduleId: {_eq: $moduleId}, courseId: {_eq: $courseId}}) {
            userId
            moduleId
            courseId
            status
            calculatedScore
            totalNumberOfLessonsCompleted
            totalNumberOfLessons
            created_at
            updated_at
            createdBy
            updatedBy
        } }`,
      variables: {
        userId: userId,
        moduleId: moduleId,
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
      data: altModuleTrackingRecord,
    };

    const resModuleTracking = await this.axios(configData);

    if (resModuleTracking?.data?.errors) {
      return new ErrorResponse({
        errorCode: resModuleTracking.data.errors[0].extensions,
        errorMessage: resModuleTracking.data.errors[0].message,
      });
    }

    const data = resModuleTracking.data.data.ModuleProgressTracking;

    return new SuccessResponse({
      statusCode: 200,
      message: "Ok.",
      data: data,
    });
  }

  public async getALTModuleTracking(altModuleId: string, altUserId: string) {
    const ALTModuleTrackingData = {
      query: `
            query GetModuleTracking($altUserId: uuid!, $altModuleId: String) {
                ModuleProgressTracking(where: {moduleId: {_eq: $altmoduleId}, userId: {_eq: $altUserId}}) {
                  courseId
                  moduleId
                  userId
                  status
                  calculatedScore
                  totalNumberOfLessonsCompleted
                  totalNumberOfLessons
                  created_at
                  updated_at
                  createdBy
                  updatedBy
                }
              }                 
            `,
      variables: {
        altModuleId: altModuleId,
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
      data: ALTModuleTrackingData,
    };

    const response = await this.axios(configData);

    if (response?.data?.errors) {
      return new ErrorResponse({
        errorCode: response.data.errors[0].extensions,
        errorMessage: response.data.errors[0].message,
      });
    }

    const result = response.data.data.ModuleProgressTracking;

    const data = await this.mappedResponse(result);

    return new SuccessResponse({
      statusCode: 200,
      message: "Ok.",
      data: data,
    });
  }

  public async checkAndAddALTModuleTracking(
    request: any,
    programId: string,
    subject: string,
    altModuleTrackingDto: ALTModuleTrackingDto
  ) {
    let errorExRec = "";
    let recordList: any = {};
    recordList = await this.getExistingModuleTrackingRecords(
      altModuleTrackingDto.userId,
      altModuleTrackingDto.moduleId,
      altModuleTrackingDto.courseId
    ).catch(function (error) {
      errorExRec = error;
    });

    if (!recordList?.data) {
      return new ErrorResponse({
        errorCode: "400",
        errorMessage: recordList?.errorMessage,
      });
    }

    let currentProgramDetails: any = {};
    currentProgramDetails = await this.programService.getProgramDetailsById(
      programId
    );

    const paramData = new TermsProgramtoRulesDto(currentProgramDetails.data);

    let progTermData: any = {};
    progTermData = await this.altProgramAssociationService.getRules({
      programId: programId,
      framework: paramData[0].framework,
      board: paramData[0].board,
      medium: paramData[0].medium,
      grade: paramData[0].grade,
      subject: subject,
    });

    const programRules = JSON.parse(progTermData.data[0].rules);

    let flag = false;

    if (altModuleTrackingDto.userId) {
      for (const course of programRules?.prog) {
        if (course.contentId == altModuleTrackingDto.courseId) {
          flag = true;
          const numberOfRecords = parseInt(recordList?.data.length);

          if (numberOfRecords === 0) {
            altModuleTrackingDto.status = "Ongoing";
            return await this.createALTModuleTracking(altModuleTrackingDto);
          } else if (
            numberOfRecords === 1 &&
            recordList.data[0].status !== "Completed"
          ) {
            return await this.updateALTModuleTracking(
              altModuleTrackingDto.userId,
              altModuleTrackingDto.moduleId,
              altModuleTrackingDto.courseId,
              altModuleTrackingDto
            );
          } else if (
            numberOfRecords === 1 &&
            recordList.data[0].status === "Completed"
          ) {
            console.log("recal scorehere");
          } else {
            return new ErrorResponse({
              errorCode: "403",
              errorMessage:
                "Duplicate entry found in DataBase for Course Module",
            });
          }
        }
      }
    }
  }

  public async createALTModuleTracking(
    altModuleTrackingDto: ALTModuleTrackingDto
  ) {
    const altModuleTracking = new ALTModuleTrackingDto(altModuleTrackingDto);
    let newAltModuleTracking = "";
    Object.keys(altModuleTrackingDto).forEach((key) => {
      if (
        altModuleTrackingDto[key] &&
        altModuleTrackingDto[key] != "" &&
        Object.keys(altModuleTracking).includes(key)
      ) {
        if (key === "status") {
          newAltModuleTracking += `${key}: ${altModuleTrackingDto[key]},`;
        } else {
          newAltModuleTracking += `${key}: ${JSON.stringify(
            altModuleTrackingDto[key]
          )},`;
        }
      }
    });

    const altLessonTrackingData = {
      query: `mutation CreateALTLessonTracking {
            insert_ModuleProgressTracking_one(object: {${newAltModuleTracking}}) {
                status
                userId
                courseId
                moduleId
                moduleProgressId
                calculatedScore
                totalNumberOfLessonsCompleted
                totalNumberOfLessons
                createdBy
                created_at                
          }
        }`,
      variables: {},
    };

    const configDataforCreate = {
      method: "post",
      url: process.env.ALTHASURA,
      headers: {
        "x-hasura-admin-secret": process.env.REGISTRYHASURAADMINSECRET,
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

    const result = response.data.data.insert_ModuleProgressTracking_one;

    return new SuccessResponse({
      statusCode: 200,
      message: "Ok.",
      data: result,
    });
  }

  public async updateALTModuleTracking(
    userId: string,
    moduleId: string,
    courseId: string,
    updateAltModuleTrackDto: UpdateALTModuleTrackingDto
  ) {
    const updateAltModuleTracking = new UpdateALTModuleTrackingDto(
      updateAltModuleTrackDto
    );
    let newUpdateAltModuleTracking = "";
    Object.keys(updateAltModuleTrackDto).forEach((key) => {
      if (
        updateAltModuleTrackDto[key] &&
        updateAltModuleTrackDto[key] != "" &&
        Object.keys(updateAltModuleTracking).includes(key)
      ) {
        if (key === "status") {
          newUpdateAltModuleTracking += `${key}: ${updateAltModuleTrackDto[key]},`;
        } else {
          newUpdateAltModuleTracking += `${key}: ${JSON.stringify(
            updateAltModuleTrackDto[key]
          )},`;
        }
      }
    });

    let altModuleUpdateTrackingData = {};

    altModuleUpdateTrackingData = {
      query: `mutation updateAltModuleTracking ($userId:uuid!, $moduleId:String, $courseId:String) {
              update_ModuleProgressTracking(where: {courseId: {_eq: $courseId}, userId: {_eq: $userId} ,moduleId: {_eq: $moduleId}}, _set: {${newUpdateAltModuleTracking}}) {
              affected_rows
            }
        }`,
      variables: {
        userId: userId,
        moduleId: moduleId,
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
      data: altModuleUpdateTrackingData,
    };

    const response = await this.axios(configData);

    if (response?.data?.errors) {
      return new ErrorResponse({
        errorCode: response.data.errors[0].extensions,
        errorMessage: response.data.errors[0].message,
      });
    }

    const result = response.data.data.update_ModuleProgressTracking;

    return new SuccessResponse({
      statusCode: 200,
      message: "Ok.",
      data: result,
    });
  }

  public async searchALTModuleTracking(
    request: any,
    altModuleTrackingSearch: ALTModuleTrackingSearch
  ) {
    var axios = require("axios");

    let query = "";
    Object.keys(altModuleTrackingSearch.filters).forEach((e) => {
      if (
        altModuleTrackingSearch.filters[e] &&
        altModuleTrackingSearch.filters[e] != ""
      ) {
        query += `${e}:{_eq:"${altModuleTrackingSearch.filters[e]}"}`;
      }
    });

    var searchData = {
      query: `query SearchALTModuleTracking($limit:Int) {
        ModuleProgressTracking(limit: $limit, where: {${query}}) {
          userId
          courseId
          moduleId
          status
          calculatedScore
          totalNumberOfLessonsCompleted
          totalNumberOfLessons
          created_at
          updated_at
          createdBy
          updatedBy
        }
    }`,
      variables: {
        limit: altModuleTrackingSearch.limit,
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

    let result = response.data.data.ModuleProgressTracking;
    const altModuleTrackingList = await this.mappedResponse(result);

    return new SuccessResponse({
      statusCode: 200,
      message: "Ok.",
      data: altModuleTrackingList,
    });
  }
}
