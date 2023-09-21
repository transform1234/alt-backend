import { Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { GroupMembershipService } from "./groupMembership.adapter";
import { HasuraGroupService } from "./group.adapter";
import { ALTBulkUploadStudentDto } from "src/altBulkUploadStudent/dto/alt-bulk-upload-student.dto";
import { ALTStudentService } from "./altStudent.adapter";
import { StudentDto } from "src/altStudent/dto/alt-student.dto";
import { getPassword, encryptPassword, decryptPassword } from "./adapter.utils";
@Injectable()
export class ALTBulkUploadStudentService {
  constructor(
    private httpService: HttpService,
    private studentService: ALTStudentService,
    private groupMembershipService: GroupMembershipService,
    private groupService: HasuraGroupService
  ) {}

  public async createStudents(request: any, bulkStudentDto: [StudentDto]) {
    const responses = [];
    const errors = [];
    for (const student of bulkStudentDto) {
      student.password = encryptPassword(getPassword(8));
      const groupRes: any = await this.groupService.getGroupBySchoolClass(
        request,
        student.schoolUdise,
        student.className
      );

      if (groupRes.statusCode !== 200) {
        errors.push({
          name: student.name,
          groupRes,
        });
      }

      student.groups.push(groupRes.data[0].groupId);
      student.board = groupRes.data[0].board;

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
      totalCount: bulkStudentDto.length,
      successCount: responses.length,
      responses,
      errors,
    };
  }
}
