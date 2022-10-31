import { Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { SuccessResponse } from "src/success-response";
import { IServicelocator } from "../userservicelocator";
import { UserDto } from "src/user/dto/user.dto";
import jwt_decode from "jwt-decode";
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
            father
            mother
            uniqueId
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
            status
            image
        }
      }
      `,
      variables: { userId: userId },
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
      let result = [response.data.data.Users_by_pk];

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
        userDto[e] != "" && e != "password" &&
        Object.keys(userSchema).includes(e)
      ) {
        if (Array.isArray(userDto[e])) {
          query += `${e}: ${JSON.stringify(userDto[e])}, `;
        } else {
          query += `${e}: ${JSON.stringify(userDto[e])}, `;
        }
      }
    });
    
    let errKeycloak = "";
    const resKeycloak = await this.createUserInKeyCloak(userSchema)
    .catch(function (error){
      errKeycloak = error.response.data.errorMessage;
  });

    var data = {
      query: `mutation CreateUser {
        insert_Users_one(object: {${query}}) {
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

    if (response?.data?.errors || resKeycloak == undefined) {
      return new ErrorResponse({
        errorCode: response.data.errors[0].extensions,
        errorMessage: response.data.errors[0].message + errKeycloak,
      });
    } else {
      const result = response.data.data.insert_Users_one;

      return new SuccessResponse({
        statusCode: 200,
        message: "Ok.",
        data: result,
      });
    }

  }

  public async createUserInKeyCloak(query: UserDto) {

    let name = query.name;
    const nameParts = name.split(" ");
    let lname ="";

    if (nameParts[2]) {
      lname = nameParts[2];
    } else if (nameParts[1]) {
      lname = nameParts[1];
    }
    if(!query.password){
      return "User cannot be created";
    }

    var axios = require("axios");
    var data = JSON.stringify({
      firstName: nameParts[0],
      lastName: lname,
      email: query?.email,
      enabled: "true",
      username: query.username,
      credentials: [
        {
          temporary: "false",
          type: "password",
          value: query.password
        }
      ]
    });

    const response = await this.getToken();
    const res = response.data.access_token;

      var config = {
        method: "post",
        url: process.env.ALTKEYCLOAK,
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + res,
        },
        data: data,
      };

      const userResponse = await axios(config);

      return userResponse;
  }

  public async getToken() {
    
    var axios = require('axios');
    var qs = require('qs');
    var data = qs.stringify({
      'username': 'admin',
      'password': 'Alt@2022',
      'grant_type': 'password',
      'client_id': 'admin-cli' 
    });
    var config = {
      method: 'post',
      url: 'https://alt-shiksha.uniteframework.io/auth/realms/master/protocol/openid-connect/token',
      headers: { 
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      data : data
    };

    return axios(config);
  }

  public async updateUser(userId: string, request: any, userDto: UserDto) {
    var axios = require("axios");

    const userSchema = new UserDto(userDto);
    let userUpdate = "";
    Object.keys(userDto).forEach((e) => {
      if (
        userDto[e] &&
        userDto[e] != "" &&
        Object.keys(userSchema).includes(e)
      ) {
        if (Array.isArray(userDto[e])) {
          userUpdate += `${e}: ${JSON.stringify(userDto[e])}, `;
        } else {
          userUpdate += `${e}: ${JSON.stringify(userDto[e])}, `;
        }
      }
    });

    var data = {
      query: `mutation UpdateUser ($userId:uuid){
        update_Users(where: {userId: {_eq: $userId}}, _set: {${userUpdate}}) {
          affected_rows
        }
      }`,
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

  public async searchUser(request: any, userSearchDto: UserSearchDto) {
    var axios = require("axios");

    let offset = 0;
    if (userSearchDto.page > 1) {
      offset = userSearchDto.limit * (userSearchDto.page - 1);
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
      query: `query SearchUser($filters:Users_bool_exp,$limit:Int, $offset:Int) {
        Users_aggregate {
          aggregate {
            count
          }
        }
        Users(where:$filters, limit: $limit, offset: $offset,) {          
            userId
            name
            username
            father
            mother
            uniqueId
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
            status
            image
            }
          }`,
      variables: {
        limit: userSearchDto.limit,
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

    if (response?.data?.errors) {
      return new ErrorResponse({
        errorCode: response.data.errors[0].extensions,
        errorMessage: response.data.errors[0].message,
      });
    } else {
      const result = response.data.data.Users;
      const userData = await this.mappedResponse(result);
      const count = response?.data?.data?.user_aggregate?.aggregate?.count;

      return new SuccessResponse({
        statusCode: 200,
        message: "Ok.",
        data: userData,
      });
    }
  }

  public async mappedResponse(result: any) {
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

  public async getUserByAuth(request: any) {
    const authToken = request.headers.authorization;
    const decoded: any = jwt_decode(authToken);
    
    let username = decoded.preferred_username;

    let axios = require("axios");

    var data = {
      query: `query searchUser($username:String) {
        Users(where: {username: {_eq: $username}}) {
          userId
            name
            username
            father
            mother
            uniqueId
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
            status
            image
            created_at
            created_by
            updated_at
            updated_by
        }
      }`,
      variables: { username: username },
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

    let result = response.data.data.Users;
    const userData = await this.mappedResponse(result);
    return new SuccessResponse({
      statusCode: 200,
      message: "Ok.",
      data: userData,
    });
  }
}
