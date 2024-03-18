import { Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import jwt_decode from "jwt-decode";
import { GroupMembershipService } from "./groupMembership.adapter";
import { HasuraGroupService } from "./group.adapter";
import { ALTBulkUploadStudentDto } from "src/altBulkUploadStudent/dto/alt-bulk-upload-student.dto";
import { ALTStudentService } from "./altStudent.adapter";
import { getPassword, getToken } from "./adapter.utils";
import { ErrorResponse } from "src/error-response";
import { SuccessResponse } from "src/success-response";
@Injectable()
export class ALTBulkUploadStudentService {
  constructor(
    private httpService: HttpService,
    private studentService: ALTStudentService,
    private groupMembershipService: GroupMembershipService,
    private groupService: HasuraGroupService
  ) {}

  public async createStudents(
    request: any,
    bulkStudentDto: ALTBulkUploadStudentDto
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
      for (const student of bulkStudentDto.students) {
        student.groups = [];
        student.password = getPassword(8);
        student.status = true;
        const studentRes: any = await this.studentService.createAndAddToGroup(
          request,
          student,
          bulkToken
        );
        if (studentRes?.statusCode === 200) {
          responses.push(studentRes.data);
        } else {
          errors.push({
            name: student.name,
            username: student.username,
            studentRes,
          });
        }
      }
      const result = {
        totalCount: bulkStudentDto.students.length,
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
