import { Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { SuccessResponse } from "src/success-response";
import { IServicelocator } from "../courseservicelocator";

export const DikshaCourseToken = "DikshaCourse";
@Injectable()
export class DikshaCourseService implements IServicelocator {
  constructor(private httpService: HttpService) {}
  currentUrl = process.env.SUNBIRDURL;
  public async getAllCourse(
    subject: [string],
    audience: [string],
    className: [string],
    medium: [string],
    limit: string,
    request: any
  ) {
    var axios = require("axios");
    var data = {
      request: {
        filters: {
          subject: [subject],
          audience: [audience],
          contentType: ["Course"],
          primaryCategory: ["Course"],
          "batches.enrollmentType": "open",
          "batches.status": 1,
          status: ["Live"],
          se_gradeLevels: [className],
          se_mediums: [medium],
        },
        limit: limit,
        fields: [
          "name",
          "appIcon",
          "mimeType",
          "gradeLevel",
          "identifier",
          "medium",
          "pkgVersion",
          "board",
          "subject",
          "resourceType",
          "contentType",
          "channel",
          "organisation",
          "trackable",
          "se_boards",
          "se_subjects",
          "se_mediums",
          "se_gradeLevels",
        ],
        facets: ["se_subjects"],
      },
    };

    var config = {
      method: "post",
      url:
        this.currentUrl +
        "/api/content/v1/search?orgdetails=orgName,email&framework=ekstep_ncert_k-12",
      data: data,
    };

    const response = await axios(config);

    const responseData = response.data.result.content;
    return new SuccessResponse({
      statusCode: 200,
      message: "ok",
      data: responseData,
    });
  }

  public async getCourseContent(value: any) {
    var axios = require("axios");

    let config = {
      method: "get",
      url: this.currentUrl + `/api/content/v1/read/${value}`,
    };

    const response = await axios(config);
    const data = response?.data;

    const final = data.result.content;

    return final;
  }

  public async getCoursesByIds(courseIds: [string], request: any) {
    let courseArray = [];
    for (let value of courseIds) {
      let courseData = this.getCourseContent(value);
      courseArray.push(await courseData);
    }
    return new SuccessResponse({
      statusCode: 200,
      message: "ok",
      data: courseArray,
    });
  }

  public async getCourseDetail(courseId: string, request: any) {
    let value = courseId;
    let courseData = await this.getCourseContent(value);
    return new SuccessResponse({
      statusCode: 200,
      message: "ok",
      data: courseData,
    });
  }

  public async getCourseHierarchy(value: any, type: any) {
    var axios = require("axios");
    if (type == "assessment") {
      let config = {
        method: "get",
        url:
          this.currentUrl +
          `/learner/questionset/v1/hierarchy/${value}?orgdetails=orgName,email&licenseDetails=name,description,url`,
      };
      const response = await axios(config);
      const data = response?.data.result.questionSet;
      return new SuccessResponse({
        statusCode: 200,
        message: "ok",
        data: data,
      });
    } else {
      let config = {
        method: "get",
        url:
          this.currentUrl +
          `/api/course/v1/hierarchy/${value}?orgdetails=orgName,email&licenseDetails=name,description,url`,
      };

      const response = await axios(config);
      const data = response?.data.result.content;
      return new SuccessResponse({
        statusCode: 200,
        message: "ok",
        data: data,
      });
    }
  }

  public async getQuestionset(questions: [string]) {
    var axios = require("axios");
    let topics = Array;
    var data = {
      request: {
        search: {
          identifier: [questions],
        },
      },
    };

    var config = {
      method: "post",
      url: this.currentUrl + "/api/question/v1/list",
      headers: {
        "Content-Type": "application/json",
      },
      data: data,
    };

    const responseData = await axios(config);

    return new SuccessResponse({
      statusCode: 200,
      message: "ok",
      data: responseData,
    });
  }
}
