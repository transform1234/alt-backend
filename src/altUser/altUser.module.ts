import { CacheModule, Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { ALTUserController } from "./altUser.controller";
import { ALTHasuraUserService } from "src/adapters/hasura/altUser.adapter";

const ttl = process.env.TTL as never;

@Module({
  imports: [
    HttpModule,
    CacheModule.register({
      ttl: ttl,
    }),
  ],
  controllers: [ALTUserController],
  providers: [ALTHasuraUserService],
})
export class ALTUserModule {}
