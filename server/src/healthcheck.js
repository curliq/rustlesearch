const { request } = require("http");
const config = require("./config");

const options = {
  host: "localhost",
  path: "/healthcheck",
  port: config.app.port,
  timeout: 3000,
};

const req = request(options, res => {
  if (!res.statusCode === 200) throw new Error("Wrong statuscode");
});

req.on("error", () => {
  throw new Error("Healthcheck timed out");
});

req.end();
