const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const loggerMiddleware = require("./middleware/express-logger");
const extendReq = require("./middleware/request-extender");
const api = require("./routes/api");

const app = express();

// behind nginx
app.set("trust proxy", 1);

app.use(
  cors({
    exposedHeaders: ["Retry-After", "X-RateLimit-Reset"],
  }),
);

app.use(extendReq);

app.use(
  loggerMiddleware({
    honorDNT: true,
    ignore: ["/healthcheck"],
    level: "info",
  }),
);

app.use(helmet());

app.use(express.json());
app.use(api);

module.exports = app;
