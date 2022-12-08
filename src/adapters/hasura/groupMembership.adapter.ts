import { Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { SuccessResponse } from "src/success-response";
import { ErrorResponse } from "src/error-response";
import jwt_decode from "jwt-decode";
const resolvePath = require("object-resolve-path");
import { GroupMembershipDto } from "src/groupMembership/dto/groupMembership.dto";
import { GroupMembershipSearchDto } from "src/groupMembership/dto/groupMembership-search.dto";

@Injectable()
export class GroupMembershipService {
  constructor(private httpService: HttpService) {}
  axios = require("axios");
  url = `${process.env.BASEAPIURL}`;

  public async getGroupMembership(groupMembershipId: any, request: any) {
    var data = {
      query: `query GetGroupMembership($groupMembershipId:uuid!) {
        GroupMembership_by_pk(groupMembershipId: $groupMembershipId) {
            groupId
            groupMembershipId
            schoolId
            role
            userId
            updatedBy
            createdBy
            updated_at
            created_at
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
        "Authorization": request.headers.authorization,
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
    groupMembership.userId =
      decoded["https://hasura.io/jwt/claims"]["x-hasura-user-id"];

    groupMembership.createdBy = groupMembership.userId;
    groupMembership.updatedBy = groupMembership.userId;

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
        "Authorization": request.headers.authorization,
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
    let offset = 0;
    if (groupMembershipSearchDto.page > 1) {
      offset =
        parseInt(groupMembershipSearchDto.limit) *
        (groupMembershipSearchDto.page - 1);
    }

    const decoded: any = jwt_decode(request.headers.authorization);
    groupMembershipSearchDto.filters.userId =
      decoded["https://hasura.io/jwt/claims"]["x-hasura-user-id"];

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
            created_at
            groupId
            groupMembershipId
            schoolId
            role
            updated_at
            userId
            createdBy
            updatedBy
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
        groupId: obj?.groupId ? `${obj.groupId}` : "",
        schoolId: obj?.schoolId ? `${obj.schoolId}` : "",
        userId: obj?.userId ? `${obj.userId}` : "",
        role: obj?.role ? `${obj.role}` : "",
        created_at: obj?.created_at ? `${obj.created_at}` : "",
        updated_at: obj?.updated_at ? `${obj.updated_at}` : "",
        createdBy: obj?.createdBy ? `${obj.createdBy}` : "",
        updatedBy: obj?.updatedBy ? `${obj.updatedBy}` : "",
      };
      return new GroupMembershipDto(groupMembershipMapping);
    });

    return groupMembershipResponse;
  }
}
