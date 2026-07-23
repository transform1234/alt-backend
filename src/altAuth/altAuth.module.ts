import { CacheModule, Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { AuthController } from "./altAuth.controller";
import { HasuraAuthService } from "src/adapters/hasura/altAuth.adapter";

const ttl = process.env.TTL as never;
@Module({
  imports: [
    HttpModule,
    CacheModule.register({
      ttl: ttl,
    }),
  ],
  controllers: [AuthController],
  providers: [HasuraAuthService],
})
export class ALTAuthModule {}