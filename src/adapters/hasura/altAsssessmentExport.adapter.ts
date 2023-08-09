import { Injectable } from "@nestjs/common";
import jwt_decode from "jwt-decode";
import { SuccessResponse } from "src/success-response";
import { ErrorResponse } from "src/error-response";
import { DikshaCourseService } from "../diksha/dikshaCourse.adapter";

@Injectable()
export class ALTAssessmentExportService {
  axios = require("axios");

  constructor(private dikshaCourseService: DikshaCourseService) {}

  public async getAssessmentRecords(request: any, lessonId: string) {
    // const decoded: any = jwt_decode(request.headers.authorization);
    // const altUserId =
    //   decoded["https://hasura.io/jwt/claims"]["x-hasura-user-id"];

    const altAssessmentRecords = {
      query: `query GetAssessmentData ($lessonId:String) {
          LessonProgressTracking(where: {lessonId: {_eq: $lessonId}, attempts: {_eq: 1}, User: {School: {schoolId: {_eq: "5ead2b80-13a9-41fc-a950-76746d21fdbf"}}}}) {
            userId
            score
            moduleId
            lessonId
            scoreDetails
            status
            attempts
            User {
              userId
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

    const questionsArray = [
      { id: "uid", title: "User's Id" },
      { id: "uname", title: "User's Name" },
      { id: "score", title: "User's Score" },
    ]; // header

    const assessmentDetail: any =
      await this.dikshaCourseService.getCourseHierarchy(lessonId, "assessment");

    if (assessmentDetail.statusCode !== 200) {
      return new ErrorResponse({
        errorCode: "404",
        errorMessage: "Assessment Not found",
      });
    }

    // no of sections
    const assessmentSections = assessmentDetail.data?.children?.length;

    console.log(assessmentSections);

    assessmentDetail.data?.children.forEach((detail) => {
      // iterating on each section
      detail.children.forEach(({ identifier, name }) => {
        // iterating each question in section
        questionsArray.push({ id: identifier, title: name });
      });
    });

    console.log(questionsArray);

    // users data

    const exportData: [] = result
      .map((user) => {
        const scoreDetail = JSON.parse(user.scoreDetails);
        if (scoreDetail.length === assessmentSections) {
          const record = {
            uid: user.User.userId,
            uname: user.User.name,
            score: user.score,
          };
          scoreDetail.forEach((detail) => {
            detail.data.forEach((data) => {
              record[data.item.id] = data.pass;
            });
          });
          if ("d499bcee-6119-478b-8356-0768074bafdf" === user.User.userId)
            console.log(record);
          return record;
        }
      })
      .filter((notUndefined) => notUndefined !== undefined);

    // console.log(exportData);

    const createCsvWriter = require("csv-writer").createObjectCsvWriter;
    const csvWriter = createCsvWriter({
      path: `./exports/${lessonId}.csv`,
      header: questionsArray,
    });

    csvWriter
      .writeRecords(exportData) // returns a promise
      .then(() => {
        console.log("...Done");
      });

    return new SuccessResponse({
      statusCode: 200,
      message: "Ok.",
      data: { exportedRecords: exportData?.length },
    });
  }
}
