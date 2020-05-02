const fg = require("fast-glob");
const { join, parse, sep } = require("path");
const _ = require("lodash");
const zlib = require("zlib");
const { promisify } = require("util");
const { fs } = require("./util");

const gunzip = promisify(zlib.gunzip);

module.exports = ({ orl, channelsPath }) => {
  return {
    fetchChannels() {
      return fs
        .readFile(channelsPath, "utf8")
        .then(text => new Set(text.trim().split("\n")));
    },
    async listLogs(channel) {
      await fs.ensureDir(orl);
      const paths = channel
        ? await fg(`${orl}/${channel}/*.txt*`)
        : await fg(`${orl}/*/*.txt*`);
      return paths.map(p => {
        const logChannel = _.last(parse(p).dir.split(sep));

        const filename = parse(p).base;
        if (filename.endsWith(".txt.gz")) {
          const date = filename.replace(".txt.gz", "");
          return {
            channel: logChannel,
            date,
            path: p,
            combo: `${logChannel}/${date}`,
            compressed: true,
          };
        }
        if (filename.endsWith(".txt")) {
          const date = filename.replace(".txt", "");
          return {
            channel: logChannel,
            date,
            path: p,
            combo: `${logChannel}/${date}`,
            compressed: false,
          };
        }
        throw new Error("Weird file");
      });
    },
    listCompressedLogs(channel) {
      return this.listLogs(channel).then(logs =>
        logs.filter(log => log.compressed),
      );
    },
    listUncompressedLogs(channel) {
      return this.listLogs(channel).then(logs =>
        logs.filter(log => !log.compressed),
      );
    },
    getPath({ channel, date, compressed = true }) {
      if (compressed === true) {
        return join(orl, channel, `${date}.txt.gz`);
      }
      return join(orl, channel, `${date}.txt`);
    },
    buildComboString({ channel, date }) {
      return `${channel}/${date}`;
    },
    async readLog({ channel, date, compressed }) {
      const path = this.getPath({ channel, date, compressed });
      if (!(await fs.pathExists(path))) {
        return "";
      }
      if (compressed === true) {
        const raw = await fs.readFile(path);
        const buffer = await gunzip(raw);
        return buffer.toString();
      }
      return fs.readFile(path, "utf8");
    },
    async readLogUnsafe({ channel, date, compressed }) {
      const path = this.getPath({ channel, date, compressed });
      if (compressed === true) {
        const raw = await fs.readFile(path);
        const buffer = await gunzip(raw);
        return buffer.toString();
      }
      return fs.readFile(path, "utf8");
    },
  };
};
