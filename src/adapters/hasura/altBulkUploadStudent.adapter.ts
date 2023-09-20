import { Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import jwt_decode from "jwt-decode";
import { SuccessResponse } from "src/success-response";
import { StudentDto } from "src/altStudent/dto/alt-student.dto";
import { ALTHasuraUserService } from "./altUser.adapter";
import { GroupMembershipService } from "./groupMembership.adapter";
import { ALTBulkUploadStudentDto } from "src/altBulkUploadStudent/dto/alt-bulk-upload-student.dto";
import { ALTStudentService } from "./altStudent.adapter";

@Injectable()
export class ALTBulkUploadStudentService {
  constructor(
    private httpService: HttpService,
    private studentService: ALTStudentService,
    private groupMembershipService: GroupMembershipService
  ) {}

  public async createStudents(
    request: any,
    bulkStudentDto: ALTBulkUploadStudentDto
  ) {
    const responses = [];
    const errors = [];
    for (const student of bulkStudentDto.students) {
      student.groups.push(bulkStudentDto.groupId);
      student.schoolUdise = bulkStudentDto.schoolUdise;
      student.password = bulkStudentDto.password;
      const studentRes: any = await this.studentService.createAndAddToGroup(
        request,
        student
      );
      if (studentRes?.statusCode === 200) {
        responses.push(studentRes.data);
      } else {
        errors.push({
          name: student.name,
          studentRes,
        });
      }
    }
    return {
      totalCount: bulkStudentDto.students.length,
      successCount: responses.length,
      responses,
      errors,
    };
  }
}
