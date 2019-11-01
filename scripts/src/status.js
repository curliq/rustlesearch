const Table = require("cli-table3");
const config = require("./config");
const { fs } = require("../util");

module.exports = async () => {
  const table = new Table();
  const downloadedLogFiles = await fs.readdirSafe(config.paths.orl);
  table.push(["Downloaded Logs Count", downloadedLogFiles.length]);
  console.log(table.toString());
};
