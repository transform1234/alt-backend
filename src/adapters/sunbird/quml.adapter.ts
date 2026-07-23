import { Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { SuccessResponse } from "src/success-response";
import { QuestionDto } from "src/Question/dto/question.dto";
import { IServicelocator } from "../questionservicelocator";
import e from "express";
import { ErrorResponse } from "src/error-response";
export const SunbirdQuestionToken = "SunbirdQuestion";
@Injectable()
export class QumlQuestionService implements IServicelocator {
  constructor(private httpService: HttpService) {}
  url = process.env.SUNBIRDURL;
  updatedUrl = process.env.SUNBIRDUPDATEDURL;
  public async getAllQuestions(
    questionType: string,
    subject: [string],
    limit: string,
    language: string,
    medium: string,
    bloomsLevel: [string],
    topic: [string],
    className: [string],
    request: any
  ) {
    var axios = require("axios");

    var data = {
      request: {
        filters: {
          objectType: "Question",
          status: ["Live"],
          qType: questionType,
          subject: subject,
          language: language,
          topic: topic,
          gradeLevel: className,
          medium: medium,
          bloomsLevel: bloomsLevel,
        },
        limit: limit,
      },
    };

    var config = {
      method: "post",
      url: `${this.url}/composite/v3/search`,
      data: data,
    };

    const response = await axios(config);
    const responseData = response.data.result.Question;
    let arrayIds = responseData.map((e: any) => {
      return e.identifier;
    });

    let questionArray = [];
    for (let value of arrayIds) {
      let questionData = this.getQuestions(value);
      questionArray.push(await questionData);
    }

    return new SuccessResponse({
      statusCode: 200,
      message: "ok",
      data: questionArray,
    });
  }

  public async getQuestions(value: any) {
    var axios = require("axios");

    let config = {
      method: "get",
      url: `${this.url}/question/v1/read/${value}?fields=body,qType,answer,responseDeclaration,name,solutions,editorState,media,name,board,medium,gradeLevel,subject,topic,learningOutcome,marks,maxScore,bloomsLevel,compatibilityLevel,language,source`,
    };

    const response = await axios(config);

    const data = response?.data;
    const final = data.result.question;

    const mappedResponse = {
      body: final.body,

      instructions: final.instructions,

      feedback: final.feedback,

      topic: final.topic,

      subject: final.subject,

      class: final.gradeLevel,

      questionId: final.identifier,

      hints: final.hints,

      options: final.editorState.options,

      answer: final.answer,

      media: final.media,

      responseDeclaration: final.responseDeclaration,

      outcomeDeclaration: final.outcomeDeclaration,

      templateDeclaration: final.templateDeclaration,

      templateProcessing: final.templateProcessing,

      responseProcessing: final.responseProcessing,

      bloomsLevel: final.bloomsLevel,

      qlevel: final.qlevel,

      purpose: final.purpose,

      expectedDuration: final.expectedDuration,

      maxScore: final.maxScore,

      type: final.qType,

      visibility: final.visibility,

      isTemplate: final.isTemplate,

      interactions: final.interactions,

      solutionAvailable: final.solutionAvailable,

      scoringMode: final.scoringMode,

      qumlVersion: final.qumlVersion,

      totalTimeSpent: final.totalTimeSpent,

      avgTimeSpent: final.avgTimeSpent,

      numAttempts: final.numAttempts,

      numCorrectAttempts: final.numCorrectAttempts,

      numInCorrectAttempts: final.numInCorrectAttempts,

      numSkips: final.numSkips,

      source: final.source,

      learningOutcome: final.learningOutcome,

      compatibilityLevel: final.compatibilityLevel,

      language: final.language,

      avgRating: final.avgRating,

      totalRatings: final.totalRatings,

      examQuestionId: final.examQuestionId,
    };

    let res = new QuestionDto(mappedResponse);
    return res;
  }

  public async getAllQuestionsByQuestionIds(
    questionIds: [string],
    request: any
  ) {
    var axios = require("axios");
    let questionArray = [];
    for (let value of questionIds) {
      let config = {
        method: "get",
        url: `${this.url}/question/v1/read/${value}?fields=body,qType,answer,responseDeclaration,name,solutions,editorState,media,name,board,medium,gradeLevel,subject,topic,learningOutcome,marks,maxScore,bloomsLevel,compatibilityLevel,language,source`,
      };

      const response = await axios(config);
      const data = response?.data;
      const final = data.result.question;

      const mappedResponse = {
        body: final.body,

        instructions: final.instructions,

        feedback: final.feedback,

        topic: final.topic,

        subject: final.subject,

        class: final.gradeLevel,

        questionId: final.identifier,

        hints: final.hints,

        options: final.editorState.options,

        answer: final.answer,

        media: final.media,

        responseDeclaration: final.responseDeclaration,

        outcomeDeclaration: final.outcomeDeclaration,

        templateDeclaration: final.templateDeclaration,

        templateProcessing: final.templateProcessing,

        responseProcessing: final.responseProcessing,

        bloomsLevel: final.bloomsLevel,

        qlevel: final.qlevel,

        purpose: final.purpose,

        expectedDuration: final.expectedDuration,

        maxScore: final.maxScore,

        type: final.qType,

        visibility: final.visibility,

        isTemplate: final.isTemplate,

        interactions: final.interactions,

        solutionAvailable: final.solutionAvailable,

        scoringMode: final.scoringMode,

        qumlVersion: final.qumlVersion,

        totalTimeSpent: final.totalTimeSpent,

        avgTimeSpent: final.avgTimeSpent,

        numAttempts: final.numAttempts,

        numCorrectAttempts: final.numCorrectAttempts,

        numInCorrectAttempts: final.numInCorrectAttempts,

        numSkips: final.numSkips,

        source: final.source,

        learningOutcome: final.learningOutcome,

        compatibilityLevel: final.compatibilityLevel,

        language: final.language,

        avgRating: final.avgRating,

        totalRatings: final.totalRatings,

        examQuestionId: final.examQuestionId,
      };

      let res = new QuestionDto(mappedResponse);
      questionArray.push(res);
    }

    return new SuccessResponse({
      statusCode: 200,
      message: "ok",
      data: questionArray,
    });
  }

  public async getSubjectList(gradeLevel: string) {
    try {
      var axios = require("axios");
      let subjects = Array;
      var config = {
        method: "get",
        url: "https://diksha.gov.in/api/framework/v1/read/mh_k-12_1?categories=board,gradeLevel,medium,class,subject",
        headers: {
          "Content-Type": "application/json",
        },
      };
      const responseData = await axios(config);
      const categories = responseData.data.result.framework.categories;
      if (typeof categories !== "undefined" && categories.length > 0) {
        const grades = categories.find((o) => o.code === "gradeLevel");
        let terms = grades.terms;
        if (typeof terms !== "undefined" && terms.length > 0) {
          let associations = terms.find((o) => o.code === gradeLevel);
          subjects = associations.associations;
        }
      }

      return new SuccessResponse({
        statusCode: 200,
        message: "ok",
        data: subjects,
      });
    } catch (e) {
      return `${e}`;
    }
  }
  public async getTopicsList(subject: string) {
    try {
      var axios = require("axios");
      let topics = Array;
      var data = {
        request: {
          filters: {
            objectType: "Question",
            status: ["Live"],
            subject: [subject],
          },
        },
      };

      var config = {
        method: "post",
        url: "https://vdn.diksha.gov.in/action/composite/v3/search",
        headers: {
          "Content-Type": "application/json",
        },
        data: data,
      };

      const responseData = await axios(config);
      const categories = responseData.data.result.Question;
      const topicList = categories.map((e: any) => {
        return e.se_topics[0];
      });
      return new SuccessResponse({
        statusCode: 200,
        message: "ok",
        data: topicList,
      });
    } catch (e) {
      return `${e}`;
    }
  }
  public async getOneQuestion(questionId: string, request: any) {
    var axios = require("axios");

    let config = {
      method: "get",
      url: `${this.url}/question/v1/read/${questionId}?fields=body,qType,answer,responseDeclaration,name,solutions,editorState,media,name,board,medium,gradeLevel,subject,topic,learningOutcome,marks,maxScore,bloomsLevel,compatibilityLevel,language,source`,
    };

    const response = await axios(config);

    const data = response?.data;

    const final = data.result.question;

    const mappedResponse = {
      body: final.body,

      instructions: final.instructions,

      feedback: final.feedback,

      topic: final.topic,

      subject: final.subject,

      class: final.gradeLevel,

      questionId: final.identifier,

      hints: final.hints,

      options: final.editorState.options,

      answer: final.answer,

      media: final.media,

      responseDeclaration: final.responseDeclaration,

      outcomeDeclaration: final.outcomeDeclaration,

      templateDeclaration: final.templateDeclaration,

      templateProcessing: final.templateProcessing,

      responseProcessing: final.responseProcessing,

      bloomsLevel: final.bloomsLevel,

      qlevel: final.qlevel,

      purpose: final.purpose,

      expectedDuration: final.expectedDuration,

      maxScore: final.maxScore,

      type: final.qType,

      visibility: final.visibility,

      isTemplate: final.isTemplate,

      interactions: final.interactions,

      solutionAvailable: final.solutionAvailable,

      scoringMode: final.scoringMode,

      qumlVersion: final.qumlVersion,

      totalTimeSpent: final.totalTimeSpent,

      avgTimeSpent: final.avgTimeSpent,

      numAttempts: final.numAttempts,

      numCorrectAttempts: final.numCorrectAttempts,

      numInCorrectAttempts: final.numInCorrectAttempts,

      numSkips: final.numSkips,

      source: final.source,

      learningOutcome: final.learningOutcome,

      compatibilityLevel: final.compatibilityLevel,

      language: final.language,

      avgRating: final.avgRating,

      totalRatings: final.totalRatings,

      examQuestionId: final.examQuestionId,
    };

    let res = new QuestionDto(mappedResponse);
    return new SuccessResponse({
      statusCode: 200,
      message: "ok",
      data: res,
    });
  }

  public async getCompetenciesList(
    subject: string,
    limit: string,
    request: any
  ) {
    var axios = require("axios");
    try {
      var data = {
        request: {
          filters: {
            objectType: "Question",
            status: ["Live"],

            subject: subject,
          },
          limit: limit,
        },
      };

      var config = {
        method: "post",
        url: `${this.url}/composite/v3/search`,
        data: data,
      };

      const response = await axios(config);
      const responseData = response.data.result.Question;
      const resData = responseData.map((e: any) => {
        return e.bloomsLevel;
      });
      let bloomsLevel = [...new Set(resData)];

      return new SuccessResponse({
        statusCode: 200,
        message: "ok",
        data: bloomsLevel,
      });
    } catch (e) {
      return ` Competencies not found.`;
    }
  }

  getQuestion(questionId: string, request: any) {}
  createQuestion(request: any, questionDto: QuestionDto) {}
  updateQuestion(questionId: string, request: any, questionDto: QuestionDto) {}
  filterQuestion(
    limit: string,
    body: string,
    className: string,
    maxScore: string,
    questionId: string,
    subject: string,
    topic: string,
    type: string,
    page: number,
    request: any
  ) {}
  bulkImport(request: any, questionDto: [Object]) {}
  async getQuestionList(request: any, body: any, limit: string) {
    let currentBody = JSON.parse(JSON.stringify(body));
    const originalIds = body?.request?.search?.identifier || [];
    const baseUrl = this.updatedUrl || "https://interface.tekdinext.com/interface/v1";
    const questionListUrl = `${baseUrl}/api/question/v2/list`;
    const MAX_RETRIES = 5;
    let attempt = 0;

    console.log(`[getQuestionList] Starting with IDs: ${JSON.stringify(currentBody?.request?.search?.identifier)}`);

    while (attempt < MAX_RETRIES) {
      try {
        var axios = require("axios");
        
        var config = {
          method: "post",
          url: questionListUrl,
          headers: {
            "Content-Type": "application/json",
          },
          data: currentBody,
          limit,
        };

        const responseData = await axios(config);
        console.log(`[getQuestionList] Success on attempt ${attempt}`);
        
        // Inject dummy questions for any missing/invalid IDs to prevent QuML player from crashing
        if (Array.isArray(originalIds) && responseData?.data?.result?.questions) {
          const returnedIds = responseData.data.result.questions.map((q: any) => q.identifier);
          const missingIds = originalIds.filter((id: string) => !returnedIds.includes(id));
          
          if (missingIds.length > 0) {
            console.log(`[getQuestionList] Injecting dummy questions for missing IDs: ${missingIds.join(', ')}`);
            missingIds.forEach((id: string) => {
              responseData.data.result.questions.push({
                identifier: id,
                qType: "MCQ",
                name: "Invalid Question",
                body: "<div class='question-body'><p>This question is no longer available.</p></div><div data-choice-interaction='response1' class='mcq-vertical'></div>",
                mimeType: "application/vnd.sunbird.question",
                primaryCategory: "Multiple Choice Question",
                editorState: {
                  options: [{ answer: true, value: { body: "Skip", value: 0 } }],
                  question: "<p>This question is no longer available.</p>"
                },
                interactions: {
                  response1: { type: "choice", options: [{ label: "Skip", value: 0 }] }
                },
                responseDeclaration: {
                  response1: { cardinality: "single", type: "integer", correctResponse: { value: 0 } }
                },
                outcomeDeclaration: {
                  maxScore: { cardinality: "single", type: "integer", defaultValue: 1 }
                }
              });
            });
            responseData.data.result.count = responseData.data.result.questions.length;
          }
        }
        
        return responseData.data;
      } catch (error) {
        attempt++;
        const errmsg = error?.response?.data?.params?.errmsg;
        console.warn(`[getQuestionList] Attempt ${attempt} failed - errmsg: ${errmsg}`);
        
        if (errmsg && errmsg.includes("Request contains invalid identifiers")) {
          const match = errmsg.match(/\[(.*?)\]/);
          if (match && match[1]) {
            const invalidIds = match[1].split(',').map((id: string) => id.trim());
            console.warn(`[getQuestionList] Filtering out invalid IDs: ${invalidIds.join(', ')}`);
            
            let currentIds = currentBody?.request?.search?.identifier || [];
            if (Array.isArray(currentIds)) {
              currentIds = currentIds.filter((id: string) => !invalidIds.includes(id));
              currentBody.request.search.identifier = currentIds;
              console.log(`[getQuestionList] Retrying with ${currentIds.length} remaining IDs`);
              
              if (currentIds.length === 0) {
                console.warn(`[getQuestionList] No valid IDs remaining. Returning empty result.`);
                // We still need to return dummy questions for the originally requested IDs
                const dummyQuestions = originalIds.map((id: string) => ({
                  identifier: id,
                  qType: "MCQ",
                  name: "Invalid Question",
                  body: "<div class='question-body'><p>This question is no longer available.</p></div><div data-choice-interaction='response1' class='mcq-vertical'></div>",
                  mimeType: "application/vnd.sunbird.question",
                  primaryCategory: "Multiple Choice Question",
                  editorState: {
                    options: [{ answer: true, value: { body: "Skip", value: 0 } }],
                    question: "<p>This question is no longer available.</p>"
                  },
                  interactions: {
                    response1: { type: "choice", options: [{ label: "Skip", value: 0 }] }
                  },
                  responseDeclaration: {
                    response1: { cardinality: "single", type: "integer", correctResponse: { value: 0 } }
                  },
                  outcomeDeclaration: {
                    maxScore: { cardinality: "single", type: "integer", defaultValue: 1 }
                  }
                }));
                return { result: { questions: dummyQuestions, count: dummyQuestions.length } };
              }
              continue;
            }
          }
        }
        
        console.error("[getQuestionList] Non-recoverable error:", {
          message: error?.message,
          status: error?.response?.status,
          data: error?.response?.data,
        });
        
        return new ErrorResponse({
          errorCode: "500",
          errorMessage: "Error in fetching question list",
        });
      }
    }
    
    console.error(`[getQuestionList] Max retries (${MAX_RETRIES}) exceeded.`);
    return new ErrorResponse({
      errorCode: "500",
      errorMessage: "Error in fetching question list: Max retries exceeded",
    });
  }
}
