local file = "./rfc2616.txt"
local f = io.open(file, "rb")
local content = f:read("*all")
f:close()
ngx.print(content)