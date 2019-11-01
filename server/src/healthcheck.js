const { request } = require("http");
const config = require("./lib/config");

const options = {
  host: "localhost",
  path: "/healthcheck",
  port: config.APP_PORT,
  timeout: 3000,
};

const req = request(options, res => {
  if (!res.statusCode === 200) throw new Error("Wrong statuscode");
});

req.on("error", () => {
  throw new Error("Healthcheck timed out");
});

req.end();
