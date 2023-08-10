import { Injectable } from "@nestjs/common";
import jwt_decode from "jwt-decode";
import { SuccessResponse } from "src/success-response";
import { ErrorResponse } from "src/error-response";
import { DikshaCourseService } from "../diksha/dikshaCourse.adapter";

@Injectable()
export class ALTTimeSpentExportService {
  axios = require("axios");

  constructor(private dikshaCourseService: DikshaCourseService) {}

  errIds = [];

  public async getTimeSpentOnCourseRecords(
    request: any,
    courseId: string,
    userId: string
  ) {
    const getTimeSpent = (result) => {
      try {
        if (result.length) {
          console.log(result);
          const userName = result[0]?.User.name;
          const totalDuration = result?.reduce(
            (totalTime, { scoreDetails, User, userId }) => {
              const scoreDetail = JSON.parse(scoreDetails);
              console.log(
                scoreDetail?.duration ? totalTime + scoreDetail.duration : 0
              );
              return scoreDetail?.duration
                ? totalTime + scoreDetail.duration
                : totalTime;
            },
            0
          );

          const returnData = {
            userId,
            userName,
            duration: totalDuration / 60000,
          };

          console.log(returnData);

          return returnData;
        }
      } catch (e) {
        console.log(e);
      }
    };

    const getUserLessonsData = async (userId: string) => {
      console.log(userId);
      const userLessonsDataReq = {
        query: `query GetUserLessonsData ($userId:uuid!,$courseId:String) {     
                    LessonProgressTracking(where: {userId: {_eq: $userId}, attempts: {_eq: 1}, courseId: {_eq: $courseId}}) {
                      userId
                      score
                      moduleId
                      lessonId
                      scoreDetails
                      status
                      attempts
                      User {
                        name
                      }
                  }
              }`,
        variables: {
          userId: userId,
          courseId: courseId,
        },
      };

      const configData = {
        method: "post",
        url: process.env.REGISTRYHASURA,
        headers: {
          "x-hasura-admin-secret": process.env.REGISTRYHASURAADMINSECRET,
          "Content-Type": "application/json",
        },
        data: userLessonsDataReq,
      };

      const resUserLessons = await this.axios(configData);

      if (resUserLessons?.data?.errors) {
        console.log(userLessonsDataReq);
        console.error(resUserLessons?.data?.errors, "ok");
        console.log(resUserLessons.data.errors[0].extensions, userId);
        this.errIds.push(userId);
        return new ErrorResponse({
          errorCode: resUserLessons.data.errors[0].extensions,
          errorMessage: resUserLessons.data.errors[0].message,
        });
      }

      const result = resUserLessons.data.data.LessonProgressTracking;

      const data = getTimeSpent(result);

      return new SuccessResponse({
        statusCode: 200,
        message: "Ok.",
        data: data,
      });
    };

    return getUserLessonsData(userId);
  }

  public async getUserListForSchool(
    request: any,
    fileName: string,
    schoolId: string
  ) {
    console.log(schoolId);
    const userListReq = {
      query: `query GetUsersFromSchool ($schoolId:uuid!) {     
        Users(where: {School: {schoolId: {_eq: $schoolId}}}) {
            userId
            username
          }
    }`,
      variables: {
        schoolId: schoolId,
      },
    };

    const configData = {
      method: "post",
      url: process.env.REGISTRYHASURA,
      headers: {
        "x-hasura-admin-secret": process.env.REGISTRYHASURAADMINSECRET,
        "Content-Type": "application/json",
      },
      data: userListReq,
    };

    const resUserList = await this.axios(configData);

    if (resUserList?.data?.errors) {
      console.error(resUserList?.data?.errors);
      return new ErrorResponse({
        errorCode: resUserList.data.errors[0].extensions,
        errorMessage: resUserList.data.errors[0].message,
      });
    }

    const resUsers = resUserList.data.data.Users;

    const userIds = resUsers.map(({ userId }) => [userId]);

    console.log(userIds);

    const createCsvWriter = require("csv-writer").createArrayCsvWriter;
    const csvWriter = createCsvWriter({
      path: `./exports/${fileName}.csv`,
      header: ["userid"],
    });

    csvWriter
      .writeRecords(userIds) // returns a promise
      .then(() => {
        console.log("...Done");
      });

    return new SuccessResponse({
      statusCode: 200,
      message: "Ok.",
      data: { exportedRecords: resUsers?.length },
    });
  }
}
