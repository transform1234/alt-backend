import { Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import jwt_decode from "jwt-decode";
import { SuccessResponse } from "src/success-response";
import { StudentDto } from "src/altStudent/dto/alt-student.dto";
import { ALTHasuraUserService } from "./altUser.adapter";
import { GroupMembershipService } from "./groupMembership.adapter";
import { ALTBulkUploadSchoolDto } from "src/altBulkUploadSchool/dto/alt-bulk-upload-school.dto";
import { SchoolHasuraService } from "./school.adapter";
import { HasuraGroupService } from "./group.adapter";
import { SchoolDto } from "src/school/dto/school.dto";
import { GroupDto } from "src/group/dto/group.dto";

@Injectable()
export class ALTBulkUploadSchoolService {
  constructor(
    private httpService: HttpService,
    private schoolHasuraService: SchoolHasuraService,
    private hasuraGroupService: HasuraGroupService,
    private groupMembershipService: GroupMembershipService
  ) {}

  public async createSchools(request: any, bulkSchoolDto: [SchoolDto]) {
    const responses = [];
    const errors = [];
    for (const school of bulkSchoolDto) {
      const schoolRes: any = await this.schoolHasuraService.createSchool(
        request,
        school
      );
      if (schoolRes?.statusCode === 200) {
        responses.push(schoolRes.data);
        for (let i = 6; i <= 10; i++) {
          let group_data: GroupDto = {
            groupId: null,
            schoolUdise: school?.udiseCode,
            medium: school?.mediumOfInstruction[0],
            grade: "" + i,
            name: "Class " + i,
            type: "class",
            section: null,
            status: "true",
            board: school?.board,
            createdBy: null,
            updatedBy: null,
            createdAt: null,
            updatedAt: null,
            academicYear: new Date().getFullYear().toString(),
          };
          //create groups
          const groupRes: any = await this.hasuraGroupService.createGroup(
            request,
            group_data
          );
          if (groupRes?.statusCode === 200) {
            responses.push(groupRes.data);
          } else {
            errors.push({
              udiseCode: school.udiseCode,
              name: school.name,
              groupRes,
            });
          }
        }
      } else {
        errors.push({
          udiseCode: school.udiseCode,
          name: school.name,
          schoolRes,
        });
      }
    }
    return {
      totalCount: bulkSchoolDto.length,
      successCount: responses.length,
      responses,
      errors,
    };
  }
}
