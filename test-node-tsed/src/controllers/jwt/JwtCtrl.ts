import {Controller, Get} from "@tsed/common";
import {JwtService} from "../../services/storage/JwtService";

@Controller("/json-generate")
export class JwtCtrl {

  constructor(private jwtService: JwtService) {
  }

  @Get()
  async getJWT() {
    return this.jwtService.getJWT();
  }

}
