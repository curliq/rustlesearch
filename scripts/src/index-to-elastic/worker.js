const { parse } = require("path");
const etl = require("etl");
const pMap = require("p-map");
const { Client } = require("@elastic/elasticsearch");
const zlib = require("zlib");
const { expose } = require("threads/worker");
const { promisify } = require("util");
const config = require("../config");
const { fs, capitalise } = require("../util");
require("colors");

const gunzip = promisify(zlib.gunzip);
const indexCacheStream = fs.createWriteStream(config.paths.indexCache, {
  flags: "a",
});

const client = new Client({
  node: config.elastic.url,
});

const bulkIndex = async msgs => {
  const { index } = config.elastic;
  const body = msgs.flatMap(doc => [{ index: { _index: index } }, doc]);
  // console.log(msgs.length);
  await client.bulk({
    pipeline: `${index}-pipeline`,
    body,
  });
};

const parseLineDateToISO = date => {
  const yyyy = date.slice(0, 4);
  const MM = date.slice(5, 7);
  const dd = date.slice(8, 10);
  const hh = date.slice(11, 13);
  const mm = date.slice(14, 16);
  const ss = date.slice(17, 19);

  return `${yyyy}-${MM}-${dd}T${hh}:${mm}:${ss}.000Z`;
};
const parseLineToMsg = (channel, line) => {
  if (!(channel && line)) {
    throw new Error("Missing required field(s): channel or line");
  }

  const bracketIdx = line.indexOf("]");
  const ts = line.slice(1, bracketIdx);
  const afterBracket = line.slice(bracketIdx + 2);
  const colonIdx = afterBracket.indexOf(":");
  const username = afterBracket.slice(0, colonIdx);
  const text = afterBracket.slice(colonIdx + 2);

  return {
    channel: capitalise(channel),
    ts: parseLineDateToISO(ts),
    username: username.toLowerCase(),
    text,
  };
};
const indexPath = async filePath => {
  const { base } = parse(filePath);
  const name = base.replace(".txt.gz", "");
  const [channel] = name.split("::");

  const raw = await fs.readFile(filePath);
  const text = await gunzip(raw);
  const lines = text
    .toString()
    .trim()
    .split("\n");

  await etl
    .toStream(lines)
    .pipe(etl.map(line => parseLineToMsg(channel, line)))
    .pipe(etl.collect(config.elastic.bulkSize))
    .pipe(etl.map(msgs => bulkIndex(msgs)))
    .promise()
    .catch(error => {
      console.log(error);
      console.error({ error, message: "Elastic error" });
    });
  indexCacheStream.write(`${name}\n`);
  console.debug(`Indexed ${name}`.green);
};

expose({
  index: async paths => {
    await client.info();
    await pMap(paths, indexPath, { concurrency: 10 });
  },
});
