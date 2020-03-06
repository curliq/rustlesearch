const express = require("express");

const app = express();
const config = require("./config");
const clientFactory = require("./client-factory");

const clientBuilder = clientFactory({});

const client = clientBuilder(["destiny"]);
app.get("/check-channels", (req, res) => res.send("Hello World!"));

app.listen(config.port, () =>
  console.log(`Example app listening on port ${config.port}!`),
);
