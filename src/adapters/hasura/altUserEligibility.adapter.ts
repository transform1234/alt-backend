import { Injectable } from "@nestjs/common";
import jwt_decode from "jwt-decode";
import { SuccessResponse } from "src/success-response";
import { ErrorResponse } from "src/error-response";
import { ProgramService } from "./altProgram.adapter";
import { ALTProgramAssociationService } from "../../adapters/hasura/altProgramAssociation.adapter";
import { TermsProgramtoRulesDto } from "src/altProgramAssociation/dto/altTermsProgramtoRules.dto";
import { ALTLessonTrackingService } from "./altLessonTracking.adapter";
import { ALTModuleTrackingService } from "./altModuleTracking.adapter";
import { ALTCourseTrackingService } from "./altCourseTracking.adapter";

@Injectable()
export class ALTUserCourseEligibilityService {
  axios = require("axios");

  constructor(
    private programService: ProgramService,
    private altProgramAssociationService: ALTProgramAssociationService,
    private altLessonTrackingService: ALTLessonTrackingService,
    private altModuleTrackingService: ALTModuleTrackingService,
    private altCourseTrackingService: ALTCourseTrackingService
  ) {}

  public async checkEligibility(
    request: any,
    programId: string,
    courseId: string,
    subject: string
  ) {
    const decoded: any = jwt_decode(request.headers.authorization);
    const altUserId =
      decoded["https://hasura.io/jwt/claims"]["x-hasura-user-id"];

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

    const programRules = JSON.parse(progTermData.data[0].rules);

    const baselineAssessmentId = programRules.prog[0].contentId;
    const totalAssessmentScore = programRules.prog[0].totalScore;

    let baselineAssessmentRecord: any;
    baselineAssessmentRecord =
      await this.altLessonTrackingService.getALTLessonTracking(
        request,
        baselineAssessmentId
      );

    if (!baselineAssessmentRecord?.data?.length) {
      return new SuccessResponse({
        statusCode: 200,
        message: "Ok.",
        data: {
          msg: "Data for Baseline Assessment not found. Please attempt Baseline Assessment.",
        },
      });
    } else if (baselineAssessmentRecord?.data?.length === 1) {
      let scorePercentage;
      if (baselineAssessmentRecord.data[0].status === "completed") {
        scorePercentage = Math.floor(
          (baselineAssessmentRecord.data[0].score / totalAssessmentScore) * 100
        );
      }
      let courseFound = false;
      let baselineCriteriaFulfilled = false;
      if (altUserId) {
        for (const course of programRules?.prog) {
          const courseDate = new Date(course.startDate);
          const currentDate = new Date();
          if (
            course.contentId === courseId &&
            courseDate.getTime() <= currentDate.getTime()
          ) {
            courseFound = true;

            if (course.criteria["0"]?.contentId === baselineAssessmentId) {
              if (
                scorePercentage >= Number(course.criteria["0"].minScorePerc) &&
                scorePercentage <= Number(course.criteria["0"].maxScorePerc)
              ) {
                baselineCriteriaFulfilled = true;

                return new SuccessResponse({
                  statusCode: 200,
                  message: "Ok.",
                  data: {
                    msg: "Course " + courseId + " unlocked",
                    status: true,
                  },
                });
              }
            }
            if (course.criteria["1"].contentId && !baselineCriteriaFulfilled) {
              let recordList: any = {};
              recordList =
                await this.altCourseTrackingService.getExistingCourseTrackingRecords(
                  request,
                  course.criteria["1"].contentId
                );

              if (recordList.data[0]?.status === "completed") {
                return new SuccessResponse({
                  statusCode: 200,
                  message: "Ok.",
                  data: {
                    previousCourse: course.criteria["1"].contentId,
                    previousCourseCompleted: true,
                    msg: "Course " + courseId + " unlocked",
                    status: true,
                  },
                });
              } else {
                return new SuccessResponse({
                  statusCode: 200,
                  message: "Ok.",
                  data: {
                    previousCourse: course.criteria["1"].contentId,
                    previousCourseCompleted: false,
                    msg:
                      "Course " +
                      courseId +
                      " locked. Please complete previous course first",
                    status: false,
                  },
                });
              }
            } else {
              return new ErrorResponse({
                errorCode: "400",
                errorMessage:
                  "Criteria for previous course completion not found in rules",
              });
            }
          }
        }

        if (!courseFound) {
          return new SuccessResponse({
            statusCode: 200,
            message: "Ok.",
            data: {
              msg:
                "Course " +
                courseId +
                " is not available at the moment. Please try again later!",
              status: false,
            },
          });
        }
      }
    } else {
      return new ErrorResponse({
        errorCode: "400",
        errorMessage:
          "Duplicate entry found in DataBase for Baseline Assessment",
      });
    }
  }
}
