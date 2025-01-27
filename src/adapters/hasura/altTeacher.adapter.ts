import { Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import jwt_decode from "jwt-decode";
import { SuccessResponse } from "src/success-response";
import { TeacherDto } from "src/altTeacher/dto/alt-teacher.dto";
import { ErrorResponse } from "src/error-response";
import { decryptPassword, getUserRole, getClasses } from "./adapter.utils";
import { ALTHasuraUserService } from "./altUser.adapter";
import { GroupMembershipService } from "./groupMembership.adapter";
import { GroupMembershipDtoById } from "src/groupMembership/dto/groupMembership.dto";
import { HasuraGroupService } from "./group.adapter";
@Injectable()
export class ALTTeacherService {
  constructor(
    private groupService: HasuraGroupService,
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

    if (!bulkToken) {
      let groupRes;
      const teacherClasses = getClasses(teacherDto.classesTaught);
      if (!teacherClasses.length) {
        return new ErrorResponse({
          errorCode: "400",
          errorMessage: "Please add classesTaught",
        });
      }
      // console.log(teacherClasses, "tcs");

      teacherDto.groups = [];

      for (let teacherClass of teacherClasses) {
        groupRes = await this.groupService.getGroupBySchoolClass(
          request,
          teacherDto.schoolUdise,
          teacherClass,
          new Date().getFullYear().toString()
        );
        if (groupRes?.data[0]?.groupId) {
          teacherDto.groups.push(groupRes.data[0].groupId);
        }
      }
      teacherDto.board = groupRes.data[0].board;
    }

    // console.log(teacherDto.groups);

    if (!teacherDto.groups.length) {
      return new ErrorResponse({
        errorCode: "400",
        errorMessage: "Please select Teacher class",
      });
    }

    try {
      if (altUserRoles.includes("systemAdmin")) {
        const newCreatedTeacher: any = await this.createTeacher(
          request,
          teacherDto,
          bulkToken
        );
        // console.log(newCreatedTeacher, "test");
        // console.log(newCreatedTeacher.data?.groups, "test");
        // console.log(teacherDto, "tdto");
        const teachersExistingGroups = newCreatedTeacher.data?.groups.map(
          ({ groupId }) => groupId
        );
        if (
          newCreatedTeacher?.statusCode === 200 &&
          !newCreatedTeacher?.data?.groups[0]?.groupId
        ) {
          // user freshly created till now no group assigned
          teacherDto.userId = newCreatedTeacher?.data?.userId;
          const createdUser = newCreatedTeacher.data;
          createdUser.groupAddResponse = await this.addToGroups(
            teacherDto,
            request
          );
          return new SuccessResponse({
            statusCode: 200,
            message: "Ok.",
            data: createdUser,
          });
        } else if (
          newCreatedTeacher?.data.schoolUdise !== teacherDto.schoolUdise ||
          newCreatedTeacher?.data.classesTaught !== teacherDto.classesTaught
        ) {
          return new ErrorResponse({
            errorCode: "400",
            errorMessage: `Create and add to group failed Old and new school does not match or classes taught does not match,`,
          });
        } else if (
          newCreatedTeacher?.statusCode === 200 &&
          teachersExistingGroups.sort().join(",") ===
            teacherDto?.groups.sort().join(",")
        ) {
          // returns when teacher already exists and old and new group is same
          return newCreatedTeacher;
        } else if (
          newCreatedTeacher?.statusCode === 200 &&
          newCreatedTeacher?.data.schoolUdise === teacherDto.schoolUdise &&
          teachersExistingGroups.sort().join(",") !==
            teacherDto?.groups.sort().join(",")
        ) {
          // old group and new group no longer match
          // deactivate old group membership and add as per new group
          const newGroupMemberships = teacherDto.groups.map((group) => {
            const groupMembershipDtoById = new GroupMembershipDtoById(
              teacherDto
            );
            // because user exists we assign its userId to groupMembershipDtoById
            groupMembershipDtoById.userId = newCreatedTeacher.data.userId;
            groupMembershipDtoById.groupId = group;
            return groupMembershipDtoById;
          });

          const createdUser = newCreatedTeacher.data;
          createdUser.groupModificationResponse =
            await this.groupMembershipService.modifyGroupMembership(
              request,
              newGroupMemberships,
              teachersExistingGroups
            );

          return new SuccessResponse({
            statusCode: 200,
            message: "Ok.",
            data: createdUser,
          });
        } else {
          return new ErrorResponse({
            errorCode: "400",
            errorMessage: `Create and add to group failed,  ${newCreatedTeacher?.errorMessage}`,
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
    let userId;

    if (altUserRoles.includes("systemAdmin")) {
      const createdUser: any = await this.userService.checkAndAddUser(
        request,
        teacherDto,
        bulkToken
      );

      try {
        userId = createdUser?.user.data.userId;
      } catch (e) {
        return createdUser?.user;
      }

      if (!createdUser?.isNewlyCreated) {
        // console.log(createdUser, "created user is old");
        const existingTeacher: any = await this.getTeacherByUserId(
          userId,
          request,
          altUserRoles
        );
        // console.log(existingTeacher, "exts");
        if (existingTeacher?.statusCode === 200) {
          if (existingTeacher?.data) {
            existingTeacher.data.userId = createdUser?.user.data.userId;
            existingTeacher.data.username = createdUser?.user.data.username;
            existingTeacher.data.message = "User Already exists";
            return existingTeacher;
          } else {
            return this.createTeacherInDatabase(
              teacherDto,
              userId,
              request,
              altUserRoles
            );
          }
        }
      } else {
        if (createdUser?.user.statusCode === 200) {
          return this.createTeacherInDatabase(
            teacherDto,
            userId,
            request,
            altUserRoles
          );
        } else {
          return new ErrorResponse({
            errorCode: "500",
            errorMessage: createdUser?.errorMessage,
          });
        }
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
        if (e === "currentRole" || e === "board") {
          query += `${e}:{_ilike:"%${teacherSearchDto.filters[e]?.ilike}%"}`;
        } else {
          query += `${e}:{_eq: "${teacherSearchDto.filters[e]?.eq}"}`;
        }
      }
    });
    var data = {
      query: `query SearchTeacher($limit:Int, $offset:Int) {
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
        password: item?.user.password ? ` ${item.user.password}` : "",
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

  public mappedResponseForTeacher(result: any) {
    const userResponse = result.map((item: any) => {
      const userMapping = {
        userId: item?.userId ? `${item.userId}` : "",
        teacherId: item?.teacherId ? `${item.teacherId}` : "",
        schoolUdise: item?.schoolUdise ? `${item.schoolUdise}` : "",
        classesTaught: item?.classesTaught ? `${item.classesTaught}` : "",
        createdAt: item?.createdAt ? `${item.createdAt}` : "",
        createdBy: item?.createdBy ? `${item.createdBy}` : "",
        groups: item?.user?.GroupMemberships ? item.user.GroupMemberships : [],
        username: item?.user?.username ? item.user.username : "",
      };
      return userMapping;
    });
    return userResponse;
  }

  public async getTeacherByUserId(userId: string, request: any, altUserRoles) {
    const data = {
      query: `query GetTeacherByUserId($userId:uuid!) {
        Teachers(where: {userId: {_eq: $userId}}){
          createdAt
          createdBy
          teacherId
          userId
          schoolUdise
          classesTaught
          user {
            username
            GroupMemberships(where: {status: {_eq: true}}) {
              groupMembershipId
              role
              schoolUdise
              userId
              status
              groupId
              createdAt
            }
          }
        }
      }
      `,
      variables: { userId: userId },
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
      const result = response.data.data.Teachers;

      const userData = this.mappedResponseForTeacher(result);

      return new SuccessResponse({
        statusCode: response.status,
        message: "Ok.",
        data: userData[0],
      });
    }
  }

  public async createTeacherInDatabase(
    teacherDto,
    createdUserId,
    request,
    altUserRoles
  ) {
    teacherDto.userId = createdUserId;
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
          createdAt
          createdBy
          teacherId
          userId
          schoolUdise
          classesTaught
          user {
            username
            GroupMemberships(where: {status: {_eq: true}}) {
              groupMembershipId
              role
              schoolUdise
              userId
              status
              groupId
              createdAt
            }
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
      const userData = this.mappedResponseForTeacher([result]);
      return new SuccessResponse({
        statusCode: 200,
        message: "Ok.",
        data: userData[0],
      });
    }
  }

  public async getSubject(request: any,  groupId, medium, grade, board, schoolUdise) {
    const decoded: any = jwt_decode(request.headers.authorization);
    const altUserRoles = decoded["https://hasura.io/jwt/claims"]["x-hasura-allowed-roles"];
    const altUserId = decoded["https://hasura.io/jwt/claims"]["x-hasura-user-id"];
  
    console.log("altUserRoles", altUserRoles);
    console.log("altUserId", altUserId);
  
    
  
    // const data = {
    //   query: `query getTeacher($userId: uuid!) {
    //     Teachers(where: {userId: {_eq: $userId}}) {
    //       teacherId
    //       educationalQualification
    //       currentRole
    //       natureOfAppointment
    //       appointedPost
    //       totalTeachingExperience
    //       totalHeadteacherExperience
    //       classesTaught
    //       coreSubjectTaught
    //       attendedInserviceTraining
    //       lastTrainingAttendedTopic
    //       lastTrainingAttendedYear
    //       trainedInComputerDigitalteaching
    //       schoolUdise
    //       groups
    //       board
    //       createdBy
    //       updatedBy
    //       createdAt
    //       updatedAt
    //       user {
    //         userId
    //         email
    //         dateOfBirth
    //         gender
    //         mobile
    //         name
    //         role
    //         username
    //       }
    //       Board {
    //         ProgramTermAssocs {
    //           subject
    //           medium
    //           grade
    //           board
    //           progAssocNo
    //           programId
    //         }
    //       }
    //     }
    //   }`,
    //   variables: { userId: altUserId },
    // };

    const data = {
      query: `
        query getTeacher($userId: uuid!, $board: String!, $medium: String!, $grade: String!) {
          Teachers(where: { userId: { _eq: $userId } }) {
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
            Board {
              ProgramTermAssocs(where: { 
                board: { _eq: $board }, 
                grade: { _eq: $grade }, 
                medium: { _eq: $medium } 
              }) {
                subject
                medium
                grade
                board
                progAssocNo
                programId
              }
            }
          }
        }
      `,
      variables: { userId: altUserId, board: board, medium: medium, grade: grade },
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
  
    try {
      const response = await this.axios(config);
  
      if (response?.data?.errors) {
        return new ErrorResponse({
          errorCode: response.data.errors[0].extensions,
          errorMessage: response.data.errors[0].message,
        });
      }
  
      const responseData = response.data.data.Teachers;
  
      console.log("response.data.data.Teachers", responseData);
  
      if (!responseData || responseData.length === 0) {
        return new SuccessResponse({
          statusCode: 200,
          message: "No teacher data found.",
          data: [],
        });
      }
  
      return new SuccessResponse({
        statusCode: 200,
        message: "Teacher found successfully.",
        data: responseData, // Pass the entire array of teacher data
      });
    } catch (error) {
      console.error("Error fetching teacher data:", error.message);
  
      return new ErrorResponse({
        errorCode: "INTERNAL_SERVER_ERROR",
        errorMessage: "Unable to fetch teacher data. Please try again later.",
      });
    }
  }

  public async classProgress(request: any, medium, grade, board) {
   
    const decoded: any = jwt_decode(request.headers.authorization);
    const altUserRoles = decoded["https://hasura.io/jwt/claims"]["x-hasura-allowed-roles"];
    const altUserId = decoded["https://hasura.io/jwt/claims"]["x-hasura-user-id"];
  
    console.log("altUserRoles", altUserRoles);
    console.log("altUserId", altUserId);
  
  
    const data = {
      query: `query getTeacher($medium: String!, $grade: String!, $board: String!) {
        ProgramTermAssoc(where: {medium: {_eq: $medium}, grade: {_eq: $grade}, board: {_eq: $board}}) {
          programId
          grade
          medium
          subject
          board
          rules
        }
      }`,
      variables: { medium: medium,  grade: grade, board: board},
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
  
    try {
      const response = await this.axios(config);
  
      if (response?.data?.errors) {
        return new ErrorResponse({
          errorCode: response.data.errors[0].extensions,
          errorMessage: response.data.errors[0].message,
        });
      }
  
      const responseData = response.data.data;
  
      console.log("response.data.data", responseData);


     // const subjectProgress = await this.subjectProgress(responseData.ProgramTermAssoc[0].rules)
  
      if (!responseData || responseData.length === 0) {
        return new SuccessResponse({
          statusCode: 200,
          message: "No class data found.",
          data: [],
        });
      }
  
      return new SuccessResponse({
        statusCode: 200,
        message: "Class found successfully.",
        data: responseData, // Pass the entire array of teacher data
      });
    } catch (error) {
      console.error("Error fetching Class data:", error.message);
  
      return new ErrorResponse({
        errorCode: "INTERNAL_SERVER_ERROR",
        errorMessage: "Unable to fetch Class data. Please try again later.",
      });
    }
  }

  public async subjectProgress(request, rules, studentDetails) {
    console.log("rules", rules)
    const formattedRules = JSON.parse(rules)
    console.log("formattedRules", formattedRules.prog)

    const lessonProgress = await this.lessonProgress(request, formattedRules.prog[0].contentId, studentDetails.Group[0].GroupMemberships)

    return lessonProgress
  }

  public async lessonProgress(request, contentId, studentDetails) {
    console.log("contentId", contentId)

    console.log("studentDetails", studentDetails[0].User.Student)

    const status = this.getLessonProgressStatus(request, contentId, studentDetails[0].User.Student)

    return status

  }

  public async getGroupId(request, medium, grade, board, schoolUdise) {
    const decoded: any = jwt_decode(request.headers.authorization);
    const altUserRoles = decoded["https://hasura.io/jwt/claims"]["x-hasura-allowed-roles"];
    const altUserId = decoded["https://hasura.io/jwt/claims"]["x-hasura-user-id"];
  
    console.log("altUserRoles", altUserRoles);
    console.log("altUserId", altUserId);
  
    const data = {
      query: `query myQuery($medium: String!, $grade: numeric!, $board: String!, $schoolUdise: String!) {
        Group(where: {medium: {_eq: $medium}, grade: {_eq: $grade}, board: {_eq: $board}, schoolUdise: {_eq: $schoolUdise}, status: {_eq: true}}) {
          groupId
          grade
          medium
          name
          status
          board
          schoolUdise
          academicYear
        }
      }`,
      variables: { medium: medium,  grade: grade, board: board, schoolUdise: schoolUdise},
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
  
    try {
      const response = await this.axios(config);
  
      if (response?.data?.errors) {
        return new ErrorResponse({
          errorCode: response.data.errors[0].extensions,
          errorMessage: response.data.errors[0].message,
        });
      }
  
      const responseData = response.data.data.Group[0].groupId;
  
      console.log("response.data.data 1009", responseData);
  
      return responseData
    } catch (error) {
      console.error("Error fetching Class data:", error.message);
  
      return new ErrorResponse({
        errorCode: "INTERNAL_SERVER_ERROR",
        errorMessage: "Unable to fetch Class data. Please try again later.",
      });
    }
  }

  // subject wise progress

  public async subjectWiseProgress(request: any, subject, medium, grade, board, schoolUdise) {
    const decoded: any = jwt_decode(request.headers.authorization);
    const altUserRoles = decoded["https://hasura.io/jwt/claims"]["x-hasura-allowed-roles"];
    const altUserId = decoded["https://hasura.io/jwt/claims"]["x-hasura-user-id"];
  
    console.log("altUserRoles", altUserRoles);
    console.log("altUserId", altUserId);


    const studentDetails = await this.getStudentByClassId(request, medium, grade, board, schoolUdise)
    console.log("studentDetails", studentDetails.Group[0].GroupMemberships.length)
    //return studentDetails

    const rules = await this.getRules(request, subject, medium, grade, board, schoolUdise)

    const subjectProgress = await this.subjectProgress(request, rules.ProgramTermAssoc[0].rules, studentDetails)

    return subjectProgress
  
    
  }

  async getStudentByClassId(request, medium, grade, board, schoolUdise) {
    const variables: any = { medium, grade, board, schoolUdise };

    const checkGraphQLQuery = {
      query: `
      query MyQuery( $medium: String!, $grade: numeric!, $board: String!, $schoolUdise: String!) {
        Group(where: {medium: {_eq: $medium}, grade: {_eq: $grade}, board: {_eq: $board}, status: {_eq: true}, schoolUdise: {_eq: $schoolUdise}}) {
          groupId
          grade
          medium
          name
          status
          board
          schoolUdise
          GroupMemberships(where: {role: {_eq: "student"}, status: {_eq: true}}) {
            User {
              Student {
                userId
                user {
                  role
                  name
                  userId
                }
              }
            }
          }
        }
      }
      `,
      variables,
    };

    console.log("checkGraphQLQuery", checkGraphQLQuery);

    const config_data = {
      method: "post",
      url: process.env.ALTHASURA,
      headers: {
        Authorization: request.headers.authorization,
        "Content-Type": "application/json",
      },
      data: checkGraphQLQuery,
    };

    try {
      const checkResponse = await this.axios(config_data);
      const responseData = checkResponse.data.data
      console.log("responseData", responseData);

      return responseData

    } catch (error) {
      console.error("Axios Error:", error.message);
      throw new ErrorResponse({
        errorCode: "AXIOS_ERROR",
        errorMessage: "Failed to execute the GraphQL mutation.",
      });
    }
  }

  public async getRules(request: any, subject, medium, grade, board, schoolUdise) {

    const decoded: any = jwt_decode(request.headers.authorization);
    const altUserRoles = decoded["https://hasura.io/jwt/claims"]["x-hasura-allowed-roles"];
    const altUserId = decoded["https://hasura.io/jwt/claims"]["x-hasura-user-id"];
  
    console.log("altUserRoles", altUserRoles);
    console.log("altUserId", altUserId);

    const data = {
      query: `query myQuery($medium: String!, $grade: String!, $board: String!, $subject:  String!) {
        ProgramTermAssoc(where: {medium: {_eq: $medium}, grade: {_eq: $grade}, board: {_eq: $board}, subject: {_eq: $subject}}) {
          programId
          grade
          medium
          subject
          board
          rules
        }
      }`,
      variables: { medium: medium,  grade: grade, board: board, subject: subject},
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
  
    try {
      const response = await this.axios(config);
  
      const responseData = response.data.data;
  
      console.log("response.data.data", responseData);

      return responseData
      
    } catch (error) {
      console.error("Error fetching Class data:", error.message);
  
      return new ErrorResponse({
        errorCode: "INTERNAL_SERVER_ERROR",
        errorMessage: "Unable to fetch Class data. Please try again later.",
      });
    }
  }

  public async getLessonProgressStatus(request: any, contentId, userId) {
    console.log("contentId", contentId)
    console.log("userId", userId)

    const decoded: any = jwt_decode(request.headers.authorization);
    // const altUserRoles = decoded["https://hasura.io/jwt/claims"]["x-hasura-allowed-roles"];
    // const altUserId = decoded["https://hasura.io/jwt/claims"]["x-hasura-user-id"];
  
    // console.log("altUserRoles", altUserRoles);
    // console.log("altUserId", altUserId);

    const data = {
      query: `query myQuery($contentId: String!, $userId: uuid!) {
        LessonProgressTracking(where: {lessonId: {_eq: $contentId}, userId: {_eq: $userId}, status: {_eq: "completed"}}) {
          courseId
          lessonId
          userId
          status
        }
      }`,
      variables: { contentId: contentId,  userId: userId},
    };
  
    const config = {
      method: "post",
      url: this.baseURL,
      headers: {
        Authorization: request.headers.authorization,
        "Content-Type": "application/json",
      },
      data: data,
    };
  
    try {
      const response = await this.axios(config);
  
      const responseData = response.data;
  
      console.log("responseData", responseData);

      return responseData
      
    } catch (error) {
      console.error("Error fetching Class data:", error.message);
  
      return new ErrorResponse({
        errorCode: "INTERNAL_SERVER_ERROR",
        errorMessage: "Unable to fetch Class data. Please try again later.",
      });
    }
  }
  
}
