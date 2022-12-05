import { Injectable } from "@nestjs/common";
import { GroupInterface } from "../../group/interfaces/group.interface";
import { HttpService } from "@nestjs/axios";
import jwt_decode from "jwt-decode";
import { SuccessResponse } from "src/success-response";
import { ErrorResponse } from "src/error-response";
const resolvePath = require("object-resolve-path");
import { GroupDto } from "src/group/dto/group.dto";
import { GroupSearchDto } from "src/group/dto/group-search.dto";
import { IServicelocatorgroup } from "../groupservicelocator";
import { UserDto } from "src/user/dto/user.dto";
import { StudentDto } from "src/student/dto/student.dto";
export const HasuraGroupToken = "HasuraGroup";
@Injectable()
export class HasuraGroupService implements IServicelocatorgroup {
  private group: GroupInterface;
  axios = require("axios");
  url = `${process.env.BASEAPIURL}`;

  constructor(private httpService: HttpService) {}

  public async getGroup(request: any, groupId: any) {
    var groupDetails = {
      query: `query GetGroup($groupId:uuid!) {
        Group_by_pk(groupId: $groupId) {
        groupId
        deactivationReason
        created_at
        image
        mediumOfInstruction
        metaData
        name
        option
        schoolId
        section
        teacherId
        gradeLevel
        status
        type
        updated_at
        parentGroupId
      }
    }`,
      variables: {
        groupId: groupId,
      },
    };

    var config = {
      method: "post",
      url: process.env.ALTHASURA,
      headers: {
        "Authorization": request.headers.authorization,
        "Content-Type": "application/json",
      },
      data: groupDetails,
    };

    const resGroupDetails = await this.axios(config);

    if (resGroupDetails?.data?.errors) {
      return new ErrorResponse({
        errorCode: resGroupDetails.data.errors[0].extensions,
        errorMessage: resGroupDetails.data.errors[0].message,
      });
    }

    let result = [resGroupDetails.data.data.Group_by_pk];
    const groupResponse = await this.mappedResponse(result);

    return new SuccessResponse({
      statusCode: 200,
      message: "Ok.",
      data: groupResponse,
    });
  }

  public async createGroup(request: any, groupDto: GroupDto) {
    let query = "";
    Object.keys(groupDto).forEach((e) => {
      if (groupDto[e] && groupDto[e] != "") {
        if (e === "role") {
          query += `${e}: ${groupDto[e]},`;
        } else if (Array.isArray(groupDto[e])) {
          query += `${e}: ${JSON.stringify(groupDto[e])}, `;
        } else {
          query += `${e}: "${groupDto[e]}", `;
        }
      }
    });

    var data = {
      query: `mutation CreateGroup {
        insert_Group_one(object: {${query}}) {
         groupId
        }
      }
      `,
      variables: {},
    };

    var config = {
      method: "post",
      url: process.env.REGISTRYHASURA,
      headers: {
        "Authorization": request.headers.authorization,
        "Content-Type": "application/json",
      },
      data: data,
    };

    const response = await this.axios(config);

    if (response?.data?.errors) {
      return new ErrorResponse({
        errorCode: response.data.errors[0].extensions,
        errorMessage: response.data.errors[0].message,
      });
    }

    const result = response.data.data.insert_Group_one;

    return new SuccessResponse({
      statusCode: 200,
      message: "Ok.",
      data: result,
    });
  }

  public async updateGroup(groupId: string, request: any, groupDto: GroupDto) {
    let query = "";
    Object.keys(groupDto).forEach((e) => {
      if (groupDto[e] && groupDto[e] != "") {
        if (e === "role") {
          query += `${e}: ${groupDto[e]},`;
        } else if (Array.isArray(groupDto[e])) {
          query += `${e}: ${JSON.stringify(groupDto[e])}, `;
        } else {
          query += `${e}: ${groupDto[e]}, `;
        }
      }
    });

    var data = {
      query: `mutation UpdateGroup($groupId:uuid) {
          update_Group(where: {groupId: {_eq: $groupId}}, _set: {${query}}) {
          affected_rows
        }
}`,
      variables: {
        groupId: groupId,
      },
    };

    var config = {
      method: "post",
      url: process.env.REGISTRYHASURA,
      headers: {
        "Authorization": request.headers.authorization,
        "Content-Type": "application/json",
      },
      data: data,
    };

    const response = await this.axios(config);

    if (response?.data?.errors) {
      return new ErrorResponse({
        errorCode: response.data.errors[0].extensions,
        errorMessage: response.data.errors[0].message,
      });
    }

    const result = response.data.data.update_Group;

    return new SuccessResponse({
      statusCode: 200,
      message: "Ok.",
      data: result,
    });
  }

  public async searchGroup(request: any, groupSearchDto: GroupSearchDto) {
    let offset = 0;
    if (groupSearchDto.page > 1) {
      offset = groupSearchDto.limit * (groupSearchDto.page - 1);
    }

    let query = "";
    Object.keys(groupSearchDto.filters).forEach((e) => {
      if (groupSearchDto.filters[e] && groupSearchDto.filters[e] != "") {
        if (e === "name") {
          query += `${e}:{_ilike: "%${groupSearchDto.filters[e]}%"}`;
        } else {
          query += `${e}:{_eq:"${groupSearchDto.filters[e]}"}`;
        }
      }
    });

    var data = {
      query: `query SearchGroup($limit:Int, $offset:Int) {
           Group(where:{${query}}, limit: $limit, offset: $offset,) {
                groupId
                deactivationReason
                created_at
                image
                mediumOfInstruction
                metaData
                name
                option
                schoolId
                section
                status
                teacherId
                gradeLevel
                type
                updated_at
                parentGroupId
            }
          }`,
      variables: {
        limit: groupSearchDto.limit,
        offset: offset,
      },
    };
    var config = {
      method: "post",
      url: process.env.REGISTRYHASURA,
      headers: {
        Authorization: request.headers.authorization,
        "Content-Type": "application/json",
      },
      data: data,
    };

    const response = await this.axios(config);

    if (response?.data?.errors) {
      return new ErrorResponse({
        errorCode: response.data.errors[0].extensions,
        errorMessage: response.data.errors[0].message,
      });
    }

    let result = response.data.data.Group;

    const groupResponse = await this.mappedResponse(result);

    return new SuccessResponse({
      statusCode: 200,
      message: "Ok.",
      data: groupResponse,
    });
  }

  public async findMembersOfGroup(groupId: string, role: string, request: any) {
    let axios = require("axios");
    let userData = [];
    
    var findMember = {
      query: `query GetGroupMembership($groupId:uuid,$role:UserRole_enum) {
       GroupMembership(where: {groupId: {_eq: $groupId}, role: {_eq: $role}}) {
        User {
          birthDate
          block
          bloodGroup
          board
          createdBy
          created_at
          district
          email
          father
          grade
          gender
          image
          medium
          mobileNumber
          mother
          name
          role
          school
          section
          serialNo
          state
          status
          udise
          uniqueId
          updatedBy
          updated_at
          userId
          username
        }
      }
      }`,
      variables: {
        groupId: groupId,
        role: role,
      },
    };

    var getMemberData = {
      method: "post",
      url: process.env.REGISTRYHASURA,
      headers: {
        "Authorization": request.headers.authorization,
        "Content-Type": "application/json",
      },
      data: findMember,
    };

    const response = await axios(getMemberData);

    if (response?.data?.errors) {
      return new ErrorResponse({
        errorCode: response.data.errors[0].extensions,
        errorMessage: response.data.errors[0].message,
      });
    }

    let result = response.data.data.GroupMembership; 

    const userList = result.map((e: any) => {
      return e.User;
    });
    
    if (!userList.length) {      
      return new SuccessResponse({
        statusCode: 200,
        message: "ok",
        data: { msg: "No data found for given inputs!" },
      });
    } 
    
    const groupResponse = await this.userMappedResponse(userList);

    return new SuccessResponse({
      statusCode: 200,
      message: "ok",
      data: groupResponse,
    });

  }

  public async findGroupsByUserId(userId: string, role: string, request: any) {
    let axios = require("axios");
    var findMember = {
      query: `query GetGroup($userId:uuid!,$role:UserRole_enum) {
        GroupMembership(where: {userId: {_eq: $userId}, role: {_eq: $role}}) {
          Group {
            created_at
            deactivationReason
            gradeLevel
            groupId
            image
            mediumOfInstruction
            metaData
            name
            option
            schoolId
            section
            status
            teacherId
            type
            updated_at
            parentGroupId
          }
        }
      }
      `,
      variables: {
        userId: userId,
        role: role,
      },
    };

    var getMemberData = {
      method: "post",
      url: process.env.REGISTRYHASURA,
      headers: {
        "Authorization": request.headers.authorization,
        "Content-Type": "application/json",
      },
      data: findMember,
    };
    const response = await axios(getMemberData);
    
    if (response?.data?.errors) {
      return new ErrorResponse({
        errorCode: response.data.errors[0].extensions,
        errorMessage: response.data.errors[0].message,
      });
    }
    
    let groupData = response.data.data.GroupMembership;

    const groupList = groupData.map((e: any) => {
      return e.Group;
    });
    
    const groupResponse = await this.mappedResponse(groupList);
    return new SuccessResponse({
      statusCode: 200,
      message: "ok",
      data: groupResponse,
    });
  }

  public async findMembersOfChildGroup(
    parentGroupId: string,
    role: string,
    request: any
  ) {
    let axios = require("axios");
    let userData = [];
    let userIds = [];
    var findParentGroupId = {
      query: `query GetGroupParentId($parentGroupId:String) {
       group(where: {parentGroupId: {_eq: $parentGroupId}}) {
        groupId
        }
      }`,
      variables: {
        parentGroupId: parentGroupId,
      },
    };

    var getParentGroupId = {
      method: "post",
      url: process.env.REGISTRYHASURA,
      headers: {
        "x-hasura-admin-secret": process.env.REGISTRYHASURAADMINSECRET,
        "Content-Type": "application/json",
      },
      data: findParentGroupId,
    };

    const groupResponse = await axios(getParentGroupId);
    let groupIds = groupResponse.data.data.group.map((e: any) => {
      return e.groupId;
    });

    var findMember = {
      query: `query GetGroupMembership($groupIds:[uuid!],$role:String) {
          groupmembership(where: {groupId: {_in:$groupIds},role: {_eq:$role }}) {
              userId
            role
          }
        }`,
      variables: {
        groupIds,
        role: role,
      },
    };

    var getMemberData = {
      method: "post",
      url: process.env.REGISTRYHASURA,
      headers: {
        "x-hasura-admin-secret": process.env.REGISTRYHASURAADMINSECRET,
        "Content-Type": "application/json",
      },
      data: findMember,
    };

    const response = await axios(getMemberData);
    let result = await response.data.data.groupmembership;

    result.map((e: any) => {
      return userIds.push(e.userId);
    });
    for (let userId of userIds) {
      if (role == "Student") {
        let studentSearch = {
          method: "get",
          url: `${this.url}/Student/${userId}`,
          headers: {
            Authorization: request.headers.authorization,
          },
        };

        const response = await axios(studentSearch);

        let responseData = await this.StudentMappedResponse([response.data]);
        let studentData = responseData[0];

        userData.push(studentData);
      } else {
        let classFinal = {
          method: "get",
          url: `${this.url}/User/${userId}`,
          headers: {
            Authorization: request.headers.authorization,
          },
        };

        const responseData = await axios(classFinal);

        let response = await this.userMappedResponse([responseData.data]);
        let teacherDetailDto = response[0];
        userData.push(teacherDetailDto);
      }
    }

    return new SuccessResponse({
      statusCode: 200,
      message: "ok",
      data: userData,
    });
  }

  public async mappedResponse(result: any) {
    const groupResponse = result.map((item: any) => {
      const groupMapping = {
        groupId: item?.groupId ? `${item.groupId}` : "",
        schoolId: item?.schoolId ? `${item.schoolId}` : "",
        name: item?.name ? `${item.name}` : "",
        type: item?.type ? `${item.type}` : "",
        section: item?.section ? `${item.section}` : "",
        status: item?.status ? `${item.status}` : "",
        deactivationReason: item?.deactivationReason
          ? `${item.deactivationReason}`
          : "",
        mediumOfInstruction: item?.mediumOfInstruction
          ? `${item.mediumOfInstruction}`
          : "",
        teacherId: item?.teacherId ? `${item.teacherId}` : "",
        parentGroupId: item?.parentGroupId ? `${item.parentGroupId}` : "",
        image: item?.image ? `${item.image}` : "",
        metaData: item?.metaData ? item.metaData : [],
        option: item?.option ? item.option : [],
        gradeLevel: item?.gradeLevel ? `${item.gradeLevel}` : "",
        createdAt: item?.created_at ? `${item.created_at}` : "",
        updatedAt: item?.updated_at ? `${item.updated_at}` : "",
      };
      return new GroupDto(groupMapping);
    });
    
    return groupResponse;
  }

  public async StudentMappedResponse(result: any) {
    const studentResponse = result.map((item: any) => {
      const studentMapping = {
        studentId: item?.osid ? `${item.osid}` : "",
        refId1: item?.admissionNo ? `${item.admissionNo}` : "",
        refId2: item?.refId2 ? `${item.refId2}` : "",
        aadhaar: item?.aadhaar ? `${item.aadhaar}` : "",
        firstName: item?.firstName ? `${item.firstName}` : "",
        middleName: item?.middleName ? `${item.middleName}` : "",
        lastName: item?.lastName ? `${item.lastName}` : "",
        groupId: item?.groupId ? `${item.groupId}` : "",
        schoolId: item?.schoolId ? `${item.schoolId}` : "",
        studentEmail: item?.studentEmail ? `${item.studentEmail}` : "",
        studentPhoneNumber: item?.studentPhoneNumber
          ? item.studentPhoneNumber
          : "",
        iscwsn: item?.iscwsn ? `${item.iscwsn}` : "",
        gender: item?.gender ? `${item.gender}` : "",
        socialCategory: item?.socialCategory ? `${item.socialCategory}` : "",
        religion: item?.religion ? `${item.religion}` : "",
        singleGirl: item?.singleGirl ? item.singleGirl : "",
        weight: item?.weight ? `${item.weight}` : "",
        height: item?.height ? `${item.height}` : "",
        bloodGroup: item?.bloodGroup ? `${item.bloodGroup}` : "",
        birthDate: item?.birthDate ? `${item.birthDate}` : "",
        homeless: item?.homeless ? item.homeless : "",
        bpl: item?.bpl ? item.bpl : "",
        migrant: item?.migrant ? item.migrant : "",
        status: item?.status ? `${item.status}` : "",

        fatherFirstName: item?.fatherFirstName ? `${item.fatherFirstName}` : "",

        fatherMiddleName: item?.fatherMiddleName
          ? `${item.fatherMiddleName}`
          : "",

        fatherLastName: item?.fatherLastName ? `${item.fatherLastName}` : "",
        fatherPhoneNumber: item?.fatherPhoneNumber
          ? item.fatherPhoneNumber
          : "",
        fatherEmail: item?.fatherEmail ? `${item.fatherEmail}` : "",

        motherFirstName: item?.motherFirstName ? `${item.motherFirstName}` : "",
        motherMiddleName: item?.motherMiddleName
          ? `${item.motherMiddleName}`
          : "",
        motherLastName: item?.motherLastName ? `${item.motherLastName}` : "",
        motherPhoneNumber: item?.motherPhoneNumber
          ? item.motherPhoneNumber
          : "",
        motherEmail: item?.motherEmail ? `${item.motherEmail}` : "",

        guardianFirstName: item?.guardianFirstName
          ? `${item.guardianFirstName}`
          : "",
        guardianMiddleName: item?.guardianMiddleName
          ? `${item.guardianMiddleName}`
          : "",
        guardianLastName: item?.guardianLastName
          ? `${item.guardianLastName}`
          : "",
        guardianPhoneNumber: item?.guardianPhoneNumber
          ? item.guardianPhoneNumber
          : "",
        guardianEmail: item?.guardianEmail ? `${item.guardianEmail}` : "",
        image: item?.image ? `${item.image}` : "",
        deactivationReason: item?.deactivationReason
          ? `${item.deactivationReason}`
          : "",
        studentAddress: item?.studentAddress ? `${item.studentAddress}` : "",
        village: item?.village ? `${item.village}` : "",
        block: item?.block ? `${item.block}` : "",
        district: item?.district ? `${item.district}` : "",
        stateId: item?.stateId ? `${item.stateId}` : "",
        pincode: item?.pincode ? item.pincode : "",
        locationId: item?.locationId ? `${item.locationId}` : "",
        metaData: item?.metaData ? item.metaData : [],
        createdAt: item?.osCreatedAt ? `${item.osCreatedAt}` : "",
        updatedAt: item?.osUpdatedAt ? `${item.osUpdatedAt}` : "",
        createdBy: item?.osCreatedBy ? `${item.osCreatedBy}` : "",
        updatedBy: item?.osUpdatedBy ? `${item.osUpdatedBy}` : "",
      };
      return new StudentDto(studentMapping);
    });

    return studentResponse;
  }

  public async userMappedResponse(result: any) {
    const userResponse = result.map((item: any) => {
      const userMapping = {
        userId: item?.userId ? `${item.userId}` : "",
        name: item?.name ? `${item.name}` : "",
        username: item?.username ? `${item.username}` : "",
        father: item?.father ? `${item.father}` : "",
        mother: item?.mother ? `${item.mother}` : "",
        uniqueId: item?.uniqueId ? `${item.uniqueId}` : "",
        school: item?.school ? `${item.school}` : "",
        email: item?.email ? `${item.email}` : "",
        mobileNumber: item?.mobileNumber ? item.mobileNumber : "",
        gender: item?.gender ? `${item.gender}` : "",
        udise: item?.udise ? `${item.udise}` : "",
        board: item?.board ? `${item.board}` : "",
        medium: item?.medium ? `${item.medium}` : "",
        grade: item?.grade ? `${item.grade}` : "",
        section: item?.section ? `${item.section}` : "",
        birthDate: item?.birthDate ? `${item.birthDate}` : "",
        status: item?.status ? `${item.status}` : "",
        image: item?.image ? `${item.image}` : "",
        block: item?.block ? `${item.block}` : "",
        district: item?.district ? `${item.district}` : "",
        state: item?.state ? `${item.state}` : "",
        role: item?.role ? `${item.role}` : "",
        created_at: item?.created_at ? `${item.created_at}` : "",
        updated_at: item?.updated_at ? `${item.updated_at}` : "",
        createdBy: item?.createdBy ? `${item.createdBy}` : "",
        updatedBy: item?.updatedBy ? `${item.updatedBy}` : "",
      };
      return new UserDto(userMapping);
    });

    return userResponse;
  }
}
