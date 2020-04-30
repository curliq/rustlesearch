/* eslint-disable no-await-in-loop */
const { Client } = require("@elastic/elasticsearch");
const esb = require("elastic-builder");
const _ = require("lodash");
const { Confirm } = require("enquirer");
const { join } = require("path");
const { dayjs, sleep, fs, getChannels } = require("./util");

module.exports = async (cfg, start, end, channels, removeLogs) => {
  const startDate = dayjs.utc(start).startOf("day");
  const endDate = dayjs.utc(end).startOf("day");
  let boolQuery = esb.boolQuery().filter(
    esb
      .rangeQuery("ts")
      .gte(startDate.format("YYYY-MM-DD"))
      .lte(endDate.format("YYYY-MM-DD")),
  );
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
      if (cfg.elastic.enable) {
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
      }
      const indexCache = await fs
        .readFile(cfg.paths.indexCache, "utf8")
        .then(txt => new Set(txt.trim().split("\n")));
      const prevSize = indexCache.size;
      const list = [];
      let day = endDate;
      const goodChannels =
        channels.length > 0 ? _.castArray(channels) : await getChannels(cfg);
      while (day.isSameOrAfter(startDate)) {
        for (const channel of goodChannels) {
          list.push(`${channel}::${day.format("YYYY-MM-DD")}`);
        }
        day = day.subtract(1, "d");
      }

      list.forEach(item => indexCache.delete(item));
      console.log(indexCache.size, prevSize);
      const indexToWrite = [...indexCache].join("\n");
      await fs.writeFile(cfg.paths.indexCache, indexToWrite, {
        encoding: "utf8",
      });
      if (removeLogs) {
        for (const combo of list) {
          const path = join(cfg.paths.orl, `${combo}.txt`);
          if (await fs.exists(`${path}.gz`)) {
            await fs.remove(`${path}.gz`);
          }
          if (await fs.exists(path)) {
            await fs.remove(path);
          }
        }
      }
    } catch (e) {
      console.error(e);
    }
  }
};
