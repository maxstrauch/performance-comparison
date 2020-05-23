local jwt = require "resty.jwt"

local jwt_token = jwt:sign(
    "lua-resty-jwt",
    {
        header={typ="JWT", alg="HS256"},
        payload={name="customer1",tenant="mytenant",iat=os.time(),id="a7c7de38-6755-49d8-91d8-b812630abd65"}
    }
)
ngx.say(jwt_token)