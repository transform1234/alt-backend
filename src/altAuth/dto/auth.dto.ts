import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class ALTAuthDto {
  @ApiProperty({
    type: String,
    description: "username",
  })
  username: string;

  @ApiProperty({
    type: String,
    description: "password",
  })
  password: string;

  constructor(partial: Partial<ALTAuthDto>) {
    Object.assign(this, partial);
  }
}
