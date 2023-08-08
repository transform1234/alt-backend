import { Injectable } from "@nestjs/common";
import jwt_decode from "jwt-decode";
import { SuccessResponse } from "src/success-response";
import { ErrorResponse } from "src/error-response";

@Injectable()
export class ALTAssessmentExportService {
  axios = require("axios");

  constructor() {}

  public async getAssessmentRecords(request: any, lessonId: string) {
    // const decoded: any = jwt_decode(request.headers.authorization);
    // const altUserId =
    //   decoded["https://hasura.io/jwt/claims"]["x-hasura-user-id"];

    const altAssessmentRecords = {
      query: `query GetAssessmentData ($lessonId:String) {
          LessonProgressTracking(where: {lessonId: {_eq: $lessonId}, attempts: {_eq: 1}}) {
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
        } }`,
      variables: {
        lessonId: lessonId,
      },
    };

    const configData0 = {
      method: "post",
      url: process.env.ALTHASURA,
      headers: {
        // "Authorization": request.headers.authorization,
        "Content-Type": "application/json",
      },
      data: altAssessmentRecords,
    };

    const configData = {
      method: "post",
      url: process.env.REGISTRYHASURA,
      headers: {
        "x-hasura-admin-secret": process.env.REGISTRYHASURAADMINSECRET,
        "Content-Type": "application/json",
      },
      data: altAssessmentRecords,
    };

    const resAssessmentRecords = await this.axios(configData);

    if (resAssessmentRecords?.data?.errors) {
      console.error(resAssessmentRecords?.data?.errors);
      return new ErrorResponse({
        errorCode: resAssessmentRecords.data.errors[0].extensions,
        errorMessage: resAssessmentRecords.data.errors[0].message,
      });
    }

    const result = resAssessmentRecords.data.data.LessonProgressTracking;

    // console.log(result.length);
    // console.log(result[0]);
    const scoreDetails = JSON.parse(result[0].scoreDetails); // first result score details
    const assessmentSection = scoreDetails.length;
    // console.log(assessmentSection, "sec"); // no of sections

    const questionsArray = ["User's Name", "User's Score"]; // header

    scoreDetails.forEach((detail) => {
      // iterating on each section
      detail.data.forEach((data) => {
        // iterating each question in section
        questionsArray.push(data.item.title);
      });
    });

    // console.log(questionsArray);

    // users data

    const exportData: [] = result
      .map((user) => {
        // const record = [];
        const scoreDetail = JSON.parse(user.scoreDetails);
        if (scoreDetail.length === assessmentSection) {
          // console.log(user.lessonId, user.userId);
          const record = [user.User.name, user.score];
          // console.log(scoreDetail, "l");
          scoreDetail.forEach((detail) => {
            detail.data.forEach((data) => {
              record.push(data.pass);
            });
          });
          return record;
        }
      })
      .filter((notUndefined) => notUndefined !== undefined);

    // console.log(exportData);

    return new SuccessResponse({
      statusCode: 200,
      message: "Ok.",
      data: { exportedRecords: exportData?.length },
    });
  }
}
