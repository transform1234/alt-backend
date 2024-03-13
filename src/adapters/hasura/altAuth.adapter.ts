import { Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { ALTAuthDto } from "src/altAuth/dto/auth.dto";

@Injectable()
export class HasuraAuthService {
  axios = require("axios");

  constructor(private httpService: HttpService) {}

  public async login(request: any, response: any, loginDto: ALTAuthDto) {
    const qs = require("qs");
    const data = qs.stringify({
      username: loginDto.username,
      password: loginDto.password,
      grant_type: "password",
      client_id: "hasura-app",
      client_secret: process.env.KEYCLOAK_HASURA_CLIENT_SECRET,
    });

    const config = {
      method: "post",
      url: process.env.ALTKEYCLOAKURL + process.env.KEYCLOAK_USER_TOKEN,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: data,
    };

    try {
      const res = await this.axios(config);
      return response.status(200).send(res.data);
    } catch (error) {
      console.error(error?.response, "err");
      if (error?.response?.status === 400) {
        return response.status(400).send(error?.response?.data);
      }
      return response.status(500).send({
        error: "Something went wrong!",
      });
    }
  }
}
