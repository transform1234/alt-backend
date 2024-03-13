import { Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import jwt_decode from "jwt-decode";
import { SuccessResponse } from "src/success-response";
import { ALTBulkUploadTeacherDto } from "src/altBulkUploadTeacher/dto/alt-bulk-upload-teacher.dto";
import { ALTTeacherService } from "./altTeacher.adapter";
import { getPassword, getClasses, getToken } from "./adapter.utils";
import { HasuraGroupService } from "./group.adapter";
import { ErrorResponse } from "src/error-response";

@Injectable()
export class ALTBulkUploadTeacherService {
  constructor(
    private httpService: HttpService,
    private teacherService: ALTTeacherService,
    private groupService: HasuraGroupService
  ) {}

  public async createTeachers(
    request: any,
    bulkTeacherDto: ALTBulkUploadTeacherDto
  ) {
    const responses = [];
    const errors = [];
    let altUserRoles: string[];
    let bulkToken: string;
    try {
      const decoded: any = jwt_decode(request.headers.authorization);
      altUserRoles =
        decoded["https://hasura.io/jwt/claims"]["x-hasura-allowed-roles"];
      if (!altUserRoles.includes("systemAdmin")) {
        return new ErrorResponse({
          errorCode: "400",
          errorMessage: "Unauthorized",
        });
      }
      // Generate only one token per batch dont generate for each row of csv
      const response = await getToken();
      bulkToken = response.data.access_token;
    } catch (e) {
      console.error(e);
      return new ErrorResponse({
        errorCode: "500",
        errorMessage: "Error getting keycloak token",
      });
    }
    try {
      for (const teacher of bulkTeacherDto.teachers) {
        const teacherClasses = getClasses(teacher.classesTaught);
        if (!teacherClasses.length) {
          errors.push({
            name: teacher.name,
            msg: "No match for classes found please check input data",
          });
          break;
        }
        teacher.groups = [];
        let groupInfo;

        for (let teacherClass of teacherClasses) {
          const groupRes: any = await this.groupService.getGroupBySchoolClass(
            request,
            teacher.schoolUdise,
            teacherClass,
            new Date().getFullYear().toString()
          );

          if (!groupRes.data[0].groupId) {
            errors.push({
              name: teacher.name,
              groupRes,
            });
          } else {
            groupInfo = groupRes;
            teacher.groups.push(groupRes.data[0].groupId);
          }
        }

        if (!teacher.groups.length) {
          errors.push({
            name: teacher.name,
            msg: "No Group found",
          });
        } else {
          teacher.board = groupInfo.data[0].board;
          teacher.password = getPassword(8);
          teacher.status = true;
          const teacherRes: any = await this.teacherService.createAndAddToGroup(
            request,
            teacher,
            bulkToken
          );
          if (teacherRes?.statusCode === 200) {
            responses.push(teacherRes.data);
          } else {
            errors.push({
              name: teacher.name,
              teacherRes,
            });
          }
        }
      }

      const result = {
        totalCount: bulkTeacherDto.teachers.length,
        successCount: responses.length,
        responses,
        errors,
      };

      return new SuccessResponse({
        statusCode: 201,
        message: "Ok.",
        data: result,
      });
    } catch (e) {
      console.error(e);
      return new ErrorResponse({
        errorCode: "500",
        errorMessage: "Error importing student data",
      });
    }
  }
}
