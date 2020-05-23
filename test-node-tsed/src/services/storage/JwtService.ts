import {Service} from "@tsed/common";
import * as jsonwebtoken from 'jsonwebtoken';

@Service()
export class JwtService {

  getJWT(): string {
    const token = jsonwebtoken.sign({
        iat: Date.now(), 
        name: 'customer1', 
        tenant: 'mytenant', 
        id: 'a7c7de38-6755-49d8-91d8-b812630abd65'
    }, "lua-resty-jwt");
    return token;
  }
  
}
