import { Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import jwt_decode from "jwt-decode";
import { SuccessResponse } from "src/success-response";
import { ALTHasuraUserService } from "./altUser.adapter";
import { ALTBulkUploadTeacherDto } from "src/altBulkUploadTeacher/dto/alt-bulk-upload-teacher.dto";
import { ALTTeacherService } from "./altTeacher.adapter";

@Injectable()
export class ALTBulkUploadTeacherService {
  constructor(
    private httpService: HttpService,
    private teacherService: ALTTeacherService,
  ) {}

  public async createTeachers(
    request: any,
    bulkTeacherDto: ALTBulkUploadTeacherDto
  ) {
    const responses = [];
    const errors = [];
    for (const teacher of bulkTeacherDto.teachers) {
      teacher.groups = bulkTeacherDto.groupIds;
      teacher.schoolUdise = bulkTeacherDto.schoolUdise;
      teacher.password = bulkTeacherDto.password;
      console.log(teacher)
      const teacherRes: any = await this.teacherService.createAndAddToGroup(
        request,
        teacher
      );
      if (teacherRes?.statusCode === 200) {
        responses.push(teacherRes.data);
      } else {
        errors.push({
          name: teacherRes.name,
          teacherRes,
        });
      }
    }
    return {
      totalCount: bulkTeacherDto.teachers.length,
      successCount: responses.length,
      responses,
      errors,
    };
  }
}
