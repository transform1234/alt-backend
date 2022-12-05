import { Exclude, Expose } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsUUID } from "class-validator";

export class GroupMembershipDto {
  @Expose()
  groupMembershipId: string;

  @ApiProperty()
  @Expose()
  groupId: string;

  @ApiProperty()
  @Expose()
  schoolId: string;

  @Expose()
  @IsNotEmpty()
  @IsUUID()
  userId: string;

  @ApiProperty()
  @Expose()
  role: string;

  @Expose()
  createdBy: string;

  @Expose()
  updatedBy: string;

  @Expose()
  created_at: string;

  @Expose()
  updated_at: string;

  constructor(obj: any) {
    Object.assign(this, obj);
  }
}
