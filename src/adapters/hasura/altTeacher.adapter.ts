import { Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import jwt_decode from "jwt-decode";
import { SuccessResponse } from "src/success-response";
import { TeacherDto } from "src/altTeacher/dto/alt-teacher.dto";
import { ErrorResponse } from "src/error-response";
import { decryptPassword, getUserRole } from "./adapter.utils";
import { ALTHasuraUserService } from "./altUser.adapter";
import { GroupMembershipService } from "./groupMembership.adapter";
import { GroupMembershipDtoById } from "src/groupMembership/dto/groupMembership.dto";

@Injectable()
export class ALTTeacherService {
  constructor(
    private httpService: HttpService,
    private userService: ALTHasuraUserService,
    private groupMembershipService: GroupMembershipService
  ) {}

  baseURL = process.env.ALTHASURA;
  adminSecret = process.env.ADMINSECRET;
  axios = require("axios");

  public async getTeacher(userId: any, request: any) {
    const decoded: any = jwt_decode(request.headers.authorization);
    const altUserRoles =
      decoded["https://hasura.io/jwt/claims"]["x-hasura-allowed-roles"];

    const data = {
      query: `query getTeacher($userId:uuid!) {
      Teachers(where: {userId: {_eq: $userId}}) {
        teacherId
        educationalQualification
        currentRole
        natureOfAppointment
        appointedPost
        totalTeachingExperience
        totalHeadteacherExperience
        classesTaught
        coreSubjectTaught
        attendedInserviceTraining
        lastTrainingAttendedTopic
        lastTrainingAttendedYear
        trainedInComputerDigitalteaching
        schoolUdise
        groups
        board
        createdBy
        updatedBy
        createdAt
        updatedAt
        user {
          userId
          email
          dateOfBirth
          gender
          mobile
          name
          role
          username
        }
      }
    }`,
      variables: { userId: userId },
    };

    const config = {
      method: "post",
      url: this.baseURL,
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

    const responseData = response.data.data.Teachers;

    const teacherResponse = await this.mappedResponse(responseData);
    return new SuccessResponse({
      statusCode: 200,
      message: "Teacher found Successfully",
      data: teacherResponse[0],
    });
  }

  public async createAndAddToGroup(
    request: any,
    teacherDto: TeacherDto,
    bulkToken: string
  ) {
    const decoded: any = jwt_decode(request.headers.authorization);
    const altUserRoles =
      decoded["https://hasura.io/jwt/claims"]["x-hasura-allowed-roles"];

    const creatorUserId =
      decoded["https://hasura.io/jwt/claims"]["x-hasura-user-id"];

    teacherDto.createdBy = creatorUserId;
    teacherDto.updatedBy = creatorUserId;
    teacherDto.role = "teacher";

    if (!teacherDto.groups.length) {
      return new ErrorResponse({
        errorCode: "400",
        errorMessage: "Please add atleast one group",
      });
    }
    let createdUser;
    try {
      if (altUserRoles.includes("systemAdmin")) {
        const newCreatedUser: any = await this.createTeacher(
          request,
          teacherDto,
          bulkToken
        );
        if (newCreatedUser.statusCode === 200) {
          createdUser = newCreatedUser.data;
          createdUser.groupAddResponse = await this.addToGroups(
            teacherDto,
            request
          );

          return new SuccessResponse({
            statusCode: 200,
            message: "Ok.",
            data: createdUser,
          });
        } else {
          return new ErrorResponse({
            errorCode: "500",
            errorMessage: "Create and add to group failed",
          });
        }
      }
    } catch (error) {
      const response = {
        msg: "Create and add to group failed",
        error,
      };
      console.log(response);
      return new ErrorResponse({
        errorCode: "500",
        errorMessage: response.msg,
      });
    }
  }

  public async createTeacher(
    request: any,
    teacherDto: TeacherDto,
    bulkToken: string
  ) {
    const decoded: any = jwt_decode(request.headers.authorization);
    const altUserRoles =
      decoded["https://hasura.io/jwt/claims"]["x-hasura-allowed-roles"];

    const creatorUserId =
      decoded["https://hasura.io/jwt/claims"]["x-hasura-user-id"];

    teacherDto.createdBy = creatorUserId;
    teacherDto.updatedBy = creatorUserId;
    teacherDto.role = "teacher";

    if (altUserRoles.includes("systemAdmin")) {
      const createdUser: any = await this.userService.checkAndAddUser(
        request,
        teacherDto,
        bulkToken
      );

      if (createdUser.statusCode === 200) {
        teacherDto.userId = createdUser.data.userId;
        const teacherSchema = new TeacherDto(teacherDto, false);
        let query = "";

        Object.keys(teacherDto).forEach((e) => {
          if (
            (teacherDto[e] || teacherDto[e] === 0) &&
            teacherDto[e] !== "" &&
            e != "password" &&
            e !== "groups" &&
            Object.keys(teacherSchema).includes(e)
          ) {
            if (Array.isArray(teacherDto[e])) {
              query += `${e}: \"${JSON.stringify(teacherDto[e])
                .replace("[", "{")
                .replace("]", "}")
                .replace(/\"/g, "")}\", `;
            } else {
              query += `${e}: ${JSON.stringify(teacherDto[e])}, `;
            }
          }
        });

        const data = {
          query: `mutation CreateTeacher {
            insert_Teachers_one(object: {${query}}) {
              teacherId
              userId
              schoolUdise
              user {
                username
              }
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
          console.log(response.data.errors);
          return new ErrorResponse({
            errorCode: response.data.errors[0].extensions,
            errorMessage: response.data.errors[0].message,
          });
        } else {
          const result = response.data.data.insert_Teachers_one;
          return new SuccessResponse({
            statusCode: 200,
            message: "Ok.",
            data: result,
          });
        }
      } else {
        return new ErrorResponse({
          errorCode: "500",
          errorMessage: createdUser?.errorMessage,
        });
      }
    } else {
      return new ErrorResponse({
        errorCode: "401",
        errorMessage: "Unauthorized",
      });
    }
  }

  updateTeacher(id: string, request: any, teacherDto: TeacherDto) {}

  public async searchTeacher(request: any, teacherSearchDto: any) {
    // const axios = require("axios");
    const decoded: any = jwt_decode(request.headers.authorization);
    const altUserRoles =
      decoded["https://hasura.io/jwt/claims"]["x-hasura-allowed-roles"];
    var axios = require("axios");
    let offset = 0;
    if (teacherSearchDto.page > 1) {
      offset = teacherSearchDto.limit * (teacherSearchDto.page - 1);
    }

    let query = "";

    Object.keys(teacherSearchDto.filters).forEach((e) => {
      if (teacherSearchDto.filters[e] && teacherSearchDto.filters[e] != "") {
        if (e === "teacherId") {
          query += `${e}:{_eq: "%${teacherSearchDto.filters[e]}%"}`;
        } else {
          query += `${e}:{_ilike:"${teacherSearchDto.filters[e]}"}`;
        }
      }
    });
    var data = {
      query: `query SearchStudent($limit:Int, $offset:Int) {
        Teachers_aggregate {
          aggregate {
            count
          }
        }
        Teachers(where:{ ${query}}, limit: $limit, offset: $offset,) {
          teacherId
          educationalQualification
          currentRole
          natureOfAppointment
          appointedPost
          totalTeachingExperience
          totalHeadteacherExperience
          classesTaught
          coreSubjectTaught
          attendedInserviceTraining
          lastTrainingAttendedTopic
          lastTrainingAttendedYear
          trainedInComputerDigitalteaching
          schoolUdise
          groups
          board
          createdBy
          updatedBy
          createdAt
          updatedAt
              user {
                username
                userId
                updatedBy
                updatedAt
                status
                role
                password
                name
                mobile
                gender
                email
                dateOfBirth
                createdBy
                createdAt
              }
            }
          }`,
      variables: {
        limit: parseInt(teacherSearchDto.limit),
        offset: offset,
      },
    };
    const config = {
      method: "post",
      url: this.baseURL,
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

    let result = response.data.data.Teachers;
    const teacherResponse = await this.mappedResponse(result);

    return new SuccessResponse({
      statusCode: 200,
      message: "Ok.",
      data: teacherResponse,
    });
  }

  public async mappedResponse(result: any) {
    const promises = [];
    for (const item of result) {
      const teacherMapping = {
        userId: item?.user?.userId ? `${item.user.userId}` : "",
        password: await decryptPassword(item?.user.password),
        teacherId: item?.teacherId ? `${item.teacherId}` : "",
        groups: item?.groups ? item.groups : [],
        board: item?.board ? `${item.board}` : "",
        schoolUdise: item?.schoolUdise ? item.schoolUdise : "",
        educationalQualification: item?.educationalQualification
          ? `${item.educationalQualification}`
          : "",
        currentRole: item?.currentRole ? `${item.currentRole}` : "",
        natureOfAppointment: item?.natureOfAppointment
          ? `${item.natureOfAppointment}`
          : "",
        appointedPost: item?.appointedPost ? `${item.appointedPost}` : "",
        totalTeachingExperience: item?.totalTeachingExperience
          ? `${item.totalTeachingExperience}`
          : "",
        totalHeadteacherExperience: item?.totalHeadteacherExperience
          ? `${item.totalHeadteacherExperience}`
          : "",
        classesTaught: item?.classesTaught ? item.classesTaught : "",
        coreSubjectTaught: item?.coreSubjectTaught
          ? `${item.coreSubjectTaught}`
          : "",
        attendedInserviceTraining: item?.attendedInserviceTraining
          ? item.attendedInserviceTraining
          : "",
        lastTrainingAttendedTopic: item?.lastTrainingAttendedTopic
          ? `${item.lastTrainingAttendedTopic}`
          : "",
        lastTrainingAttendedYear: item?.lastTrainingAttendedYear
          ? `${item.lastTrainingAttendedYear}`
          : "",
        trainedInComputerDigitalteaching: item?.trainedInComputerDigitalteaching
          ? item.trainedInComputerDigitalteaching
          : 0,
        email: item?.user?.email ? `${item.user.email}` : "",
        dateOfBirth: item?.user?.dateOfBirth ? `${item.user.dateOfBirth}` : "",
        gender: item?.user?.gender ? `${item.user.gender}` : "",
        mobile: item?.user?.mobile ? `${item.user.mobile}` : "",
        name: item?.user?.name ? `${item.user.name}` : "",
        role: item?.user?.role ? `${item.user.role}` : "",
        username: item?.user?.username ? `${item.user.username}` : "",
        createdBy: item?.createdBy ? `${item.createdBy}` : "",
        updatedBy: item?.updatedBy ? `${item.updatedBy}` : "",
        // createdAt: item?.created ? `${item.created}` : "",
        // updatedAt: item?.updated ? `${item.updated}` : "",
      };
      promises.push(new TeacherDto(teacherMapping, true));
      // }      return new TeacherDto(teacherMapping, true);
    }

    const promiseRes = await Promise.all(promises);
    // console.log("303", promiseRes);
    if (promiseRes) {
      return promiseRes;
    }
    // return teacherResponse;
  }

  async addToGroups(teacherDto, request) {
    const groupMembershipIds = [];

    const errors = [];

    try {
      for (const group of teacherDto.groups) {
        const groupMembershipDtoById = new GroupMembershipDtoById(teacherDto);
        groupMembershipDtoById.groupId = group;
        const res: any =
          await this.groupMembershipService.createGroupMembershipById(
            request,
            groupMembershipDtoById
          );

        if (res.statusCode === 200) {
          groupMembershipIds.push({
            msg: `Added to group ${group}`,
            groupMembershipId: res.data.groupMembershipId,
          });
        } else {
          errors.push({
            msg: `Could not add to group ${group} , ${res?.errorMessage}`,
          });
        }
      }
      return {
        groupMembershipIds,
        errors,
      };
    } catch (error) {
      console.log(error);
      return new ErrorResponse({
        errorCode: "500",
        errorMessage: "Error while adding to group",
      });
    }
  }
}
