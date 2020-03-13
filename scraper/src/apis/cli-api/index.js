const express = require("express");
const bodyParser = require("body-parser");
const schemas = require("./schemas");

const schemaMiddleware = schema => async (req, res, next) => {
  try {
    await schema.validateAsync(req.body);
    return next();
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
};
module.exports = (config, { downloadService, fileService, elasticsearchService, cacheService }) => {
  const app = express();
  app.use(bodyParser.json());
  app.post("/download-logs", schemaMiddleware(schemas.downloadLogs), (req, res) => {
    const { daysBack } = req.body;
    downloadService.downloadLogsDaysBack(daysBack);
  });
  app.listen(config.cliApi.port, () => {
    console.log(`Cli api listening on port ${config.cliApi.port}`);
  });
};
