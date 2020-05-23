import {inject, TestContext} from "@tsed/testing";
import {JwtService} from "./JwtService";

describe("JwtService", () => {
  before(() => TestContext.create());
  before(() => TestContext.reset());

  describe("get()", () => {
    it("should return value stored in memoryStorage", inject([JwtService], (jwtService: JwtService) => {
        (jwtService.getJWT().length > 0).should.be.equal(true);
    }));
  });
});
