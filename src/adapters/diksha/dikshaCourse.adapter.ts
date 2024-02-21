import { Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { SuccessResponse } from "src/success-response";
import { QuestionsetlistResponse } from "src/questionsetlist-response";
import { IServicelocator } from "../courseservicelocator";
import { questionsetSearchDto } from "src/course/dto/questionset.response.dto";
import { questionSearchDto } from "src/course/dto/question.response.dto";
import { lastValueFrom } from "rxjs";

export const DikshaCourseToken = "DikshaCourse";
@Injectable()
export class DikshaCourseService implements IServicelocator {
  constructor(private httpService: HttpService) {}
  currentUrl = process.env.SUNBIRDURL;
  public async getAllCourse(
    channel: [string],
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
          channel: channel,
          subject: [subject],
          audience: [audience],
          // contentType: ["Course"],
          // primaryCategory: ["Course"],
          // "batches.enrollmentType": "open",
          // "batches.status": 1,
          primaryCategory: [
            "Collection",
            "Resource",
            "Content Playlist",
            "Course",
            "Course Assessment",
            "Digital Textbook",
            "eTextbook",
            "Explanation Content",
            "Learning Resource",
            "Lesson Plan Unit",
            "Practice Question Set",
            "Teacher Resource",
            "Textbook Unit",
            "LessonPlan",
            "FocusSpot",
            "Learning Outcome Definition",
            "Curiosity Questions",
            "MarkingSchemeRubric",
            "ExplanationResource",
            "ExperientialResource",
            "Practice Resource",
            "TVLesson",
            "Course Unit"
        ],
        visibility: [
          "Default",
          "Parent"
      ],
          status: ["Live"],
          se_gradeLevels: [className],
          se_mediums: [medium],
        },
        limit: Number(limit),
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
        "/api/content/v1/search?orgdetails=orgName,email&licenseDetails=name,description,url",//&framework=ekstep_ncert_k-12",
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
      url:
        this.currentUrl +
        `/api/content/v1/read/${value}?fields=transcripts,ageGroup,appIcon,artifactUrl,attributions,attributions,audience,author,badgeAssertions,board,body,channel,code,concepts,contentCredits,contentType,contributors,copyright,copyrightYear,createdBy,createdOn,creator,creators,description,displayScore,domain,editorState,flagReasons,flaggedBy,flags,framework,gradeLevel,identifier,itemSetPreviewUrl,keywords,language,languageCode,lastUpdatedOn,license,mediaType,medium,mimeType,name,originData,osId,owner,pkgVersion,publisher,questions,resourceType,scoreDisplayConfig,status,streamingUrl,subject,template,templateId,totalQuestions,totalScore,versionKey,visibility,year,primaryCategory,additionalCategories,interceptionPoints,interceptionType&licenseDetails=name,description,url`,
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

  public async getQuestionset(request: any) {
    var axios = require("axios");
    let topics = Array;
    let newQuestions = {};
    // const identifier = request.search.identifier;
    var config = {
      method: "post",
      url: this.currentUrl + "/api/question/v1/list",
      headers: {
        "Content-Type": "application/json",
      },
      data: request,
    };

    const responseData = await axios(config);
    const data = responseData.data;
    const result = data.result.questions;
    const qu = result.map((e: any) => {
      return new questionSearchDto(e);
    });

    const question = { questions: qu, count: data.result.count };
    const questions = new questionsetSearchDto(question);
    
    return new QuestionsetlistResponse({
      id: data.id,
      ver: data.ver,
      ts: data.ts,
      params: data.params,
      responseCode: data.responseCode,
      result: questions
    });
  }

  public async getQuestionsetContent(value: any) {
    var axios = require("axios");

    let config = {
      method: "get",
      url:
        this.currentUrl +
        `/api/questionset/v1/read/${value}?fields=instructions`,
    };

    const response = await axios(config);
    const data = response?.data;

    const final = data.result.questionset;

    return new SuccessResponse({
      statusCode: 200,
      message: "ok",
      data: final,
    });
  }
}
