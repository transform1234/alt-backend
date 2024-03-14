import { Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import jwt_decode from "jwt-decode";
import { SuccessResponse } from "src/success-response";
import { GroupMembershipService } from "./groupMembership.adapter";
import { ALTBulkUploadSchoolDto } from "src/altBulkUploadSchool/dto/alt-bulk-upload-school.dto";
import { SchoolHasuraService } from "./school.adapter";
import { HasuraGroupService } from "./group.adapter";
import { GroupDto } from "src/group/dto/group.dto";
import { ErrorResponse } from "src/error-response";

@Injectable()
export class ALTBulkUploadSchoolService {
  constructor(
    private httpService: HttpService,
    private schoolHasuraService: SchoolHasuraService,
    private hasuraGroupService: HasuraGroupService,
    private groupMembershipService: GroupMembershipService
  ) {}

  public async createSchools(
    request: any,
    bulkSchoolDto: ALTBulkUploadSchoolDto
  ) {
    const responses = [];
    const errors = [];
    for (const school of bulkSchoolDto.schools) {
      const schoolRes: any = await this.schoolHasuraService.createSchool(
        request,
        school
      );
      if (schoolRes?.statusCode === 201) {
        const newGroups = [];
        for (let i = 6; i <= 10; i++) {
          let groupData: GroupDto = {
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
          newGroups.push(groupData);
        }

        const multipleGroupsCreated: any =
          await this.hasuraGroupService.createMultipleGroups(
            request,
            newGroups
          );

        responses.push({
          school: schoolRes.data,
          groups: multipleGroupsCreated,
        });
      } else {
        errors.push({
          udiseCode: school.udiseCode,
          name: school.name,
          schoolRes,
        });
      }
    }
    // res with send
    const response = {
      totalCount: bulkSchoolDto.schools.length,
      successCount: responses.length,
      responses,
      errors,
    };

    return new SuccessResponse({
      statusCode: 200,
      message: "OK.",
      data: response,
    });
  }

  public async createNewGroups(schoolUdiseList: string[], request: any) {
    try {
      const decoded: any = jwt_decode(request.headers.authorization);
      const altUserRoles =
        decoded["https://hasura.io/jwt/claims"]["x-hasura-allowed-roles"];

      const deactivatedGroupsData: any =
        await this.hasuraGroupService.deactivateGroups(
          request,
          altUserRoles,
          schoolUdiseList
        );
      if (
        !deactivatedGroupsData.data.affected_rows &&
        !(deactivatedGroupsData instanceof SuccessResponse)
      ) {
        return new ErrorResponse({
          errorCode: "400",
          errorMessage: "Could not create new groups",
        });
      }

      const deactivatedData = deactivatedGroupsData.data.returning[0];

      const board = deactivatedData?.board;
      const medium = deactivatedData?.medium;

      const newGroupData = schoolUdiseList.map(async (schoolUdise) => {
        const newGroups = [];
        for (let i = 6; i <= 10; i++) {
          let groupData: GroupDto = {
            groupId: null,
            schoolUdise: schoolUdise,
            medium: medium,
            grade: "" + i,
            name: "Class " + i,
            type: "class",
            section: null,
            status: "true",
            board: board,
            createdBy: null,
            updatedBy: null,
            createdAt: null,
            updatedAt: null,
            academicYear: new Date().getFullYear().toString(), // create groups for current year
          };
          newGroups.push(groupData);
        }
        const multipleGroupsCreated: any =
          await this.hasuraGroupService.createMultipleGroups(
            request,
            newGroups
          );

        if (multipleGroupsCreated instanceof SuccessResponse) {
          return {
            schoolUdise,
            data: multipleGroupsCreated?.data,
          };
        } else {
          return {
            schoolUdise,
            data: {
              error:
                "Could not create new groups. Please check if groups already exist.",
            },
          };
        }
      });

      const responses = await Promise.allSettled(newGroupData).then(
        (results) => results
      );

      const responseValues = responses.map((promise) =>
        promise?.status === "fulfilled" ? promise?.value : promise.reason
      );

      return new SuccessResponse({
        statusCode: 200,
        message: "OK.",
        data: responseValues,
      });
    } catch (e) {
      console.error(e);
      return new ErrorResponse({
        errorCode: "500",
        errorMessage: "Something went wrong.",
      });
    }
  }
}
