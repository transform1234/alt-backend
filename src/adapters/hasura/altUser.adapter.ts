import { Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { SuccessResponse } from "src/success-response";
import { ResponseUserDto, UserDto } from "src/altUser/dto/alt-user.dto";
import jwt_decode from "jwt-decode";
import { UserSearchDto } from "src/user/dto/user-search.dto";
import { ErrorResponse } from "src/error-response";
import pkg from "pg";
const { Pool } = pkg;
import {
  getUserRole,
  getToken,
  createUserInKeyCloak,
  getUsername,
  encryptPassword,
  getPassword,
  checkIfUsernameExistsInKeycloak,
  deactivateUserInKeycloak,
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
          GroupMemberships(where: {status: {_eq: true}}) {
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
    console.log("decoded", decoded);
    const altUserRoles =
      decoded["https://hasura.io/jwt/claims"]["x-hasura-allowed-roles"];

    const userId = decoded["https://hasura.io/jwt/claims"]["x-hasura-user-id"];
    userDto.createdBy = userId;
    userDto.updatedBy = userId;

    if (!bulkToken) {
      const response = await getToken(); // generating if required
      bulkToken = response.data.access_token;
    }
    userDto.username = userDto.username.replace(/^\s*$|\n/g, "");

    if (!userDto.username) {
      userDto.username = await this.getUsername(userDto, request, altUserRoles);
    }

    if (!userDto.email) {
      userDto.email = userDto.username + "@yopmail.com";
    }
    if (!userDto.password) {
      userDto.password = userDto.username;
    }

    const userSchema = new UserDto(userDto, true);

    console.log("userSchema", userSchema);

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
          // console.log(usernameExistsInDB, "usernameExistsInDB");
          return {
            user: usernameExistsInDB,
            isNewlyCreated: false,
          };
        } else {
          // const userSchema = new UserDto(userDto, true);
          // console.log(usernameExistsInDB, "username not exist in db");
          const resetPasswordRes: any = await this.resetKeycloakPassword(
            request,
            bulkToken,
            userDto.password,
            null,
            usernameExistsInKeycloak?.data[0]?.id
          );

          // console.log(resetPasswordRes ,"pres");
          if (resetPasswordRes.statusCode !== 204) {
            return new ErrorResponse({
              errorCode: "400",
              errorMessage: "Something went wrong in password reset",
            });
          }
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
      // console.log("not present in keycloak");
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
          console.error(resKeycloak?.response?.data?.errorMessage);
          return new ErrorResponse({
            errorCode: "400",
            errorMessage:
              "Keycloak user creation failed " +
              resKeycloak?.response?.data?.errorMessage,
          });
        }
        // db??
        const databaseResponse = await this.createUserInDatabase(
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
    keycloakUserId,
    altUserRoles
  ) {
    const encryptedPassword = userDto["password"];
    const encPass = encryptedPassword.toString();

    let query = "";
    Object.keys(userDto).forEach((e) => {
      if (userDto[e] !== "" && Object.keys(userSchema).includes(e)) {
        if (e === "role") {
          query += `${e}: ${userDto[e]},`;
        } else if (e === "password") {
          query += `${e}: "${encPass}",`;
        } else if (Array.isArray(userDto[e])) {
          query += `${e}: ${JSON.stringify(userDto[e])}, `;
        } else {
          query += `${e}: ${JSON.stringify(userDto[e])}, `;
        }
      }
    });

    // Add userId created in keycloak as user Id of ALT user in database
    query += `userId: "${keycloakUserId}"`;
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

    const userSchema = new ALTUserUpdateDto(userUpdateDto);
    let userUpdate = "";
    Object.keys(userUpdateDto).forEach((e) => {
      if (userUpdateDto[e] !== "" && Object.keys(userSchema).includes(e)) {
        if (Array.isArray(userUpdateDto[e])) {
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
        Users(where: {username: {_eq: $username}, status: {_eq: true}}) {
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
          GroupMemberships(where: {status: {_eq: true}}) {
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

  public async getUserByUsername(
    username: string,
    request: any,
    altUserRoles: string[]
  ) {
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
          GroupMemberships(where: {status: {_eq: true}}) {
            groupMembershipId
            role
            schoolUdise
            userId
            status
            groupId
          }
        }
      }`,
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
      const result: any[] = response.data.data.Users;
      // const userData = await this.mappedResponse(result, false);
      return new SuccessResponse({
        statusCode: response.status,
        message: "Ok.",
        data: result[0],
      });
    }
  }

  public async resetKeycloakPassword(
    request: any,
    bulkToken: string,
    newPassword: string,
    username: string,
    userId: string
  ) {
    const decoded: any = jwt_decode(request.headers.authorization);
    const altUserRoles =
      decoded["https://hasura.io/jwt/claims"]["x-hasura-allowed-roles"];

    if (!userId) {
      const userData: any = await this.getUserByUsername(
        username,
        request,
        altUserRoles
      );
      if (userData?.data?.userId) {
        userId = userData.data.userId;
      } else {
        return new ErrorResponse({
          errorCode: `404`,
          errorMessage: "User with given username not found",
        });
      }
    }
    const data = JSON.stringify({
      temporary: "false",
      type: "password",
      value: newPassword,
    });

    if (!bulkToken) {
      const response = await getToken();
      bulkToken = response.data.access_token;
    }

    let apiResponse;

    const config = {
      method: "put",
      url: process.env.ALTKEYCLOAK + "/" + userId + "/reset-password",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + bulkToken,
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

  public async resetUserPassword(
    request: any,
    password: string,
    username: string
  ) {
    const decoded: any = jwt_decode(request.headers.authorization);
    const altUserRoles =
      decoded["https://hasura.io/jwt/claims"]["x-hasura-allowed-roles"];
    let userId;

    const userData: any = await this.getUserByUsername(
      username,
      request,
      altUserRoles
    );
    if (userData?.data?.userId) {
      userId = userData.data.userId;
    } else {
      return new ErrorResponse({
        errorCode: `404`,
        errorMessage: "User with given username not found",
      });
    }
    const resetPasswordRes: any = await this.resetKeycloakPassword(
      request,
      null,
      password,
      null,
      userId
    );

    if (resetPasswordRes.statusCode !== 204) {
      return new ErrorResponse({
        errorCode: "400",
        errorMessage: "Something went wrong in password reset",
      });
    }
    const encryptedPassword = await encryptPassword(password);

    const encPass = encryptedPassword.toString();

    const userPasswordSchema = new ALTUserUpdateDto({ password: encPass });

    const updatedPassword: any = await this.updateUser(
      userId,
      request,
      userPasswordSchema
    );

    if (updatedPassword.statusCode === 200) {
      return new SuccessResponse({
        statusCode: updatedPassword.statusCode,
        message: "Password reset successful!",
      });
    } else {
      return new ErrorResponse({
        errorCode: "400",
        errorMessage: "Something went wrong in password reset",
      });
    }
  }

  async deactivateUser(userNames: string[], request: any) {
    try {
      const decoded: any = jwt_decode(request.headers.authorization);
      const altUserRoles =
        decoded["https://hasura.io/jwt/claims"]["x-hasura-allowed-roles"];

      const updatedUsers = await this.deactivateInDatabase(
        request,
        altUserRoles,
        userNames
      );

      let userIdList: any[] = [];
      if (
        updatedUsers instanceof SuccessResponse &&
        updatedUsers?.data?.affected_rows > 0
      ) {
        userIdList = updatedUsers?.data?.returning.filter(
          ({ userId, status }) => {
            if (!status) return userId;
          }
        );
      }

      if (!userIdList.length) {
        return new ErrorResponse({
          errorCode: "404",
          errorMessage: "Users Not found",
        });
      }

      const response = await getToken();
      const adminToken = response.data.access_token;

      const userDeactivatePromises = userIdList.map(({ userId }) =>
        deactivateUserInKeycloak(userId, adminToken)
      );
      const responses = await Promise.allSettled(userDeactivatePromises).then(
        (results) => results
      );

      const responseValues = responses.reduce(
        (allResponses, promise) => {
          if (promise.status === "rejected") {
            allResponses.errorRecords = allResponses.errorRecords + 1;
          } else {
            allResponses.successRecords = allResponses.successRecords + 1;
          }
          return allResponses;
        },
        { successRecords: 0, errorRecords: 0 }
      );

      return new SuccessResponse({
        statusCode: response.status,
        message: "Ok.",
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

  async deactivateInDatabase(
    request: any,
    altUserRoles: string[],
    usernames: string[]
  ) {
    const data = {
      query: `mutation UserDeactivate($usernameList:[String!]) {
        update_Users(where: {username: {_in: $usernameList}}, _set: {status: false}) {
          affected_rows
          returning {
            userId
          }
        }
      }`,
      variables: { usernameList: usernames },
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
      const result = response.data.data.update_Users;
      // const userData = await this.mappedResponse(result, false);
      return new SuccessResponse({
        statusCode: response.status,
        message: "Ok.",
        data: result,
      });
    }
  }
  public async getUsername(obj, request, altUserRoles) {
    const [firstName, lastName] = obj.name.split(" ");

    // Step 1: Extract initials
    const initials = `${firstName[0].toLowerCase()}${
      lastName ? lastName[0].toLowerCase() : ""
    }`;

    const dob = obj.dateOfBirth
      .trim()
      .replace(/^(\d{4})-(\d{2})-(\d{2})$/, "$3$2$1"); // Convert to ddmmyyyy

    // Step 3: Create the base username
    let initialUsername = `${initials}${dob}`;

    const uniqueUsername = await this.ensureUniqueUsername(
      initialUsername,
      request,
      altUserRoles
    );

    return uniqueUsername;
  }
  async ensureUniqueUsername(baseUsername, request, altUserRoles) {
    let username = baseUsername;
    let count = 0; // Start count from 0, to get "01" suffix for the first increment

    // Check if the exact base username is taken
    while (await this.isUsernameTaken(username, request, altUserRoles)) {
      // Increment count and format it as "01", "02", etc.
      count++;
      const suffix = String(count).padStart(2, "0"); // Formats as "01", "02", etc.
      username = `${baseUsername}${suffix}`;
    }

    return username;
  }

  // Function to check if a username is taken in the database
  async isUsernameTaken(username, request, altUserRoles) {
    const data = {
      query: `query GetUserByUsername($username:String) {
        Users(where: {username: {_eq: $username}}) {
          userId
        }
      }`,
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
    return response.data.data.Users.length > 0; // Returns true if username is taken
  }
  // public async validateToken(request: any, res: any) {
  //   // Check if Authorization header exists
  //   const authToken = request.headers.authorization;
  //   if (!authToken) {
  //     return res.status(400).send({
  //       success: false,
  //       status: "Unauthorized",
  //       message: "Authorization header is missing",
  //       data: null,
  //     });
  //   }

  //   // Check if token starts with 'Bearer' and has a token
  //   if (!authToken.startsWith("Bearer ")) {
  //     return res.status(400).send({
  //       success: false,
  //       status: "Unauthorized",
  //       message:
  //         "Authorization token must be in the form of 'Bearer <token>' in the headers",
  //       data: null,
  //     });
  //   }

  //   const token = authToken.split(" ")[1]; // Extract the token part

  //   try {
  //     //Keycloak api to validate token
  //     const keycloakResponse = await this.axios({
  //       method: "GET",
  //       url: `${process.env.URL}/auth/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/userinfo`,
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //       },
  //     });

  //     // If the token is valid, process the response
  //     const userInfo = keycloakResponse.data;
  //     console.log("userInfo", userInfo)

  //     if(!userInfo) {
  //       return res.status(400).send({
  //         success: false,
  //         status: "Unauthorized",
  //         message: "Invalid token",
  //         data: null,
  //       });
  //     }

  //     // Extract roles and username from the Keycloak response
  //     // const altUserRoles = userInfo["https://hasura.io/jwt/claims"]["x-hasura-allowed-roles"];
  //     // const username = userInfo.preferred_username;

  //     // Decode the token
  //     const decoded: any = jwt_decode(token);
  //     //Check if token has expired
  //     const currentTimestamp = Math.floor(Date.now() / 1000); // Get current timestamp in seconds
  //     if (decoded.exp && decoded.exp < currentTimestamp) {
  //       return res.status(401).send({
  //         success: false,
  //         status: "Unauthorized",
  //         message: "Token has expired",
  //         data: null,
  //       });
  //     }

  //     // Extract roles and username
  //     const altUserRoles =
  //       decoded["https://hasura.io/jwt/claims"]["x-hasura-allowed-roles"];
  //     const username = decoded.preferred_username;

  //     //  Prepare GraphQL request data
  //     const data = {
  //       query: `query searchUser($username: String) {
  //                   Users(where: {username: {_eq: $username}, status: {_eq: true}}) {
  //                     userId
  //                     name
  //                     username
  //                     email
  //                     mobile
  //                     gender
  //                     dateOfBirth
  //                     role
  //                     status
  //                     createdAt
  //                     updatedAt
  //                     createdBy
  //                     updatedBy
  //                     GroupMemberships(where: {status: {_eq: true}}) {
  //                       Group {
  //                         board
  //                         medium
  //                         grade
  //                         groupId
  //                       }
  //                     }
  //                     Student {
  //                       School {
  //                         name
  //                         udiseCode
  //                       }
  //                     }
  //                   }
  //                 }
  // `,
  //       variables: { username: username },
  //     };

  //     const config = {
  //       method: "post",
  //       url: process.env.ALTHASURA,
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //         "x-hasura-role": getUserRole(altUserRoles),
  //         "Content-Type": "application/json",
  //       },
  //       data: data,
  //     };

  //     console.log(altUserRoles);

  //     //  Send GraphQL request
  //     const response = await this.axios(config);

  //     // Handle errors in the response
  //     if (response?.data?.errors) {
  //       return res.status(401).send({
  //         success: false,
  //         status: "Unauthorized",
  //         message: "INVALID",
  //         data: response.data.errors.data[0].message,
  //       });
  //     } else {
  //       // Return successful response
  //       const result = response.data.data.Users;
  //       return res.status(200).send({
  //         success: true,
  //         status: "Authenticated",
  //         message: "SUCCESS",
  //         data: result,
  //       });
  //     }
  //   } catch (error) {
  //     // Handle any errors, including invalid token
  //     return res.status(400).send({
  //       success: false,
  //       status: "Unauthorized",
  //       message: "Invalid token",
  //       data: null,
  //     });
  //   }
  // }

  async validateToken(request: any, res: any) {
    try {
      // Extract the Authorization header
      const authToken = request.headers.authorization;
      if (!authToken) {
        return this.sendErrorResponse(
          res,
          400,
          "Authorization header is missing"
        );
      }

      // Ensure token starts with "Bearer "
      if (!authToken.startsWith("Bearer ")) {
        return this.sendErrorResponse(
          res,
          400,
          "Authorization token must be in the form of 'Bearer <token>'"
        );
      }

      // Extract token
      const token = authToken.split(" ")[1];

      // Validate token using Keycloak
      const userInfo = await this.validateWithKeycloak(token);
      if (!userInfo) {
        return this.sendErrorResponse(res, 401, "Invalid token");
      }

      console.log("userInfo", userInfo);

      // Decode the token
      const decoded: any = jwt_decode(token);
      const currentTimestamp = Math.floor(Date.now() / 1000);
      if (decoded.exp && decoded.exp < currentTimestamp) {
        return this.sendErrorResponse(res, 401, "Token has expired");
      }

      // Extract user roles and username
      const roles =
        decoded["https://hasura.io/jwt/claims"]["x-hasura-allowed-roles"];
      const username = decoded.preferred_username;

      // Fetch Teacher data with currentRole
      if (roles[0] === "teacher") {
        console.log("fetchTeacherUserData");

        const userData = await this.fetchTeacherUserData(
          username,
          token,
          roles
        );
        if (!userData) {
          return this.sendErrorResponse(res, 404, "User not found or inactive");
        }

        // Send success response
        return this.sendSuccessResponse(res, 200, "Authenticated", userData);
      }

      // Fetch user details from GraphQL
      const userData = await this.fetchUserData(username, token, roles);
      if (!userData) {
        return this.sendErrorResponse(res, 404, "User not found or inactive");
      }

      // Fetch user points
      const userPoints = await this.getUserPoints(request, token);

      console.log("userPoints", userPoints);

      // Append points to user data if available
      if (userPoints) {
        userData[0].points = userPoints.aggregate.sum.points;
      } else {
        userData[0].points = 0;
      }

      // Send success response
      return this.sendSuccessResponse(res, 200, "Authenticated", userData);
    } catch (error) {
      console.error("Error validating token:", error.message);
      return this.sendErrorResponse(res, 400, "Invalid token");
    }
  }

  async validateWithKeycloak(token: string) {
    try {
      const response = await this.axios({
        method: "GET",
        url: `${process.env.URL}/auth/realms/hasura-app/protocol/openid-connect/userinfo`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Keycloak validation error:", error.message);
      return null;
    }
  }

  async fetchUserData(username: string, token: string, roles: string[]) {
    console.log("fetchUserData username", username);
    const query = {
      query: `
      query searchUser($username: String!) {
        Users(where: {username: {_eq: $username}, status: {_eq: true}}) {
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
          GroupMemberships(where: {status: {_eq: true}}) {
            Group {
              board
              medium
              grade
              groupId
              schoolUdise
            }
            School {
              name
              udiseCode
            }
          }
        }
      }
    `,
      variables: { username },
    };

    const config = {
      method: "post",
      url: process.env.ALTHASURA,
      headers: {
        Authorization: `Bearer ${token}`,
        "x-hasura-role": getUserRole(roles),
        "Content-Type": "application/json",
      },
      data: query,
    };

    try {
      const response = await this.axios(config);
      console.log("response.data.data", response.data);
      if (response.data.data.Users[0].role === "teacher") {
        return this.fetchTeacherRole(username, token, roles);
      }
      return response.data.data.Users || null;
    } catch (error) {
      console.error("GraphQL fetch error:", error.message);
      return null;
    }
  }

  async fetchTeacherRole(username: string, token: string, roles: string[]) {
    console.log("fetchUserData username", username);
    const query = {
      query: `
      query searchUser($username: String!) {
        Users(where: {username: {_eq: $username}, status: {_eq: true}}) {
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
          Teachers {
            currentRole
          }
          GroupMemberships(where: {status: {_eq: true}}) {
            Group {
              board
              medium
              grade
              groupId
              schoolUdise
            }
            School {
              name
              udiseCode
            }
          }
        }
      }
    `,
      variables: { username },
    };

    const config = {
      method: "post",
      url: process.env.ALTHASURA,
      headers: {
        Authorization: `Bearer ${token}`,
        "x-hasura-role": getUserRole(roles),
        "Content-Type": "application/json",
      },
      data: query,
    };

    try {
      const response = await this.axios(config);
      console.log("response.data.data", response.data);

      console.log("response.data.data", response.data);
      return response.data.data.Users || null;
    } catch (error) {
      console.error("GraphQL fetch error:", error.message);
      return null;
    }
  }

  async fetchTeacherUserData(username: string, token: string, roles: string[]) {
    console.log("fetchTeacherUserData username", username);
    const query = {
      query: `
      query searchUser($username: String!) {
        Users(where: {username: {_eq: $username}, status: {_eq: true}}) {
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
          Teachers {
            currentRole
          }
          GroupMemberships(where: {status: {_eq: true}}, order_by: {Group: {grade: desc}}) {
            Group {
              board
              medium
              grade
              groupId
              schoolUdise
            }
            School {
              name
              udiseCode
            }
          }
        }
      }
    `,
      variables: { username },
    };

    const config = {
      method: "post",
      url: process.env.ALTHASURA,
      headers: {
        Authorization: `Bearer ${token}`,
        "x-hasura-role": getUserRole(roles),
        "Content-Type": "application/json",
      },
      data: query,
    };

    try {
      const response = await this.axios(config);
      console.log("response.data.data", response.data);
      return response.data.data.Users || null;
    } catch (error) {
      console.error("GraphQL fetch error:", error.message);
      return null;
    }
  }

  async getUserPoints(request: any, token: string) {
    const decoded: any = jwt_decode(token);
    const userId = decoded["https://hasura.io/jwt/claims"]["x-hasura-user-id"];

    const query = {
      query: `
      query MyQuery($userId: uuid!) {
        UserPoints_aggregate(where: {user_id: {_eq: $userId}}) {
          aggregate {
            sum {
              points
            }
          }
        }
      }
    `,
      variables: { userId },
    };

    const config = {
      method: "post",
      url: process.env.ALTHASURA,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      data: query,
    };

    try {
      const response = await this.axios(config);
      console.log("response", response.data);
      return response.data.data.UserPoints_aggregate || {};
    } catch (error) {
      console.error("Error fetching user points:", error.message);
      return [];
    }
  }

  sendErrorResponse(res: any, statusCode: number, message: string) {
    return res.status(statusCode).send({
      success: false,
      status: "Unauthorized",
      message,
      data: null,
    });
  }

  sendSuccessResponse(
    res: any,
    statusCode: number,
    message: string,
    data: any
  ) {
    return res.status(statusCode).send({
      success: true,
      status: "Authenticated",
      message,
      data,
    });
  }
  public async deleteUser(request, deleteSecretKey, data) {
    if (!request.headers.authorization) {
      return {
        success: false,
        message: "Authorization token is required",
      };
    }

    const userToken = request.headers.authorization.split(" ")[1];
    const decodedToken: any = jwt_decode(userToken);
    const altUserRoles =
      decodedToken["https://hasura.io/jwt/claims"]["x-hasura-allowed-roles"];
    console.log("altUserRoles->>>>>", altUserRoles);

    // Check for systemAdmin role
    const hasSystemAdminRole =
      decodedToken?.resource_access?.["hasura-app"]?.roles?.includes(
        "systemAdmin"
      );
    if (!hasSystemAdminRole) {
      return {
        success: false,
        message: "Only system administrators can delete users",
        status: 403,
      };
    }
    console.log("provided key->>>", deleteSecretKey);

    // Verify delete API secret
    if (!deleteSecretKey || deleteSecretKey !== process.env.DELETE_API_SECRET) {
      console.log("KEY NOT MATCHED");

      return {
        success: false,
        message: "Invalid or missing Secret Key",
        status: 403,
      };
    }
    const adminTokenResponse = await this.axios({
      method: "post",
      url: `${process.env.ALTKEYCLOAKURL}realms/master/protocol/openid-connect/token`,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: new URLSearchParams({
        grant_type: "password",
        client_id: "admin-cli",
        username: process.env.KEYCLOAK_USERNAME,
        password: process.env.KEYCLOAK_PASSWORD,
      }).toString(),
    });

    const adminToken = adminTokenResponse.data.access_token;

    const deletedRecords = [];
    const tables = [
      "CourseProgressTracking",
      "ModuleProgressTracking",
      "LessonProgressTracking",
      "LessonProgressAttemptTracking",
      "GroupMembership",
      "Students",
      "Teachers",
      "Users",
      "GlaLikedContents",
      "GlaQuizRating",
    ];

    const { usernames } = data;

    if (!usernames || usernames.length === 0) {
      return {
        success: false,
        message: "No usernames provided",
      };
    }

    for (const username of usernames) {
      const recordStatus = {
        username,
        kcDeleted: false,
        dbDeleted: false,
        telemetryDeleted: 0,
        error: null,
      };

      try {
        console.log(`Searching for user ${username} in Keycloak`);
        const searchUrl = `${process.env.ALTKEYCLOAKURL}admin/realms/hasura-app/users`;
        const userSearchResponse = await this.axios({
          method: "get",
          url: searchUrl,
          params: { exact: true, username },
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminToken}`,
          },
        });
        // if (!userSearchResponse.data || userSearchResponse.data.length === 0) {
        //   deletedRecords.push({
        //     ...recordStatus,
        //     error: `User ${username} not found in Keycloak`,
        //   });
        //   continue;
        // }
        console.log("userSearchResponse->>", userSearchResponse.data);

        let keycloakUserId = userSearchResponse?.data[0]?.id;

        // If Keycloak user is not found, check in Hasura
        if (!keycloakUserId) {
          console.log(
            `User ${username} not found in Keycloak, checking Hasura`
          );
          const hasuraQuery = {
            query: `
            query GetUser($username: String ) {
              Users(where: {username: {_eq: $username}}){
                userId
              }
            }`,
            variables: { username },
          };
          const hasuraResponse = await this.axios({
            method: "post",
            url: process.env.HASURAURL,
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${userToken}`,
            },
            data: hasuraQuery,
          });

          if (
            hasuraResponse.data &&
            hasuraResponse.data.data &&
            hasuraResponse.data.data.Users.length > 0
          ) {
            keycloakUserId = hasuraResponse.data.data.Users[0].userId;
            console.log(
              `User ${username} found in Hasura with userId: ${keycloakUserId}`
            );
          } else {
            deletedRecords.push({
              ...recordStatus,
              error: `User ${username} not found in Keycloak or Hasura`,
            });
            continue;
          }
        }
        // Delete from database
        try {
          for (const table of tables) {
            const deleteQuery = {
              query: `
              mutation Delete${table} {
                delete_${table}(where: {userId: {_eq: "${keycloakUserId}"}}) {
                  affected_rows
                }
              }`,
            };
            const response = await this.axios({
              method: "post",
              url: process.env.HASURAURL,
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${userToken}`,
              },
              data: deleteQuery,
            });

            if (response.data.errors) {
              console.log(response.data.errors);

              throw new Error(`Failed to delete from ${table}`);
            }
          }
          recordStatus.dbDeleted = true;
        } catch (dbError) {
          console.error(
            `Database deletion failed for user ${username}:`,
            dbError.message
          );
          continue;
        }

        // Delete from Keycloak only if user was found there
        if (userSearchResponse?.data.length > 0) {
          try {
            await this.axios({
              method: "delete",
              url: `${searchUrl}/${keycloakUserId}`,
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${adminToken}`,
              },
            });
            recordStatus.kcDeleted = true;
          } catch (kcError) {
            console.error(
              `Keycloak deletion failed for user ${username}:`,
              kcError.message
            );
          }
        } else {
          console.log(
            `Skipping Keycloak deletion for ${username} as user was not found there`
          );
        }

        // Delete from telemetry
        try {
          // Create connection string using environment variables
          const connectionString =
            process.env.TELEMETRY_DB_URL ||
            `postgres://${process.env.TELEMETRY_DB_USER}:${encodeURIComponent(
              process.env.TELEMETRY_DB_PASSWORD
            )}@${process.env.TELEMETRY_DB_HOST}:${
              process.env.TELEMETRY_DB_PORT
            }/${process.env.TELEMETRY_DB_NAME}?sslmode=disable`;

          // Create a connection pool
          const pool = new Pool({
            connectionString,
          });
          let telemetryClient = await pool.connect();

          const deleteTelemetryQuery = `
            DELETE FROM djp_events 
            WHERE message::jsonb -> 'actor' ->> 'id' = $1
          `;
          const telemetryResult = await telemetryClient.query(
            deleteTelemetryQuery,
            [keycloakUserId]
          );
          recordStatus.telemetryDeleted = telemetryResult.rowCount;
          telemetryClient.release();
        } catch (telemetryError) {
          console.error(
            `Telemetry deletion failed for user ${username}:`,
            telemetryError.message
          );
        }

        deletedRecords.push(recordStatus);
      } catch (error) {
        console.error(`Failed to process user ${username}:`, error.message);
        deletedRecords.push({ ...recordStatus, error: error.message });
      }
    }

    return {
      success: true,
      message: "User deletions completed",
      deletedRecords,
    };
  }
}
