import { Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { SuccessResponse } from "src/success-response";
import { IServicelocator } from "../userservicelocator";
import { UserDto } from "src/user/dto/user.dto";
import { UserSearchDto } from "src/user/dto/user-search.dto";
import { ErrorResponse } from "src/error-response";

@Injectable()
export class HasuraUserService implements IServicelocator {
  constructor(private httpService: HttpService) {}

  public async getUser(userId: string, request: any) {
    var axios = require("axios");

    var data = {
      query: `query GetUser($userId:uuid!) {
        Users_by_pk(userId: $userId) {
            userId
            name
            username
            email
            mobileNumber
            birthDate
            bloodGroup
            udise
            school
            board
            grade
            medium
            state
            district
            block
            role
            gender
            section
        }
      }
      `,
      variables: { userId: userId },
    };
    console.log(data);

    var config = {
      method: "post",
      url: process.env.REGISTRYHASURA,
      headers: {
        "x-hasura-admin-secret": process.env.REGISTRYHASURAADMINSECRET,
        "Content-Type": "application/json",
      },
      data: data,
    };

    const response = await axios(config);
    if (response?.data?.errors) {
      return new ErrorResponse({
        errorCode: response.data.errors[0].extensions,
        errorMessage: response.data.errors[0].message,
      });
    } else {
      let result = [response.data.data.Users_by_pk];
      console.log(response.data.data);

      const userData = await this.mappedResponse(result);
      return new SuccessResponse({
        statusCode: response.status,
        message: "Ok.",
        data: userData[0],
      });
    }
  }

  public async createUser(request: any, userDto: UserDto) {
    var axios = require("axios");

    const userSchema = new UserDto(userDto);
    let query = "";
    Object.keys(userDto).forEach((e) => {
      if (
        userDto[e] &&
        userDto[e] != "" &&
        Object.keys(userSchema).includes(e)
      ) {
        if (Array.isArray(userDto[e])) {
          query += `${e}: ${JSON.stringify(userDto[e])}, `;
        } else {
          query += `${e}: ${JSON.stringify(userDto[e])}, `;
        }
      }
    });

    var data = {
      query: `mutation CreateUser {
        insert_user_one(object: {${query}}) {
         userId
        }
      }
      `,
      variables: {},
    };

    var config = {
      method: "post",
      url: process.env.REGISTRYHASURA,
      headers: {
        "x-hasura-admin-secret": process.env.REGISTRYHASURAADMINSECRET,
        "Content-Type": "application/json",
      },
      data: data,
    };

    const response = await axios(config);

    if (response?.data?.errors) {
      return new ErrorResponse({
        errorCode: response.data.errors[0].extensions,
        errorMessage: response.data.errors[0].message,
      });
    } else {
      const result = response.data.data.insert_user_one;
      return new SuccessResponse({
        statusCode: 200,
        message: "Ok.",
        data: result,
      });
    }
  }

  public async updateUser(userId: string, request: any, userDto: UserDto) {
    var axios = require("axios");

    const userSchema = new UserDto(userDto);
    let query = "";
    Object.keys(userDto).forEach((e) => {
      if (
        userDto[e] &&
        userDto[e] != "" &&
        Object.keys(userSchema).includes(e)
      ) {
        if (Array.isArray(userDto[e])) {
          query += `${e}: ${JSON.stringify(userDto[e])}, `;
        } else {
          query += `${e}: ${JSON.stringify(userDto[e])}, `;
        }
      }
    });

    var data = {
      query: `mutation UpdateUser($userId:uuid) {
          update_user(where: {userId: {_eq: $userId}}, _set: {${query}}) {
          affected_rows
        }}`,
      variables: {
        userId: userId,
      },
    };

    var config = {
      method: "post",
      url: process.env.REGISTRYHASURA,
      headers: {
        "x-hasura-admin-secret": process.env.REGISTRYHASURAADMINSECRET,
        "Content-Type": "application/json",
      },
      data: data,
    };

    const response = await axios(config);

    const result = response.data.data;

    return new SuccessResponse({
      statusCode: 200,
      message: "Ok.",
      data: result,
    });
  }

  public async searchUser(request: any, userSearchDto: UserSearchDto) {
    var axios = require("axios");

    let offset = 0;
    if (userSearchDto.page > 1) {
      offset = parseInt(userSearchDto.limit) * (userSearchDto.page - 1);
    }

    let filters = userSearchDto.filters;

    Object.keys(userSearchDto.filters).forEach((item) => {
      Object.keys(userSearchDto.filters[item]).forEach((e) => {
        if (!e.startsWith("_")) {
          filters[item][`_${e}`] = filters[item][e];
          delete filters[item][e];
        }
      });
    });
    var data = {
      query: `query SearchUser($filters:user_bool_exp,$limit:Int, $offset:Int) {
        user_aggregate {
          aggregate {
            count
          }
        }
          user(where:$filters, limit: $limit, offset: $offset,) {
            aadhaar
            birthDate
            block
            bloodGroup
            bpl
            created_at
            deactivationReason
            district
            fatherEmail
            fatherFirstName
            fatherLastName
            fatherMiddleName
            fatherPhoneNumber
            firstName
            gender
            groupId
            guardianEmail
            guardianFirstName
            guardianLastName
            guardianMiddleName
            guardianPhoneNumber
            height
            homeless
            image
            iscwsn
            lastName
            locationId
            metaData
            middleName
            migrant
            motherEmail
            motherFirstName
            motherLastName
            motherMiddleName
            motherPhoneNumber
            pincode
            refId1
            refId2
            religion
            schoolId
            singleGirl
            socialCategory
            stateId
            status
            userAddress
            userEmail
            userId
            userPhoneNumber
            updated_at
            village
            weight
            }
          }`,
      variables: {
        limit: parseInt(userSearchDto.limit),
        offset: offset,
        filters: userSearchDto.filters,
      },
    };
    var config = {
      method: "post",
      url: process.env.REGISTRYHASURA,
      headers: {
        "x-hasura-admin-secret": process.env.REGISTRYHASURAADMINSECRET,
        "Content-Type": "application/json",
      },
      data: data,
    };

    const response = await axios(config);

    let result = response.data.data.user;
    const userData = await this.mappedResponse(result);
    const count = response?.data?.data?.user_aggregate?.aggregate?.count;
    return new SuccessResponse({
      statusCode: 200,
      message: "Ok.",
      data: userData,
    });
  }

  public async mappedResponse(result: any) {
    const userResponse = result.map((item: any) => {
      const userMapping = {
        userId: item?.userId ? `${item.userId}` : "",
        name: item?.name ? `${item.name}` : "",
        username: item?.username ? `${item.username}` : "",
        school: item?.school ? `${item.school}` : "",
        email: item?.email ? `${item.uemail}` : "",
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
        created_by: item?.created_by ? `${item.created_by}` : "",
        updated_by: item?.updated_by ? `${item.updated_by}` : "",
      };
      return new UserDto(userMapping);
    });

    return userResponse;
  }
  public async teacherSegment(
    schoolId: string,
    templateId: string,
    request: any
  ) {}
  public async getUserByAuth(request) {}
}
