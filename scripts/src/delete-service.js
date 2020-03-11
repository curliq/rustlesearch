const { Client } = require("@elastic/elasticsearch");
const { dayjs } = require("../util");
const config = require("./config");

const deleteBack = async ({ daysBack = 1, onlyToday = false }) => {
  const client = new Client({
    node: config.elastic.url,
  });
  const subtractedDate = dayjs()
    .subtract(daysBack, "d")
    .utc()
    .format("YYYY-MM-DD");
  const today = dayjs()
    .utc()
    .format("YYYY-MM-DD");
  let rangeObject;
  if (onlyToday) {
    rangeObject = {
      gte: today,
      lte: today,
    };
    console.log("today: ", today);
  } else {
    rangeObject = {
      gte: subtractedDate,
      lt: today,
    };
    console.log("gte: ", subtractedDate);
    console.log("lt: ", today);
  }
  await client.deleteByQuery({
    index: `${config.elastic.index}-*`,
    body: {
      query: {
        range: {
          ts: rangeObject,
        },
      },
    },
  });
};

module.exports = {
  deleteBack,
};
