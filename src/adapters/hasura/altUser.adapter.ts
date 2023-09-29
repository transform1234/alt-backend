import { Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { SuccessResponse } from "src/success-response";
import { IServicelocator } from "../userservicelocator";
import { ResponseUserDto, UserDto } from "src/altUser/dto/alt-user.dto";
import jwt_decode from "jwt-decode";
import { UserSearchDto } from "src/user/dto/user-search.dto";
import { ErrorResponse } from "src/error-response";
import { UserUpdateDto } from "src/user/dto/user-update.dto";
import {
  getUserRole,
  getToken,
  createUserInKeyCloak,
  getUsername,
  encryptPassword,
  checkIfUsernameExistsInKeycloak,
} from "./adapter.utils";
import { ALTUserUpdateDto } from "src/altUser/dto/alt-user-update.dto";

@Injectable()
export class ALTHasuraUserService {
  axios = require("axios");

  constructor(private httpService: HttpService) {}

  public async getUser(userId: string, request: any) {
    const decoded: any = jwt_decode(request.headers.authorization);
    const altUserRoles =
      decoded["https://hasura.io/jwt/claims"]["x-hasura-allowed-roles"];

    const data = {
      query: `query GetUser($userId:uuid!) {
        Users_by_pk(userId: $userId) {
          userId
          name
          username
          email
          mobile
          gender
          dateOfBirth
          role
          status
          createdAt
          updatedAt
          createdBy
          updatedBy
          GroupMemberships {
            Group {
              board
              medium
              grade
              groupId
            }
          }
        }
      }
      `,
      variables: { userId: userId },
    };

    const config = {
      method: "post",
      url: process.env.ALTHASURA,
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
    } else {
      const result = [response.data.data.Users_by_pk];

      const userData = await this.mappedResponse(result, true);
      return new SuccessResponse({
        statusCode: response.status,
        message: "Ok.",
        data: userData[0],
      });
    }
  }

  public async checkAndAddUser(
    request: any,
    userDto: UserDto,
    bulkToken: string
  ) {
    const decoded: any = jwt_decode(request.headers.authorization);
    const altUserRoles =
      decoded["https://hasura.io/jwt/claims"]["x-hasura-allowed-roles"];

    const userId = decoded["https://hasura.io/jwt/claims"]["x-hasura-user-id"];
    userDto.createdBy = userId;
    userDto.updatedBy = userId;

    if (!userDto.username) {
      userDto.username = getUsername(userDto);
    }
    if (!userDto.email) {
      userDto.email = userDto.username + "@yopmail.com";
    }
    const userSchema = new UserDto(userDto, true);
    const usernameExistsInKeycloak = await checkIfUsernameExistsInKeycloak(
      userDto.username,
      bulkToken
    );
    if (usernameExistsInKeycloak?.data[0]?.username) {
      // console.log("check in db", usernameExistsInKeycloak?.data[0]?.id);

      const usernameExistsInDB: any = await this.getUserByUsername(
        usernameExistsInKeycloak?.data[0]?.username,
        request,
        altUserRoles
      );
      if (usernameExistsInDB?.statusCode === 200) {
        if (usernameExistsInDB?.data) {
          console.log(usernameExistsInDB, "usernameExistsInDB");
          return {
            user: usernameExistsInDB,
            isNewlyCreated: false,
          };
        } else {
          // const userSchema = new UserDto(userDto, true);
          console.log(usernameExistsInDB, "username not exist in db");
          const newlyCreatedDbUser = await this.createUserInDatabase(
            request,
            userDto,
            userSchema,
            usernameExistsInKeycloak?.data[0]?.id,
            altUserRoles
          );
          return {
            user: newlyCreatedDbUser,
            isNewlyCreated: true,
          };
        }
      }
      userDto.userId = usernameExistsInKeycloak?.data[0]?.id;
    } else {
      console.log("not present in keycloak");
      const newlyCreatedUser = await this.createUser(
        request,
        userDto,
        bulkToken,
        userSchema,
        altUserRoles
      );
      return {
        user: newlyCreatedUser,
        isNewlyCreated: true,
      };
    }
  }

  public async createUser(
    request: any,
    userDto: UserDto,
    bulkToken: string,
    userSchema,
    altUserRoles
  ) {
    // It is considered that if user is not present in keycloak it is not present in database as well

    let errKeycloak = "";
    let resKeycloak;

    // if udser exist 1keys 2 db

    if (altUserRoles.includes("systemAdmin")) {
      let token = bulkToken;
      try {
        if (!bulkToken) {
          const response = await getToken(); // generating if required
          token = response.data.access_token;
        } 
        // else {
        //   console.log("Not required" + bulkToken);
        // }
        resKeycloak = await createUserInKeyCloak(userSchema, token).catch(
          (error) => {
            errKeycloak = error.response?.data.errorMessage;
            console.error(errKeycloak, "Keycloak error");
            return new ErrorResponse({
              errorCode: "500",
              errorMessage: "Something went wrong" + errKeycloak,
            });
          }
        );

        // console.log(resKeycloak.response.data.errorMessage, "ok");
        if (resKeycloak?.response?.data?.errorMessage) {
          return new ErrorResponse({
            errorCode: "400",
            errorMessage: "Keycloak user creation failed",
          });
        }
        // db??
        const databaseResponse = this.createUserInDatabase(
          request,
          userDto,
          userSchema,
          resKeycloak,
          altUserRoles
        );

        return databaseResponse;
      } catch (e) {
        return e;
      }
    } else {
      return new ErrorResponse({
        errorCode: "401",
        errorMessage: "Unauthorized",
      });
    }
  }

  public async createUserInDatabase(
    request: any,
    userDto: UserDto,
    userSchema,
    resKeycloak,
    altUserRoles
  ) {
    const encryptedPassword = await encryptPassword(userDto["password"]);

    let query = "";
    Object.keys(userDto).forEach((e) => {
      if (userDto[e] !== "" && Object.keys(userSchema).includes(e)) {
        if (e === "role") {
          query += `${e}: ${userDto[e]},`;
        } else if (e === "password") {
          query += `${e}: ${JSON.stringify(encryptedPassword)}, `;
        } else if (Array.isArray(userDto[e])) {
          query += `${e}: ${JSON.stringify(userDto[e])}, `;
        } else {
          query += `${e}: ${JSON.stringify(userDto[e])}, `;
        }
      }
    });

    // Add userId created in keycloak as user Id of ALT user
    query += `userId: "${resKeycloak}"`;
    const data = {
      query: `mutation CreateUser {
        insert_Users_one(object: {${query}}) {
         userId
        }
      }
      `,
      variables: {},
    };

    const headers = {
      Authorization: request.headers.authorization,
      "x-hasura-role": getUserRole(altUserRoles),
      "Content-Type": "application/json",
    };

    const config = {
      method: "post",
      url: process.env.REGISTRYHASURA,
      headers: headers,
      data: data,
    };

    const response = await this.axios(config);

    if (response?.data?.errors) {
      return new ErrorResponse({
        errorCode: response.data.errors[0].extensions,
        errorMessage: response.data.errors[0].message,
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

  public async updateUser(
    userId: string,
    request: any,
    userUpdateDto: ALTUserUpdateDto
  ) {
    const decoded: any = jwt_decode(request.headers.authorization);
    const altUserRoles =
      decoded["https://hasura.io/jwt/claims"]["x-hasura-allowed-roles"];

    const userSchema = new UserUpdateDto(userUpdateDto);
    let userUpdate = "";
    Object.keys(userUpdateDto).forEach((e) => {
      if (Object.keys(userSchema).includes(e)) {
        if (e === "role") {
          userUpdate += `${e}: ${userUpdateDto[e]},`;
        } else if (Array.isArray(userUpdateDto[e])) {
          userUpdate += `${e}: ${JSON.stringify(userUpdateDto[e])}, `;
        } else {
          userUpdate += `${e}: ${JSON.stringify(userUpdateDto[e])}, `;
        }
      }
    });

    const data = {
      query: `mutation UpdateUser ($userId:uuid){
        update_Users(where: {userId: {_eq: $userId}}, _set: {${userUpdate}}) {
          affected_rows
        }
      }`,
      variables: {
        userId: userId,
      },
    };

    const config = {
      method: "post",
      url: process.env.ALTHASURA,
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
    } else {
      const result = response.data.data.update_Users;
      return new SuccessResponse({
        statusCode: 200,
        message: "Ok.",
        data: result,
      });
    }
  }

  public async searchUser(request: any, userSearchDto: UserSearchDto) {
    const decoded: any = jwt_decode(request.headers.authorization);
    const altUserRoles =
      decoded["https://hasura.io/jwt/claims"]["x-hasura-allowed-roles"];

    let offset = 0;
    if (userSearchDto.page > 1) {
      offset = userSearchDto.limit * (userSearchDto.page - 1);
    }

    let query = "";
    Object.keys(userSearchDto.filters).forEach((e) => {
      if (userSearchDto.filters[e] && userSearchDto.filters[e] != "") {
        if (e === "name" || e === "username") {
          query += `${e}:{_ilike: "%${userSearchDto.filters[e]}%"}`;
        } else {
          query += `${e}:{_eq:"${userSearchDto.filters[e]}"}`;
        }
      }
    });

    const data = {
      query: `query SearchUser($limit:Int, $offset:Int) {
        Users_aggregate {
          aggregate {
            count
          }
        }
        Users(where:{${query}}, limit: $limit, offset: $offset,) {          
            userId
            name
            username
            email
            mobile
            gender
            dateOfBirth
            role
            status
            createdAt
            updatedAt
            createdBy
            updatedBy
            }
          }`,
      variables: {
        limit: userSearchDto.limit,
        offset: offset,
      },
    };

    const config = {
      method: "post",
      url: process.env.ALTHASURA,
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
    } else {
      const result = response.data.data.Users;
      const userData = await this.mappedResponse(result, false);
      const count = response?.data?.data?.user_aggregate?.aggregate?.count;

      return new SuccessResponse({
        statusCode: 200,
        message: "Ok.",
        data: userData,
      });
    }
  }

  public async mappedResponse(result: any, authRes) {
    const userResponse = result.map((item: any) => {
      const userMapping = {
        userId: item?.userId ? `${item.userId}` : "",
        name: item?.name ? `${item.name}` : "",
        username: item?.username ? `${item.username}` : "",
        schoolUdise: item?.schoolUdise ? `${item.schoolUdise}` : "",
        email: item?.email ? `${item.email}` : "",
        mobile: item?.mobile ? item.mobile : "",
        gender: item?.gender ? `${item.gender}` : "",
        dateOfBirth: item?.dateOfBirth ? `${item.dateOfBirth}` : "",
        status: item?.status ? `${item.status}` : "",
        role: item?.role ? `${item.role}` : "",
        createdAt: item?.createdAt ? `${item.createdAt}` : "",
        updatedAt: item?.updatedAt ? `${item.updatedAt}` : "",
        createdBy: item?.createdBy ? `${item.createdBy}` : "",
        updatedBy: item?.updatedBy ? `${item.updatedBy}` : "",
        board:
          authRes && item?.GroupMemberships[0]?.Group?.board
            ? `${item?.GroupMemberships[0]?.Group?.board}`
            : "",
        medium:
          authRes && item?.GroupMemberships[0]?.Group?.medium
            ? `${item?.GroupMemberships[0]?.Group?.medium}`
            : "",
        grade:
          authRes && item?.GroupMemberships[0]?.Group?.grade
            ? `${item?.GroupMemberships[0]?.Group?.grade}`
            : "",
        groupId:
          authRes && item?.GroupMemberships[0]?.Group?.groupId
            ? `${item?.GroupMemberships[0]?.Group?.groupId}`
            : "",
      };
      if (authRes) {
        return new ResponseUserDto(userMapping, false);
      }
      return new UserDto(userMapping, false);
    });
    return userResponse;
  }

  public async getUserByAuth(request: any) {
    const authToken = request.headers.authorization;
    const decoded: any = jwt_decode(authToken);
    const altUserRoles =
      decoded["https://hasura.io/jwt/claims"]["x-hasura-allowed-roles"];
    const username = decoded.preferred_username;

    const data = {
      query: `query searchUser($username:String) {
        Users(where: {username: {_eq: $username}}) {
          userId
          name
          username
          email
          mobile
          gender
          dateOfBirth
          role
          status
          createdAt
          updatedAt
          createdBy
          updatedBy
          GroupMemberships {
            Group {
              board
              medium
              grade
              groupId
            }
          }
        }
      }`,
      variables: { username: username },
    };

    const config = {
      method: "post",
      url: process.env.ALTHASURA,
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
    } else {
      const result = response.data.data.Users;
      const userData = await this.mappedResponse(result, true);
      return new SuccessResponse({
        statusCode: 200,
        message: "Ok.",
        data: userData,
      });
    }
  }

  public async resetUserPassword(
    request: any,
    username: string,
    newPassword: string
  ) {
    const decoded: any = jwt_decode(request.headers.authorization);
    const altUserRoles =
      decoded["https://hasura.io/jwt/claims"]["x-hasura-allowed-roles"];

    const userData: any = await this.getUserByUsername(
      username,
      request,
      altUserRoles
    );
    let userId;

    if (userData?.data?.userId) {
      userId = userData.data.userId;
    } else {
      return new ErrorResponse({
        errorCode: `404`,
        errorMessage: "User with given username not found",
      });
    }

    const data = JSON.stringify({
      temporary: "false",
      type: "password",
      value: newPassword,
    });

    const response = await getToken();
    const res = response.data.access_token;
    let apiResponse;

    const config = {
      method: "put",
      url:
        "https://alt-shiksha.uniteframework.io/auth/admin/realms/hasura/users/" +
        userId +
        "/reset-password",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + res,
      },
      data: data,
    };

    try {
      apiResponse = await this.axios(config);
    } catch (e) {
      return new ErrorResponse({
        errorCode: `${e.response.status}`,
        errorMessage: e.response.data.error,
      });
    }

    if (apiResponse.status === 204) {
      return new SuccessResponse({
        statusCode: apiResponse.status,
        message: apiResponse.statusText,
        data: { msg: "Password reset successful!" },
      });
    } else {
      return new ErrorResponse({
        errorCode: "400",
        errorMessage: apiResponse.errors,
      });
    }
  }

  public async getUserByUsername(username: string, request: any, altUserRoles) {
    const data = {
      query: `query GetUserByUsername($username:String) {
        Users(where: {username: {_eq: $username}}){
          userId
          name
          username
          email
          mobile
          gender
          dateOfBirth
          role
          status
          createdAt
          updatedAt
          createdBy
          updatedBy
        }
      }
      `,
      variables: { username: username },
    };

    const headers = {
      Authorization: request.headers.authorization,
      "x-hasura-role": getUserRole(altUserRoles),
      "Content-Type": "application/json",
    };

    const config = {
      method: "post",
      url: process.env.REGISTRYHASURA,
      headers: headers,
      data: data,
    };

    const response = await this.axios(config);

    if (response?.data?.errors) {
      return new ErrorResponse({
        errorCode: response.data.errors[0].extensions,
        errorMessage: response.data.errors[0].message,
      });
    } else {
      const result = response.data.data.Users;
      const userData = await this.mappedResponse(result, false);
      return new SuccessResponse({
        statusCode: response.status,
        message: "Ok.",
        data: userData[0],
      });
    }
  }
}
