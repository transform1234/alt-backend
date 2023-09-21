import { Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import jwt_decode from "jwt-decode";
import { SuccessResponse } from "src/success-response";
import { ALTHasuraUserService } from "./altUser.adapter";
import { ALTBulkUploadTeacherDto } from "src/altBulkUploadTeacher/dto/alt-bulk-upload-teacher.dto";
import { ALTTeacherService } from "./altTeacher.adapter";
import { TeacherDto } from "src/altTeacher/dto/alt-teacher.dto";
import { getPassword} from "./adapter.utils";
import { HasuraGroupService } from "./group.adapter";

@Injectable()
export class ALTBulkUploadTeacherService {
  constructor(
    private httpService: HttpService,
    private teacherService: ALTTeacherService,
    private groupService: HasuraGroupService
  ) {}

  public async createTeachers(request: any, bulkTeacherDto: [TeacherDto]) {
    const responses = [];
    const errors = [];
    for (const teacher of bulkTeacherDto) {
      const groupRes: any = await this.groupService.getGroupBySchoolClass(
        request,
        teacher.schoolUdise,
        teacher.className
      );

      if (!groupRes.data[0].groupId) {
        errors.push({
          name: teacher.name,
          groupRes,
        });
      } else {
        // loop
        teacher.groups.push(groupRes.data[0].groupId);
        teacher.board = groupRes.data[0].board;
        teacher.password = getPassword(8);
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
    }
    return {
      totalCount: bulkTeacherDto.length,
      successCount: responses.length,
      responses,
      errors,
    };
  }
}
