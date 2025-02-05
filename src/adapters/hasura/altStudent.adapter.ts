import { Injectable } from "@nestjs/common";
import jwt_decode from "jwt-decode";
import { SuccessResponse } from "src/success-response";
import { StudentDto } from "src/altStudent/dto/alt-student.dto";
import { ErrorResponse } from "src/error-response";
import { decryptPassword, getUserRole } from "./adapter.utils";
import { ALTHasuraUserService } from "./altUser.adapter";
import { GroupMembershipService } from "./groupMembership.adapter";
import { GroupMembershipDtoById } from "src/groupMembership/dto/groupMembership.dto";
import { HasuraGroupService } from "./group.adapter";

@Injectable()
export class ALTStudentService {
  constructor(
    private groupService: HasuraGroupService,
    private userService: ALTHasuraUserService,
    private groupMembershipService: GroupMembershipService
  ) {}

  baseURL = process.env.ALTHASURA;
  adminSecret = process.env.ADMINSECRET;
  axios = require("axios");

  public async getStudent(userId: any, request: any) {
    const decoded: any = jwt_decode(request.headers.authorization);
    const altUserRoles =
      decoded["https://hasura.io/jwt/claims"]["x-hasura-allowed-roles"];

    const data = {
      query: `query getStudent($userId:uuid!) {
      Students(where: {userId: {_eq: $userId}}) {
        annualIncome
        caste
        schoolUdise
        createdAt
        fatherEducation
        fatherOccupation
        updatedAt
        studentId
        religion
        noOfSiblings
        motherOccupation
        motherEducation
        groups
        board
        createdBy
        updatedBy
        studentEnrollId
         user {
          userId
          email
          dateOfBirth
          gender
          mobile
          name
          role
          password
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

    const responseData = response.data.data.Students;

    const studentResponse = await this.mappedResponse(responseData);
    return new SuccessResponse({
      statusCode: 200,
      message: "student found Successfully",
      data: studentResponse[0],
    });
  }

  public async createAndAddToGroup(
    request: any,
    studentDto: StudentDto,
    bulkToken: string
  ) {
    const decoded: any = jwt_decode(request.headers.authorization);
    const altUserRoles =
      decoded["https://hasura.io/jwt/claims"]["x-hasura-allowed-roles"];

    const creatorUserId =
      decoded["https://hasura.io/jwt/claims"]["x-hasura-user-id"];

    let newCreatedStudent: any;
    studentDto.createdBy = creatorUserId;
    studentDto.updatedBy = creatorUserId;
    studentDto.role = "student";

    if (studentDto.username.length && studentDto.promotion === "deactivated") {
      const deactivatedUser: any = await this.userService.deactivateUser(
        [studentDto.username.trim()],
        request
      );

      if (deactivatedUser?.data?.successRecords) {
        return new SuccessResponse({
          statusCode: 200,
          message: "Ok.",
          data: { username: studentDto.username, msg: "User Deactivated" },
        });
      } else {
        return new ErrorResponse({
          errorCode: "400",
          errorMessage: `User does not exist`,
        });
      }
    }

    // if (!bulkToken) {
    // promotion blank means new user
    if (!studentDto.promotion) {
      // when creating student with individual api and bulk both
      const year = studentDto.academicYear || new Date().getFullYear().toString();

      console.log("year", year)
      studentDto.groups = [];
      const groupRes: any = await this.groupService.getGroupBySchoolClass(
        request,
        studentDto.schoolUdise,
        studentDto.className,
        year
      );
      console.log(groupRes);

      if (!groupRes?.data[0]?.groupId) {
        return new ErrorResponse({
          errorCode: "400",
          errorMessage: "No group found for given class and school",
        });
      } else {
        studentDto.board = groupRes.data[0].board;
        studentDto.groups.push(groupRes.data[0].groupId);
        newCreatedStudent = await this.createStudent(
          request,
          studentDto,
          bulkToken
        );
      }
    } else if (studentDto.promotion === "promoted") {
      // promoted
      newCreatedStudent = await this.createStudent(
        request,
        studentDto,
        bulkToken
      );

      // console.log(newCreatedStudent?.data?.groups[0], "gp");

      const currentClass = newCreatedStudent?.data?.groups[0];

      if (!currentClass?.Group?.grade) {
        return new ErrorResponse({
          errorCode: "400",
          errorMessage: "Error getting current grade",
        });
      }

      //  current year matches current academic year
      // if (
      //   currentClass?.Group?.academicYear?.toString() ===
      //   new Date().getFullYear().toString()
      // ) {

      //   return new ErrorResponse({
      //     errorCode: "400",
      //     errorMessage:
      //       "Current Academic year and grade already added (" +
      //       currentClass.Group.academicYear +
      //       "-" +
      //       currentClass.Group.name +
      //       ")",
      //   });
      // }

      const newGrade = Number(currentClass?.Group?.grade) + 1;

      if (newGrade > 10) {
        return new ErrorResponse({
          errorCode: "400",
          errorMessage: "Cannot promote above 10th class",
        });
      }

      studentDto.groups = [];
      const groupRes: any = await this.groupService.getGroupBySchoolClass(
        request,
        currentClass.schoolUdise,
        "Class " + newGrade,
        new Date().getFullYear().toString()
      );

      if (!groupRes?.data[0]?.groupId) {
        return new ErrorResponse({
          errorCode: "400",
          errorMessage: "No group found for given class and school",
        });
      } else {
        studentDto.board = groupRes.data[0].board;
        studentDto.groups.push(groupRes.data[0].groupId);
      }
    } else {
      return new ErrorResponse({
        errorCode: "400",
        errorMessage: "Wrong Input for API",
      });
    }

    if (!studentDto.groups.length) {
      return new ErrorResponse({
        errorCode: "400",
        errorMessage: "Please select Student class",
      });
    }

    try {
      if (altUserRoles.includes("systemAdmin")) {
        // console.log(newCreatedStudent, "test", newCreatedStudent?.data?.groups);
        if (
          newCreatedStudent.statusCode === 200 &&
          !newCreatedStudent?.data?.groups[0]?.groupId
        ) {
          // user freshly created till now no group assigned
          studentDto.userId = newCreatedStudent?.data?.userId;
          const createdUser = newCreatedStudent.data;
          createdUser.groupAddResponse = await this.addToGroups(
            studentDto,
            request
          );
          return new SuccessResponse({
            statusCode: 200,
            message: "Ok.",
            data: createdUser,
          });
        } else if (
          newCreatedStudent?.statusCode === 200 &&
          newCreatedStudent?.data?.groups[0]?.groupId === studentDto?.groups[0]
        ) {
          // returns when student already exists and old and new group is same
          return newCreatedStudent;
        } else if (
          newCreatedStudent?.statusCode === 200 &&
          newCreatedStudent?.data.schoolUdise === studentDto.schoolUdise &&
          newCreatedStudent?.data?.groups[0]?.groupId !== studentDto?.groups[0]
        ) {
          // old group and new group no longer match
          // deactivate old group membership and add as per new group

          const groupMembershipDtoById = new GroupMembershipDtoById(studentDto);
          groupMembershipDtoById.userId = newCreatedStudent.data.userId;
          groupMembershipDtoById.groupId = studentDto.groups[0];

          const createdUser = newCreatedStudent.data;
          createdUser.groupModificationResponse =
            await this.groupMembershipService.modifyGroupMembership(
              request,
              [groupMembershipDtoById],
              [newCreatedStudent?.data?.groups[0]?.groupId]
            );

          return new SuccessResponse({
            statusCode: 200,
            message: "Ok.",
            data: createdUser,
          });
        } else if (
          newCreatedStudent?.data.schoolUdise !== studentDto.schoolUdise
        ) {
          return new ErrorResponse({
            errorCode: "400",
            errorMessage: `Create and add to group failed Old and new school does not match,`,
          });
        } else {
          //console.log(newCreatedStudent, "new Created user");
          return new ErrorResponse({
            errorCode: "400",
            errorMessage: `Create and add to group failed , ${newCreatedStudent?.errorMessage}`,
          });
        }
      } else {
        return new ErrorResponse({
          errorCode: "400",
          errorMessage: "Unauthorized",
        });
      }
    } catch (error) {
      const response = {
        msg: "Create and add to group failed",
        error,
      };
      console.error(response);
      return new ErrorResponse({
        errorCode: "500",
        errorMessage: response.msg + error.toString(),
      });
    }
  }

  public async createStudent(
    request: any,
    studentDto: StudentDto,
    bulkToken: string
  ) {
    const decoded: any = jwt_decode(request.headers.authorization);
    const altUserRoles =
      decoded["https://hasura.io/jwt/claims"]["x-hasura-allowed-roles"];

    const creatorUserId =
      decoded["https://hasura.io/jwt/claims"]["x-hasura-user-id"];

    studentDto.createdBy = creatorUserId;
    studentDto.updatedBy = creatorUserId;
    studentDto.role = "student";
    let userId;
    if (altUserRoles.includes("systemAdmin")) {
      const createdUser: any = await this.userService.checkAndAddUser(
        request,
        studentDto,
        bulkToken
      );
      // entry in student

      try {
        userId = createdUser?.user.data.userId;
      } catch (e) {
        return createdUser?.user;
      }

      if (!createdUser?.isNewlyCreated) {
        // console.log(createdUser, "created user is old");
        const existingStudent: any = await this.getStudentByUserId(
          userId,
          request,
          altUserRoles
        );
        if (existingStudent?.statusCode === 200) {
          if (existingStudent?.data) {
            existingStudent.data.userId = createdUser?.user.data.userId;
            existingStudent.data.username = createdUser?.user.data.username;
            existingStudent.data.message = "User Already exists";
            return existingStudent;
          } else {
            return this.createStudentInDatabase(
              studentDto,
              userId,
              request,
              altUserRoles
            );
          }
        }
      } else {
        if (createdUser?.user.statusCode === 200) {
          return this.createStudentInDatabase(
            studentDto,
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

  public async mappedResponse(result: any) {
    const promises = [];
    for (const item of result) {
      const studentMapping = {
        userId: item?.user?.userId ? `${item.user.userId}` : "",
        password: item?.user.password ? `${item.user.password}` : "",
        studentId: item?.studentId ? `${item.studentId}` : "",
        board: item?.board ? `${item.board}` : "",
        religion: item?.religion ? `${item.religion}` : "",
        schoolUdise: item?.schoolUdise ? item.schoolUdise : "",
        caste: item?.caste ? `${item.caste}` : "",
        annualIncome: item?.annualIncome ? `${item.annualIncome}` : "",
        motherEducation: item?.motherEducation ? `${item.motherEducation}` : "",
        motherOccupation: item?.motherOccupation ? item.motherOccupation : "",
        fatherEducation: item?.fatherEducation ? `${item.fatherEducation}` : "",
        fatherOccupation: item?.fatherOccupation
          ? `${item.fatherOccupation}`
          : "",
        noOfSiblings: item?.noOfSiblings ? item.noOfSiblings : 0,
        createdBy: item?.createdBy ? `${item.createdBy}` : "",
        updatedBy: item?.updatedBy ? `${item.updatedBy}` : "",
        email: item?.user?.email ? `${item.user.email}` : "",
        dateOfBirth: item?.user?.dateOfBirth ? `${item.user.dateOfBirth}` : "",
        gender: item?.user?.gender ? `${item.user.gender}` : "",
        mobile: item?.user?.mobile ? `${item.user.mobile}` : "",
        name: item?.user?.name ? `${item.user.name}` : "",
        role: item?.user?.role ? `${item.user.role}` : "",
        username: item?.user?.username ? `${item.user.username}` : "",
        className: item?.user?.GroupMemberships[0]?.Group?.name
          ? `${item?.user?.GroupMemberships[0]?.Group?.name}`
          : "",
        schoolName: item?.user?.GroupMemberships[0]?.School?.name
          ? `${item?.user?.GroupMemberships[0]?.School?.name}`
          : "",
        studentEnrollId: item?.studentEnrollId?.studentEnrollId
          ? `${item.studentEnrollId.studentEnrollId}`
          : "",
        state: item?.state ? `${item.state}` : "",

        block: item?.block ? `${item.block}` : "",
        district: item?.district ? `${item.district}` : "",
      };
      promises.push(new StudentDto(studentMapping, true));
      //  return new StudentDto(studentMapping, true);
    }

    //const promises = result.map(studentResponse);
    const promiseRes = await Promise.all(promises);

    if (promiseRes) {
      return promiseRes;
    }
  }

  public async searchStudent(request: any, studentSearchDto: any) {
    const decoded: any = jwt_decode(request.headers.authorization);
    const altUserRoles =
      decoded["https://hasura.io/jwt/claims"]["x-hasura-allowed-roles"];
    var axios = require("axios");
    let offset = 0;
    if (studentSearchDto.page > 1) {
      offset = studentSearchDto.limit * (studentSearchDto.page - 1);
    }

    // Calculate offset based on the page number and limit
    const limit = parseInt(studentSearchDto.limit)
      ? parseInt(studentSearchDto.limit)
      : 10000;

    let filterQuery = "";
    // Allowed fields
    const allowedFilterFields = [
      "state",
      "block",
      "district",
      "schoolUdise",
      "username",
      "udiseCode",
      "class",
      "board",
      "grade",
      "userId",
      "studentId",
    ];
    // Validating filters
    const invalidFields = Object.keys(studentSearchDto.filters).filter(
      (field) => !allowedFilterFields.includes(field)
    );
    if (invalidFields.length > 0) {
      return new ErrorResponse({
        errorCode: "400",
        errorMessage: `Invalid filter fields: ${invalidFields.join(", ")}`,
      });
    }
    // Check if 'class' is provided without 'schoolName'
    if (
      studentSearchDto.filters.class &&
      !studentSearchDto.filters.schoolName
    ) {
      return new ErrorResponse({
        errorCode: "400",
        errorMessage: "Please provide 'udiseCode' when 'class' is specified.",
      });
    }
    let classFilter = "";
    let schoolFilter = "";
    // Build the filter query based on the provided filters
    Object.keys(studentSearchDto.filters).forEach((e) => {
      if (studentSearchDto.filters[e] && studentSearchDto.filters[e] != "") {
        if (e === "board") {
          filterQuery += `${e}:{_ilike: "%${studentSearchDto.filters[e]?.ilike}%"}`;
        } else if (
          e === "grade" &&
          parseInt(studentSearchDto.filters["grade"])
        ) {
          filterQuery += `user: {GroupMemberships: {Groupx: {grade: {_eq: "${parseInt(
            studentSearchDto.filters["grade"]
          )}"}}}}`;
        } else if (e === "udiseCode") {
          schoolFilter += `School: {udiseCode: {_eq: "${studentSearchDto.filters[e]?.eq}"}}`;
          //if class is not passed and only school is passed then it should get appended to the main query
          filterQuery += schoolFilter;
        } else if (e === "class") {
          classFilter += `_and: [
            {
              user: {
                GroupMemberships: {
                  _and: [
                    { 
                      ${schoolFilter}
                    },
                    {
                      Group: { name: { _eq: "${studentSearchDto.filters[e]?.eq}" } }
                    },
                    {
                      status: { _eq: true },
                    }
                    {
                      role: { _eq: "student" }
                    }
                  ]
                }
              }
            },
            {
              user: {
                status: { _eq: true }
              }
            },
          ]`;
        } else if (e === "state") {
          filterQuery += `state: {_eq: "${studentSearchDto.filters[e]?.eq}"}`;
        } else if (e === "district") {
          filterQuery += `district: {_eq: "${studentSearchDto.filters[e]?.eq}"}`;
        } else if (e === "block") {
          filterQuery += `block: {_eq: "${studentSearchDto.filters[e]?.eq}"}`;
        } else if (e === "username") {
          filterQuery += `user: { username: {_eq: "${studentSearchDto.filters[e]?.eq}"},status: {_eq: true}}`;
        } else if (e !== "grade") {
          filterQuery += `${e}:{_eq:"${studentSearchDto.filters[e]?.eq}"}`;
        }
      }
    });
    // Ensure status is active if username filter is not applied
    if (!studentSearchDto.filters.username) {
      filterQuery += `,user: {status: {_eq: true}}`;
    }

    // Construct the GraphQL query to search for students with filters

    const data = {
      query: `query SearchStudent($limit: Int, $offset: Int) {
        Students(
          where: {
            ${filterQuery} 
            ${classFilter}
          },
          limit: $limit,
          offset: $offset
        ) {
          annualIncome
          caste
          schoolUdise
          createdAt
          fatherEducation
          fatherOccupation
          updatedAt
          studentId
          religion
          noOfSiblings
          motherOccupation
          motherEducation
          groups
          board
          createdBy
          updatedBy
          state
          district
          block
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
            GroupMemberships(where: {status: {_eq: true}}) {
              School {
                name
              }
              Group {
                name
              }
            }  
          }
        }
      }`,
      variables: {
        limit: limit,
        offset: offset,
      },
    };
    console.log(data.query);

    // Axios configuration for sending the GraphQL request
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

    // Send the request and handle errors if any
    const response = await this.axios(config);
    if (response?.data?.errors) {
      return new ErrorResponse({
        errorCode: response.data.errors[0].extensions,
        errorMessage: response.data.errors[0].message,
      });
    }

    // Process the result and map it into a desired format
    let result = response.data.data.Students;

    const studentResponse = await this.mappedResponse(result);

    return new SuccessResponse({
      statusCode: 200,
      message: "Ok.",
      data: studentResponse,
    });
  }

  async addToGroups(studentDto, request) {
    const groupMembershipIds = [];

    const errors = [];

    try {
      for (const group of studentDto.groups) {
        const groupMembershipDtoById = new GroupMembershipDtoById(studentDto);
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
      console.error(error);
      return new ErrorResponse({
        errorCode: "500",
        errorMessage: "Error while adding to group",
      });
    }
  }

  public mappedResponseForStudent(result: any) {
    const userResponse = result.map((item: any) => {
      const userMapping = {
        userId: item?.userId ? `${item.userId}` : "",
        studentId: item?.studentId ? `${item.studentId}` : "",
        schoolUdise: item?.schoolUdise ? `${item.schoolUdise}` : "",
        createdAt: item?.createdAt ? `${item.createdAt}` : "",
        createdBy: item?.createdBy ? `${item.createdBy}` : "",
        groups: item?.user?.GroupMemberships ? item.user.GroupMemberships : [], // groups are blank when student is new, you will see data in group membership instead
        username: item?.user?.username ? item.user.username : "",
        studentEnrollId: item.studentEnrollId ? item.studentEnrollId : "",
        state: item?.state ? `${item.state}` : "",
        block: item.block ? `${item.block}` : "",
        district: item.district ? `${item.district}` : "",
      };
      return userMapping;
    });
    return userResponse;
  }

  public async getStudentByUserId(userId: string, request: any, altUserRoles) {
    const data = {
      query: `query GetStudentByUserId($userId:uuid!) {
        Students(where: {userId: {_eq: $userId}}){
          createdAt
          createdBy
          studentId
          userId
          schoolUdise
          user {
            username
            GroupMemberships(where: {status: {_eq: true}}) {
              groupMembershipId
              role
              schoolUdise
              userId
              status
              groupId
              Group {
                medium
                grade
                name
                academicYear
              }
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
      const result = response.data.data.Students;

      const userData = this.mappedResponseForStudent(result);

      return new SuccessResponse({
        statusCode: response.status,
        message: "Ok.",
        data: userData[0],
      });
    }
  }

  public async createStudentInDatabase(
    studentDto,
    createdUserId,
    request,
    altUserRoles
  ) {
    studentDto.userId = createdUserId;
    const studentSchema = new StudentDto(studentDto, false);
    let query = "";
    Object.keys(studentDto).forEach((e) => {
      if (
        (studentDto[e] || studentDto[e] === 0) &&
        studentDto[e] !== "" &&
        e != "password" &&
        e !== "groups" && // no need to save groups in db managed from group memberships
        Object.keys(studentSchema).includes(e)
      ) {
        if (Array.isArray(studentDto[e])) {
          query += `${e}: \"${JSON.stringify(studentDto[e])
            .replace("[", "{")
            .replace("]", "}")
            .replace(/\"/g, "")}\", `;
        } else {
          query += `${e}: ${JSON.stringify(studentDto[e])}, `;
        }
      }
    });
    const data = {
      query: `mutation CreateStudent {
        insert_Students_one(object: {${query}}) {
          studentId
          userId
          schoolUdise
          studentEnrollId
          createdAt
          createdBy
          user {
            username
            GroupMemberships(where: {status: {_eq: true}}) {
              groupMembershipId
              role
              schoolUdise
              userId
              status
              groupId
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
      console.error(response.data.errors);
      return new ErrorResponse({
        errorCode: response.data.errors[0].extensions,
        errorMessage: response.data.errors[0].message,
      });
    } else {
      const result = response.data.data.insert_Students_one;
      const userData = this.mappedResponseForStudent([result]);
      return new SuccessResponse({
        statusCode: 200,
        message: "Ok.",
        data: userData[0],
      });
    }
  }
  public async getStateList(request: any, body: any, res: any) {
    const decoded: any = jwt_decode(request.headers.authorization);
    const altUserRoles =
      decoded["https://hasura.io/jwt/claims"]["x-hasura-allowed-roles"];

    const filterQuery =
      body !== null && body.state
        ? `, where: { state: {_eq: "${body.state}"} }`
        : "";

    const data = {
      query: `query GetStateList {
        Students (distinct_on: state ${filterQuery}) {
          state
        }
      }
      `,
    };
    console.log(data.query);

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
      return res.status(500).send({
        errorCode: response.data.errors[0].extensions,
        errorMessage: response.data.errors[0].message,
      });
    }

    const responseData = response.data.data.Students;

    return res.status(200).json({
      status: 200,
      message: "States Found Successfully",
      data: responseData,
    });
  }
  public async getDistrictList(request: any, body: any, res: any) {
    const decoded: any = jwt_decode(request.headers.authorization);
    const altUserRoles =
      decoded["https://hasura.io/jwt/claims"]["x-hasura-allowed-roles"];

    let filterQuery = ", where: {";
    if (body !== null && body.state) {
      filterQuery += ` state: {_eq: "${body.state}"},`;
    }
    if (body !== null && body.district) {
      filterQuery += `district: {_eq: "${body.district}"}`;
    }

    filterQuery += `}`;
    const data = {
      query: `query GetDistrictList {
        Students (distinct_on: district ${filterQuery}) {
          district
        }
      }
      `,
    };
    console.log(data.query);

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
      return res.status(500).send({
        errorCode: response.data.errors[0].extensions,
        errorMessage: response.data.errors[0].message,
      });
    }

    const responseData = response.data.data.Students;

    return res.status(200).json({
      status: 200,
      message: "District Found Successfully",
      data: responseData,
    });
  }
  public async getBlockList(request: any, body: any, res: any) {
    const decoded: any = jwt_decode(request.headers.authorization);
    const altUserRoles =
      decoded["https://hasura.io/jwt/claims"]["x-hasura-allowed-roles"];

    let filterQuery = ", where: {";
    if (body !== null && body.state) {
      filterQuery += ` state: {_eq: "${body.state}"},`;
    }
    if (body !== null && body.district) {
      filterQuery += `district: {_eq: "${body.district}"}`;
    }
    if (body !== null && body.block) {
      filterQuery += `block: {_eq: "${body.block}"}`;
    }

    filterQuery += `}`;

    const data = {
      query: `query GetBlockList {
        Students (distinct_on: block ${filterQuery}) {
          block
        }
      }
      `,
    };
    console.log(data.query);

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
      return res.status(500).send({
        errorCode: response.data.errors[0].extensions,
        errorMessage: response.data.errors[0].message,
      });
    }

    const responseData = response.data.data.Students;

    return res.status(200).json({
      status: 200,
      message: "Block Found Successfully",
      data: responseData,
    });
  }
  public async getSchoolList(request: any, body: any, res: any) {
    const decoded: any = jwt_decode(request.headers.authorization);
    const altUserRoles =
      decoded["https://hasura.io/jwt/claims"]["x-hasura-allowed-roles"];

    let filterQuery = ", where: {";
    if (body !== null && body.state) {
      filterQuery += ` state: {_eq: "${body.state}"},`;
    }
    if (body !== null && body.district) {
      filterQuery += `district: {_eq: "${body.district}"}`;
    }
    if (body !== null && body.block) {
      filterQuery += `block: {_eq: "${body.block}"}`;
    }

    filterQuery += `}`;

    const data = {
      query: `query GetSchoolList {
        School (distinct_on: udiseCode, ${filterQuery}) {
          name
          udiseCode
        }
      }
      
      `,
    };
    console.log(data.query);

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
      return res.status(500).send({
        errorCode: response.data.errors[0].extensions,
        errorMessage: response.data.errors[0].message,
      });
    }

    const responseData = response.data.data.School;

    return res.status(200).json({
      status: 200,
      message: "School Found Successfully",
      data: responseData,
    });
  }

  public async getClass(request: any, body: any, res: any) {
    const decoded: any = jwt_decode(request.headers.authorization);
    const altUserRoles =
      decoded["https://hasura.io/jwt/claims"]["x-hasura-allowed-roles"];
    if (body && !body.schoolName) {
      return res.status(400).json({
        status: 400,
        message: "please provide school name",
        data: {},
      });
    }
    let filterQuery = "";
    if (body && body.schoolName) {
      filterQuery = `School: {name: {_eq: "${body.schoolName}"}}`;
    }

    const data = {
      query: `query GetClassList {
        Group(where: {${filterQuery}}, distinct_on: name) {
          name
        }
      }
      `,
    };
    console.log(data.query);

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
      return res.status(500).send({
        errorCode: response.data.errors[0].extensions,
        errorMessage: response.data.errors[0].message,
      });
    }

    const responseData = response.data.data.Group;

    return res.status(200).json({
      status: 200,
      message: "Classes Found Successfully",
      data: responseData,
    });
  }
  public async updateStudent(userId, request, body) {
    //Decoding JWT to extract roles and it's permissions
    const decoded: any = jwt_decode(request.headers.authorization);
    const altUserRoles =
      decoded["https://hasura.io/jwt/claims"]["x-hasura-allowed-roles"];
    const updatedBy =
      decoded["https://hasura.io/jwt/claims"]["x-hasura-user-id"]; // Extracting user ID from token
    if (!altUserRoles.includes("systemAdmin")) {
      return new ErrorResponse({
        errorCode: "401",
        errorMessage: "Unauthorized Access",
      });
    }

    //students fields that can be updated
    const studentFields = [
      "religion",
      "caste",
      "annualIncome",
      "motherEducation",
      "fatherEducation",
      "motherOccupation",
      "fatherOccupation",
      "noOfSiblings",
      "schoolUdise",
      "board",
      "state",
      "block",
      "district",
    ];
    //users fields that can be updated
    const userFields = ["name", "email", "gender", "dateOfBirth", "mobile"];
    let userUpdate = "";
    let studentUpdate = "";
    let userUpdateFields = "";
    let studentUpdateFields = "";
    let isStudentFieldUpdated = false;
    let isUserFieldUpdated = false;

    // Construct the studentUpdate string
    Object.keys(body).forEach((field) => {
      if (body[field] !== "" && studentFields.includes(field)) {
        isStudentFieldUpdated = true; // Mark that a student field is being updated
        studentUpdate += `${field}: ${
          typeof body[field] === "string"
            ? `"${body[field]}"`
            : JSON.stringify(body[field])
        }, `;
        studentUpdateFields += `${field} `;
      }
    });

    // Construct the userUpdate string
    Object.keys(body).forEach((field) => {
      if (body[field] !== "" && userFields.includes(field)) {
        isUserFieldUpdated = true; // Mark that a user field is being updated
        userUpdate += `${field}: ${
          typeof body[field] === "string"
            ? `"${body[field]}"`
            : JSON.stringify(body[field])
        }, `;
        userUpdateFields += `${field} `;
      }
    });
    const currentTime = new Date().toISOString(); // Current timestamp

    // Add 'updatedBy' and 'updatedAt' to student update only if student fields are being updated
    if (isStudentFieldUpdated) {
      studentUpdate += `updatedBy: "${updatedBy}", updatedAt: "${currentTime}", `;
      studentUpdateFields += `updatedBy updatedAt `;
    }
    // Add 'updatedBy' and 'updatedAt' to user update only if user fields are being updated
    if (isUserFieldUpdated) {
      userUpdate += `updatedBy: "${updatedBy}", updatedAt: "${currentTime}", `;
      userUpdateFields += `updatedBy updatedAt `;
    }
    console.log(userUpdateFields, studentUpdateFields);

    const data = {
      query: `mutation UpdateStudent($userId: uuid) {
        ${
          studentUpdate
            ? `update_Students(where: {userId: {_eq: $userId}}, _set: {${studentUpdate}}) { 
                returning { 
                  ${studentUpdateFields}
                }
            }`
            : ""
        }
        ${
          userUpdate
            ? `update_Users(where: {userId: {_eq: $userId}}, _set: {${userUpdate}}) { 
                returning{
                  ${userUpdateFields}
                }
            }`
            : ""
        }
      }`,
      variables: {
        userId: userId,
      },
    };
    console.log(data.query);

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

    // Fields that cannot be updated
    const restrictedFields = [
      "password",
      "createdBy",
      "createdAt",
      "userId",
      "studentId",
      "updatedAt",
      "updatedBy",
    ];
    const restrictedFieldNames = Object.keys(body).filter((field) =>
      restrictedFields.includes(field)
    );

    if (response?.data?.errors) {
      return new ErrorResponse({
        errorCode: response.data.errors[0].extensions,
        errorMessage: response.data.errors[0].message,
      });
    } else {
      const result: any = {};
      const update_Students =
        response.data.data.update_Students?.returning?.[0] || {};
      const update_Users =
        response.data.data.update_Users?.returning?.[0] || {};

      // Merge updated fields
      Object.assign(result, update_Students, update_Users);

      const restrictedFieldsMessage = restrictedFieldNames.length
        ? `The following fields were not updated as they are restricted: ${restrictedFieldNames.join(
            ", "
          )}.`
        : "";

      return new SuccessResponse({
        statusCode: 200,
        message: `Ok. ${restrictedFieldsMessage}`,
        data: result,
      });
    }
  }
  public async glaStudentProgramProgress(
    request: any,
    programId: any,
    body?: any
  ) {
    const subjectCondition = body.subject
      ? `subject: {_eq: "${body.subject}"}, `
      : "";

    //Decoding JWT to extract roles and it's permissions
    const decoded: any = jwt_decode(request.headers.authorization);
    const userId = decoded["https://hasura.io/jwt/claims"]["x-hasura-user-id"]; // Extracting user ID from token
    const altUserRoles =
      decoded["https://hasura.io/jwt/claims"]["x-hasura-allowed-roles"];

    const data = {
      query: `query MyQuery($programId: uuid) {
                  ProgramTermAssoc(where: {programId: {_eq: $programId},
                  ${subjectCondition}
                  }) {
                    rules
                    board
                    grade
                    medium
                    subject
                  }
                }`,
      variables: {
        programId: programId,
      },
    };
    console.log(data.query);

    // Axios configuration for sending the GraphQL request
    const config = {
      method: "post",
      url: this.baseURL,
      headers: {
        Authorization: request.headers.authorization,
        "Content-Type": "application/json",
      },
      data: data,
    };

    const response = await this.axios(config);
    if (response?.data?.errors) {
      return new ErrorResponse({
        errorCode: "401",
        errorMessage: response?.data?.errors,
      });
    }

    const programData = response.data.data.ProgramTermAssoc;

    const lessonData = {
      query: `
        query LessonCount($programId: uuid, $userId: uuid) {
          LessonProgressTracking(where: {programId: {_eq: $programId}, userId: {_eq: $userId}}) {
            programId
            userId
            lessonId
            status
            attempts
            contentType
            courseId
            createdBy
            created_at
            duration
            lessonProgressId
            moduleId
            score
            scoreDetails
            timeSpent
            updatedBy
            updated_at
          }
          LessonProgressTracking_aggregate(where: {programId: {_eq: $programId}, userId: {_eq: $userId}}){
            aggregate{
              count
            }
          }
        }`,
      variables: {
        programId: programId,
        userId: userId,
      },
    };
    console.log(lessonData.query);

    const lessonConfig = {
      method: "post",
      url: this.baseURL,
      headers: {
        Authorization: request.headers.authorization,
        "x-hasura-role": getUserRole(altUserRoles),
        "Content-Type": "application/json",
      },
      data: lessonData,
    };
    const lessonResponse = await this.axios(lessonConfig);
    if (lessonResponse?.data?.errors) {
      return new ErrorResponse({
        errorCode: "401",
        errorMessage: lessonResponse?.data?.errors,
      });
    }
    const lessonResult = lessonResponse.data.data.LessonProgressTracking;

    const matchedContent: any[] = [];
    let totalLessonsCount = 0; // Total number of lessons
    let completedContentCount = 0; // Count of matched content
    for (const programTerm of programData) {
      const rules = JSON.parse(programTerm.rules).prog || [];

      // Iterate over rules and find matched content based on lessonId and contentId
      for (const rule of rules) {
        // Increment total lessons count
        totalLessonsCount += rule.contentId ? 1 : 0;
        totalLessonsCount += rule.lesson_questionset ? 1 : 0;
        // Find lessons that match contentId
        const matchedLessons = lessonResult.filter(
          (lesson) =>
            (lesson.lessonId === rule.contentId &&
              lesson.status === "completed") ||
            (lesson.lessonId === rule.lesson_questionset &&
              lesson.status === "completed")
        );

        // Add all matched lessons to matchedContent array
        completedContentCount += matchedLessons.length; // Increment matched content count
        matchedContent.push(...matchedLessons); // Add matched lessons to matchedContent array
      }
    }

    // Calculate percentage of matched content
    const percentage =
      totalLessonsCount > 0
        ? ((completedContentCount / totalLessonsCount) * 100).toFixed(2)
        : "0.00";

    // Return the results including percentage, matched content count, total lessons count, and matched content
    return new SuccessResponse({
      statusCode: 200,
      message: "Success",
      data: {
        percentage,
        completedContentCount,
        totalLessonsCount,
        matchedContent,
      },
    });
  }
}
