const Joi = require("@hapi/joi");

module.exports = {
  downloadLogs: Joi.object({
    daysBack: Joi.number().required(),
  }),
};
