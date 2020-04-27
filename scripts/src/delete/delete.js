/* eslint-disable no-await-in-loop */
const { Client } = require("@elastic/elasticsearch");
const esb = require("elastic-builder");
const _ = require("lodash");
const { Confirm } = require("enquirer");
const { dayjs, sleep } = require("../util");

module.exports = async (cfg, start, end, channels) => {
  let boolQuery = esb.boolQuery();
  if (start || end) {
    let rangeQuery = esb.rangeQuery("ts");
    if (start) {
      const startDate = dayjs.utc(start).format("YYYY-MM-DD");
      rangeQuery = rangeQuery.gte(startDate);
    }
    if (end) {
      const endDate = dayjs.utc(end).format("YYYY-MM-DD");
      rangeQuery = rangeQuery.lte(endDate);
    }
    boolQuery = boolQuery.filter(rangeQuery);
  }
  if (channels.length > 0) {
    boolQuery = boolQuery.filter(
      esb.termsQuery("channel", _.castArray(channels)),
    );
  }
  const requestBody = esb.requestBodySearch().query(boolQuery);
  const client = new Client({
    node: cfg.elastic.url,
  });
  console.log(JSON.stringify(requestBody.toJSON(), null, 2));
  const answer = await new Confirm({
    name: "prompt",
    message: "Are you sure you want to delete these logs?",
  }).run();
  // console.log(answer);
  if (answer) {
    try {
      const { body } = await client.deleteByQuery({
        index: `${cfg.elastic.index}-*`,
        body: requestBody.toJSON(),
        wait_for_completion: false,
      });

      const { task } = body;
      let completed = false;

      while (!completed) {
        await sleep(2000);
        const { body: body2 } = await client.tasks.get({
          task_id: task,
        });

        completed = body2.completed;
        console.log("completed: ", completed);
      }
    } catch (e) {
      console.error(e.meta);
    }
  }
};
