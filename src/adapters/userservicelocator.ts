import { UserSearchDto } from "src/user/dto/user-search.dto";
import { UserDto } from "src/user/dto/user.dto";
import { UserUpdateDto } from "src/user/dto/user-update.dto";

export interface IServicelocator {
  getUser(id: any, request: any);
  getUserByAuth(request);
  createUser(request: any, userDto: UserDto);
  updateUser(id: string, request: any, userDto: UserUpdateDto);
  searchUser(request: any, userSearchDto: UserSearchDto);
  teacherSegment(schoolId: string, templateId: string, request: any);
}
