import { Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { SuccessResponse } from "src/success-response";
import { QuestionsetlistResponse } from "src/questionsetlist-response";
import { IServicelocator } from "../courseservicelocator";
import { questionsetSearchDto } from "src/course/dto/questionset.response.dto";
import { questionSearchDto } from "src/course/dto/question.response.dto";
import { lastValueFrom } from "rxjs";

export const SunbirdCourseToken = "SunbirdCourse";
@Injectable()
export class SunbirdCourseService implements IServicelocator {
  constructor(private httpService: HttpService) {}
  currentUrl = process.env.SUNBIRDURL;
  updatedUrl = process.env.SUNBIRDUPDATEDURL;
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

    // Use SUNBIRDUPDATEDURL for content read if available, otherwise use currentUrl
    let contentUrl;
    if (this.updatedUrl) {
      contentUrl = `${this.updatedUrl}/action/content/v3/read/${value}`;
    } else {
      contentUrl = `${this.currentUrl}/api/content/v1/read/${value}?fields=transcripts,ageGroup,appIcon,artifactUrl,attributions,attributions,audience,author,badgeAssertions,board,body,channel,code,concepts,contentCredits,contentType,contributors,copyright,copyrightYear,createdBy,createdOn,creator,creators,description,displayScore,domain,editorState,flagReasons,flaggedBy,flags,framework,gradeLevel,identifier,itemSetPreviewUrl,keywords,language,languageCode,lastUpdatedOn,license,mediaType,medium,mimeType,name,originData,osId,owner,pkgVersion,publisher,questions,resourceType,scoreDisplayConfig,status,streamingUrl,subject,template,templateId,totalQuestions,totalScore,versionKey,visibility,year,primaryCategory,additionalCategories,interceptionPoints,interceptionType&licenseDetails=name,description,url`;
    }

    let config = {
      method: "get",
      url: contentUrl,
    };

    console.log("[getCourseContent] Request config:", {
      url: config.url,
      usingUpdatedUrl: !!this.updatedUrl,
      contentId: value,
    });

    const response = await axios(config);
    const data = response?.data;

    // Handle different response structures
    let final;
    if (data?.result?.content) {
      final = data.result.content;
    } else if (data?.content) {
      final = data.content;
    } else {
      final = data;
    }

    console.log("[getCourseContent] Response received:", {
      status: response.status,
      hasContent: !!final,
    });

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
    console.log("value", value)
    console.log("type", type)
    console.log("url", this.currentUrl)
    var axios = require("axios");
    if (type == "assessment") {
      // Use SUNBIRDUPDATEDURL for content read if available, otherwise use currentUrl
      let url;
      if (this.updatedUrl) {
        // Use the updated URL format for content reading
        url = `${this.updatedUrl}/action/content/v3/read/${value}`;
      } else {
        // Check if currentUrl contains /interface/v1/action/content/v3, use that format
        // Otherwise use the standard sunbird assessment endpoint
        url = this.currentUrl.trim();
        
        // Remove trailing slash if present
        if (url.endsWith('/')) {
          url = url.slice(0, -1);
        }
        
        // Check if URL contains the interface API pattern
        if (url.includes('/interface/v1/action/content/v3')) {
          // If it already ends with /read, just append the content ID
          if (url.endsWith('/read')) {
            url = `${url}/${value}`;
          } else {
            // Otherwise, append /read/{contentId}
            url = `${url}/read/${value}`;
          }
        } else {
          // Use standard sunbird assessment endpoint
          url = `${url}/learner/questionset/v1/hierarchy/${value}?orgdetails=orgName,email&licenseDetails=name,description,url`;
        }
      }
      
      console.log("[getCourseHierarchy] Constructed assessment URL:", {
        url: url,
        usingUpdatedUrl: !!this.updatedUrl,
        contentId: value,
        type: "assessment",
      });
      let config = {
        method: "get",
        url: url,
      };
      try {
        const response = await axios(config);
        console.log("assessment response status", response.status);
        console.log("assessment response data keys", Object.keys(response.data || {}));
        console.log("assessment response.data structure:", JSON.stringify(Object.keys(response.data || {})).substring(0, 200));
        
        // Handle different response structures for assessment
        let data;
        // Check for content first (interface API pattern)
        if (response?.data?.content) {
          // For interface API, extract content directly
          console.log("Extracting from response.data.content");
          data = response.data.content;
        } else if (response?.data?.result?.questionSet) {
          data = response.data.result.questionSet;
        } else if (response?.data?.questionSet) {
          data = response.data.questionSet;
        } else if (response?.data?.result) {
          data = response.data.result;
        } else {
          console.log("Using response.data directly");
          data = response.data;
        }
        
        // If data still has a content wrapper, extract it (handle nested content)
        if (data && typeof data === 'object' && data.content && Object.keys(data).length === 1) {
          console.log("Unwrapping nested content");
          data = data.content;
        }
        
        console.log("Final data keys:", Object.keys(data || {}));
        
        return new SuccessResponse({
          statusCode: 200,
          message: "ok",
          data: data,
        });
      } catch (error) {
        console.error("Error fetching assessment hierarchy:", error.message);
        console.error("Error URL that failed:", url);
        console.error("Error status:", error.response?.status);
        console.error("Error response:", error.response?.data);
        throw error;
      }
    } else {
      // Use SUNBIRDUPDATEDURL for content read if available, otherwise use currentUrl
      let url;
      if (this.updatedUrl) {
        // Use the updated URL format for content reading
        url = `${this.updatedUrl}/action/content/v3/read/${value}`;
      } else {
        // Check if currentUrl contains /interface/v1/action/content/v3, use that format
        // Otherwise use the standard sunbird hierarchy endpoint
        url = this.currentUrl.trim();
        
        // Remove trailing slash if present
        if (url.endsWith('/')) {
          url = url.slice(0, -1);
        }
        
        // Check if URL contains the interface API pattern
        if (url.includes('/interface/v1/action/content/v3')) {
          // If it already ends with /read, just append the content ID
          if (url.endsWith('/read')) {
            url = `${url}/${value}`;
          } else {
            // Otherwise, append /read/{contentId}
            url = `${url}/read/${value}`;
          }
        } else {
          // Use standard sunbird hierarchy endpoint
          url = `${url}/api/course/v1/hierarchy/${value}?orgdetails=orgName,email&licenseDetails=name,description,url`;
        }
      }
      
      console.log("[getCourseHierarchy] Constructed URL:", {
        url: url,
        usingUpdatedUrl: !!this.updatedUrl,
        contentId: value,
      });
      
      let config = {
        method: "get",
        url: url,
      };

      try {
        const response = await axios(config);
        console.log("response status", response.status);
        console.log("response data keys", Object.keys(response.data || {}));
        
        // Handle different response structures
        let data;
        if (response?.data?.result?.content) {
          data = response.data.result.content;
        } else if (response?.data?.content) {
          data = response.data.content;
        } else if (response?.data?.result) {
          data = response.data.result;
        } else {
          data = response.data;
        }
        
        return new SuccessResponse({
          statusCode: 200,
          message: "ok",
          data: data,
        });
      } catch (error) {
        console.error("Error fetching course hierarchy:", error.message);
        console.error("Error URL that failed:", url);
        console.error("Error status:", error.response?.status);
        console.error("Error response:", error.response?.data);
        throw error;
      }
    }
  }

  public async getQuestionset(request: any) {
    var axios = require("axios");
    let topics = Array;
    let newQuestions = {};
    
    // Use SUNBIRDUPDATEDURL for question list if available, otherwise use currentUrl
    const baseUrl = this.updatedUrl || this.currentUrl;
    const questionListUrl = this.updatedUrl 
      ? `${this.updatedUrl}/api/question/v2/list`
      : `${this.currentUrl}/api/question/v1/list`;
    
    var config = {
      method: "post",
      url: questionListUrl,
      headers: {
        "Content-Type": "application/json",
      },
      data: request,
    };

    console.log("[getQuestionset] Request config:", {
      url: config.url,
      usingUpdatedUrl: !!this.updatedUrl,
    });

    const responseData = await axios(config);
    const data = responseData.data;
    const result = data.result.questions;
    const qu = result.map((e: any) => {
      return new questionSearchDto(e);
    });

    const question = { questions: qu, count: data.result.count };
    const questions = new questionsetSearchDto(question);
    
    console.log("[getQuestionset] Response received:", {
      status: responseData.status,
      questionCount: qu.length,
    });
    
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
