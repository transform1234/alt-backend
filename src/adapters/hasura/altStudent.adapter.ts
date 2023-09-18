import { Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import jwt_decode from "jwt-decode";
import { SuccessResponse } from "src/success-response";
import { StudentDto } from "src/altStudent/dto/alt-student.dto";
import { ErrorResponse } from "src/error-response";
import { getUserRole } from "./adapter.utils";
import { ALTHasuraUserService } from "./altUser.adapter";
import { GroupMembershipService } from "./groupMembership.adapter";
import { GroupMembershipDtoById } from "src/groupMembership/dto/groupMembership.dto";

@Injectable()
export class ALTStudentService {
  constructor(
    private httpService: HttpService,
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

    const responseData = response.data.data.Students;

    console.log(responseData);

    const studentResponse = await this.mappedResponse(responseData);
    console.log(studentResponse[0], "stdres");
    return new SuccessResponse({
      statusCode: 200,
      message: "student found Successfully",
      data: studentResponse[0],
    });
  }

  public async createAndAddToGroup(request: any, studentDto: StudentDto) {
    const decoded: any = jwt_decode(request.headers.authorization);
    const altUserRoles =
      decoded["https://hasura.io/jwt/claims"]["x-hasura-allowed-roles"];

    const creatorUserId =
      decoded["https://hasura.io/jwt/claims"]["x-hasura-user-id"];

    studentDto.createdBy = creatorUserId;
    studentDto.updatedBy = creatorUserId;
    studentDto.role = "student";

    if (!studentDto.groups.length) {
      return new ErrorResponse({
        errorCode: "400",
        errorMessage: "Please add atleast one group",
      });
    }
    let createdUser;
    try {
      if (altUserRoles.includes("systemAdmin")) {
        const newCreatedUser: any = await this.createStudent(
          request,
          studentDto
        );
        if (newCreatedUser.statusCode === 200) {
          createdUser = newCreatedUser.data;
          createdUser.groupAddResponse = await this.addToGroups(
            studentDto,
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
        console.log(createdUser, "cusr");
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

  public async createStudent(request: any, studentDto: StudentDto) {
    const decoded: any = jwt_decode(request.headers.authorization);
    const altUserRoles =
      decoded["https://hasura.io/jwt/claims"]["x-hasura-allowed-roles"];

    const creatorUserId =
      decoded["https://hasura.io/jwt/claims"]["x-hasura-user-id"];

    studentDto.createdBy = creatorUserId;
    studentDto.updatedBy = creatorUserId;
    studentDto.role = "student";

    if (altUserRoles.includes("systemAdmin")) {
      const createdUser: any = await this.userService.createUser(
        request,
        studentDto
      );

      if (createdUser.statusCode === 200) {
        studentDto.userId = createdUser.data.userId;
        const studentSchema = new StudentDto(studentDto, false);
        let query = "";

        Object.keys(studentDto).forEach((e) => {
          if (
            (studentDto[e] || studentDto[e] === 0) &&
            studentDto[e] !== "" &&
            e != "password" &&
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
              groups
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
          const result = response.data.data.insert_Students_one;

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

  updateStudent(id: string, request: any, studentDto: StudentDto) {}

  public async mappedResponse(result: any) {
    const studentResponse = result.map((item: any) => {
      const studentMapping = {
        userId: item?.user?.userId ? `${item.user.userId}` : "",
        studentId: item?.studentId ? `${item.studentId}` : "",
        groups: item?.groups ? item.groups : [],
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
        // createdAt: item?.created ? `${item.created}` : "",
        // updatedAt: item?.updated ? `${item.updated}` : "",
      };
      return new StudentDto(studentMapping, true);
    });

    return studentResponse;
  }

  public async searchStudent(request: any, studentSearchDto: any) {
    const axios = require("axios");
    const data = {
      query: `query getStudent {
        student(where: {}, limit: 10) {
        id
        name
        father_name,
        mother_name
        phone
        roll
        school_id
        section
        medium
        is_bpl
        is_cwsn
        is_migrant
        admission_number
        image
        updated
        stream_tag
        religion
        grade_number
        gender
        enrollment_type
        created
        dob
      }
    }`,
      variables: {},
    };

    const config = {
      method: "post",
      url: this.baseURL,
      headers: {
        "x-hasura-admin-secret": this.adminSecret,
        "Content-Type": "application/json",
      },
      data: data,
    };
    const response = await axios(config);

    const responsedata = response.data.data.student;
    const studentResponse = await this.mappedResponse(responsedata);

    return new SuccessResponse({
      statusCode: 200,
      message: "ok.",
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
            msg: `Could not add to group ${group}`,
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
