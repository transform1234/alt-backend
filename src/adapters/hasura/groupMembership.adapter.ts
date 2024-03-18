import { Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { SuccessResponse } from "src/success-response";
import { ErrorResponse } from "src/error-response";
import jwt_decode from "jwt-decode";
import { getUserGroup, getUserRole } from "./adapter.utils";

const resolvePath = require("object-resolve-path");
import {
  GroupMembershipDto,
  GroupMembershipDtoById,
} from "src/groupMembership/dto/groupMembership.dto";
import { GroupMembershipSearchDto } from "src/groupMembership/dto/groupMembership-search.dto";

@Injectable()
export class GroupMembershipService {
  constructor(private httpService: HttpService) {}
  axios = require("axios");
  url = `${process.env.BASEAPIURL}`;

  public async getGroupMembership(groupMembershipId: any, request: any) {
    const decoded: any = jwt_decode(request.headers.authorization);
    const altUserRoles =
      decoded["https://hasura.io/jwt/claims"]["x-hasura-allowed-roles"];
    var data = {
      query: `query GetGroupMembership($groupMembershipId:uuid!) {
        GroupMembership_by_pk(groupMembershipId: $groupMembershipId) {
          groupMembershipId
          schoolUdise
          userId
          groupId
          role
          createdBy
          updatedBy
          createdAt
          updatedAt
      }
    }`,
      variables: {
        groupMembershipId: groupMembershipId,
      },
    };

    var config = {
      method: "post",
      url: process.env.REGISTRYHASURA,
      headers: {
        Authorization: request.headers.authorization,
        "x-hasura-role": getUserRole(altUserRoles),

        "Content-Type": "application/json",
      },
      data: data,
    };

    const resGroupMemberDetails = await this.axios(config);

    if (resGroupMemberDetails?.data?.errors) {
      return new ErrorResponse({
        errorCode: resGroupMemberDetails.data.errors[0].extensions,
        errorMessage: resGroupMemberDetails.data.errors[0].message,
      });
    }

    let result = [resGroupMemberDetails.data.data.GroupMembership_by_pk];

    let groupMembershipResponse = await this.mappedResponse(result);

    return new SuccessResponse({
      statusCode: 200,
      message: "Ok.",
      data: groupMembershipResponse,
    });
  }

  public async createGroupMembership(
    request: any,
    groupMembership: GroupMembershipDto
  ) {
    const decoded: any = jwt_decode(request.headers.authorization);
    const altUserRoles =
      decoded["https://hasura.io/jwt/claims"]["x-hasura-user-id"];

    let query = "";
    Object.keys(groupMembership).forEach((e) => {
      if (groupMembership[e] && groupMembership[e] != "") {
        if (e === "role") {
          query += `${e}: ${groupMembership[e]},`;
        } else if (Array.isArray(groupMembership[e])) {
          query += `${e}: ${JSON.stringify(groupMembership[e])}, `;
        } else {
          query += `${e}: "${groupMembership[e]}", `;
        }
      }
    });

    var data = {
      query: `mutation CreateGroupMembership {
        insert_GroupMembership_one(object: {${query}}) {
         groupMembershipId
        }
      }
      `,
      variables: {},
    };

    var config = {
      method: "post",
      url: process.env.REGISTRYHASURA,
      headers: {
        Authorization: request.headers.authorization,
        "x-hasura-role": getUserGroup(altUserRoles),
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

    const result = response.data.data.insert_GroupMembership_one;

    return new SuccessResponse({
      statusCode: 200,
      message: "Ok.",
      data: result,
    });
  }

  public async createGroupMembershipById(
    request: any,
    groupMembership: GroupMembershipDtoById
  ) {
    const decoded: any = jwt_decode(request.headers.authorization);
    const altUserRoles =
      decoded["https://hasura.io/jwt/claims"]["x-hasura-allowed-roles"];
    const userId = decoded["https://hasura.io/jwt/claims"]["x-hasura-user-id"];
    groupMembership.createdBy = userId;
    groupMembership.updatedBy = userId;

    let query = "";
    Object.keys(groupMembership).forEach((e) => {
      if (groupMembership[e] && groupMembership[e] != "") {
        if (e === "role") {
          query += `${e}: ${groupMembership[e]},`;
        } else if (Array.isArray(groupMembership[e])) {
          query += `${e}: ${JSON.stringify(groupMembership[e])}, `;
        } else {
          query += `${e}: "${groupMembership[e]}", `;
        }
      }
    });

    let data = {
      query: `mutation CreateGroupMembership {
        insert_GroupMembership_one(object: {${query}}) {
         groupMembershipId
        }
      }
      `,
      variables: {},
    };

    const config = {
      method: "post",
      url: process.env.REGISTRYHASURA,
      headers: {
        Authorization: request.headers.authorization,
        "x-hasura-role": getUserRole(altUserRoles),
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

    const result = response.data.data.insert_GroupMembership_one;

    return new SuccessResponse({
      statusCode: 200,
      message: "Ok.",
      data: result,
    });
  }

  public async updateGroupMembership(
    groupMembershipId: string,
    request: any,
    groupMembershipDto: GroupMembershipDto
  ) {
    const decoded: any = jwt_decode(request.headers.authorization);
    groupMembershipDto.userId =
      decoded["https://hasura.io/jwt/claims"]["x-hasura-user-id"];

    groupMembershipDto.updatedBy = groupMembershipDto.userId;

    let query = "";
    Object.keys(groupMembershipDto).forEach((e) => {
      if (groupMembershipDto[e] && groupMembershipDto[e] != "") {
        if (e === "role") {
          query += `${e}: ${groupMembershipDto[e]},`;
        } else if (Array.isArray(groupMembershipDto[e])) {
          query += `${e}: ${JSON.stringify(groupMembershipDto[e])}, `;
        } else {
          query += `${e}: ${JSON.stringify(groupMembershipDto[e])}, `;
        }
      }
    });

    const groupMembershipUpdate = {
      query: `mutation UpdateGroupMembership($groupMembershipId:uuid) {
          update_GroupMembership(where: { groupMembershipId: {_eq: $groupMembershipId}}, _set: {${query}}) {
          affected_rows
        }
      }`,
      variables: {
        groupMembershipId: groupMembershipId,
      },
    };

    var config = {
      method: "post",
      url: process.env.REGISTRYHASURA,
      headers: {
        Authorization: request.headers.authorization,
        "Content-Type": "application/json",
      },
      data: groupMembershipUpdate,
    };

    const response = await this.axios(config);

    if (response?.data?.errors) {
      return new ErrorResponse({
        errorCode: response.data.errors[0].extensions,
        errorMessage: response.data.errors[0].message,
      });
    }

    const result = response.data.data.update_GroupMembership;

    return new SuccessResponse({
      statusCode: 200,
      message: "Ok.",
      data: result,
    });
  }

  public async searchGroupMembership(
    request: any,
    groupMembershipSearchDto: GroupMembershipSearchDto
  ) {
    const decoded: any = jwt_decode(request.headers.authorization);
    const altUserRoles =
      decoded["https://hasura.io/jwt/claims"]["x-hasura-allowed-roles"];
    let offset = 0;
    if (groupMembershipSearchDto.page > 1) {
      offset =
        parseInt(groupMembershipSearchDto.limit) *
        (groupMembershipSearchDto.page - 1);
    }

    let query = "";
    Object.keys(groupMembershipSearchDto.filters).forEach((e) => {
      if (
        groupMembershipSearchDto.filters[e] &&
        groupMembershipSearchDto.filters[e] != ""
      ) {
        query += `${e}:{_eq:"${groupMembershipSearchDto.filters[e]}"}`;
      }
    });

    var data = {
      query: `query SearchGroupMembership($limit:Int, $offset:Int) {
           GroupMembership(where:{${query}}, limit: $limit, offset: $offset,) {
            groupMembershipId
            schoolUdise
            userId
            groupId
            role
            createdBy
            updatedBy
            createdAt
            updatedAt
            Group {
              groupId
              name
            }
            }
          }`,
      variables: {
        limit: parseInt(groupMembershipSearchDto.limit),
        offset: offset,
      },
    };
    var config = {
      method: "post",
      url: process.env.REGISTRYHASURA,
      headers: {
        Authorization: request.headers.authorization,
        "x-hasura-role": getUserRole(altUserRoles),
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

    let result = response.data.data.GroupMembership;
    let groupMembershipResponse = await this.mappedResponse(result);
    return new SuccessResponse({
      statusCode: 200,
      message: "Ok.",
      data: groupMembershipResponse,
    });
  }

  public async mappedResponse(result: any) {
    const groupMembershipResponse = result.map((obj: any) => {
      const groupMembershipMapping = {
        groupMembershipId: obj?.groupMembershipId
          ? `${obj.groupMembershipId}`
          : "",
        schoolUdise: obj?.schoolUdise ? `${obj.schoolUdise}` : "",
        schoolId: obj?.schoolId ? `${obj.schoolId}` : "",
        userId: obj?.userId ? `${obj.userId}` : "",
        groupId: obj?.groupId ? `${obj.groupId}` : "",
        role: obj?.role ? `${obj.role}` : "",
        createdAt: obj?.createdAt ? `${obj.createdAt}` : "",
        updatedAt: obj?.updatedAt ? `${obj.updatedAt}` : "",
        createdBy: obj?.createdBy ? `${obj.createdBy}` : "",
        updatedBy: obj?.updatedBy ? `${obj.updatedBy}` : "",
        groupName: obj?.Group.name ? `${obj.Group.name}` : "",
      };
      return new GroupMembershipDtoById(groupMembershipMapping);
    });

    return groupMembershipResponse;
  }

  public async modifyGroupMembership(
    request: any,
    groupMemberships: GroupMembershipDtoById[],
    oldGroupIds: string[]
  ) {
    const decoded: any = jwt_decode(request.headers.authorization);
    const altUserRoles =
      decoded["https://hasura.io/jwt/claims"]["x-hasura-allowed-roles"];
    const userId = decoded["https://hasura.io/jwt/claims"]["x-hasura-user-id"];

    const newGroupMembershipData = groupMemberships.map((groupMembership) => {
      let query = "";
      groupMembership.createdBy = userId;
      groupMembership.updatedBy = userId;
      Object.keys(groupMembership).forEach((e) => {
        if (groupMembership[e] && groupMembership[e] != "") {
          if (e === "role") {
            query += `${e}: ${groupMembership[e]},`;
          } else if (Array.isArray(groupMembership[e])) {
            query += `${e}: ${JSON.stringify(groupMembership[e])}, `;
          } else {
            query += `${e}: "${groupMembership[e]}", `;
          }
        }
      });
      return "{" + query + "}";
    });

    // deactivate old one add new one

    let data = {
      query: `mutation ModifyGroupMembership ($userId: uuid!,$groupIds: [uuid!]) {
        update_GroupMembership(where: {userId: {_eq: $userId}, groupId: {_in: $groupIds}}, _set: {status: false}) {
          affected_rows
          returning {
            status
            groupId
            userId
            updatedAt
            updatedBy
          }
        }
        insert_GroupMembership(objects: [${newGroupMembershipData}]) {
          affected_rows
          returning {
            groupMembershipId
            status
            groupId
            userId
            Group {
              grade
              medium
              name
              board
            }
          }
        }
      }
      `,
      variables: {
        userId: groupMemberships[0].userId,
        groupIds: oldGroupIds,
      },
    };

    const config = {
      method: "post",
      url: process.env.REGISTRYHASURA,
      headers: {
        Authorization: request.headers.authorization,
        "x-hasura-role": getUserRole(altUserRoles),
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

    const result = {
      updation: response.data.data.update_GroupMembership,
      insertion: response.data.data.insert_GroupMembership,
    };

    return new SuccessResponse({
      statusCode: 200,
      message: "Ok.",
      data: result,
    });
  }
}
