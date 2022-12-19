import { Injectable } from "@nestjs/common";
import jwt_decode from "jwt-decode";
import { SuccessResponse } from "src/success-response";
import { ErrorResponse } from "src/error-response";
import { ProgramService } from "./altProgram.adapter";
import { ALTProgramAssociationService } from "../../adapters/hasura/altProgramAssociation.adapter";
import { TermsProgramtoRulesDto } from "src/altProgramAssociation/dto/altTermsProgramtoRules.dto";
import { ALTCourseTrackingService } from "./altCourseTracking.adapter";

@Injectable()
export class ALTCurrentPhaseService {
  axios = require("axios");

  constructor(
    private programService: ProgramService,
    private altProgramAssociationService: ALTProgramAssociationService,
    private altCourseTrackingService: ALTCourseTrackingService
  ) {}

  public async getCurrentPhase(request: any, programId: string) {
    const decoded: any = jwt_decode(request.headers.authorization);
    const altuserId =
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

    let programSubjects: any =
      await this.altProgramAssociationService.getSubjectList(request, {
        programId: programId,
        board: paramData[0].board,
        medium: paramData[0].medium,
        grade: paramData[0].grade,
      });

    let courseIdList = [];
    let ongoingCourseList = [];
    for await (const content of programSubjects.data) {
      let progTermData: any = await this.altProgramAssociationService.getRules(
        request,
        {
          programId: programId,
          board: paramData[0].board,
          medium: paramData[0].medium,
          grade: paramData[0].grade,
          subject: content.subject,
        }
      );

      if (progTermData.data[0].rules) {
        courseIdList = [];
        JSON.parse(progTermData.data[0].rules).prog.map((content: any) => {
          if (content.contentType !== "assessment") {
            courseIdList.push(content.contentId);
          }
        });

        const ongoingCourses: any =
          await this.altCourseTrackingService.getOngoingCourses(
            request,
            courseIdList
          );

        if (ongoingCourses.data.length) {
          const item = {
            subjectName: content.subject,
            ongoingCourses: ongoingCourses.data,
          };
          ongoingCourseList.push(item);
        }
      }
    }

    if (!ongoingCourseList.length) {
      return new SuccessResponse({
        statusCode: 200,
        message: "Ok.",
        data: { msg: "No data, Start consuming course to see current phases" },
      });
    } else {
      return new SuccessResponse({
        statusCode: 200,
        message: "Ok.",
        data: ongoingCourseList,
      });
    }
  }
}
