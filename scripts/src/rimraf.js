const readline = require("readline");
const config = require("./config");
const { fs } = require("../util");

module.exports = async ({
  downloadCache,
  indexCache,
  discardCache,
  chatLogs,
  all,
}) => {
  const toDelete = [];
  if (downloadCache || all) toDelete.push(config.paths.downloadCache);
  if (indexCache || all) toDelete.push(config.paths.indexCache);
  if (discardCache || all) toDelete.push(config.paths.discardCache);
  if (chatLogs || all) toDelete.push(config.paths.orl);

  console.log("To be deleted:\n -", toDelete.join("\n - "));
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question("Are you sure you want to delete these files? [Y/n] ", answer => {
    if (answer.toLowerCase() === "y") {
      toDelete.forEach(file => fs.remove(file));

      console.log("Deleted everything :)");
    } else {
      console.log("Cancelled");
    }
    rl.close();
  });
  // const downloadedLogFiles = await fs.readdirSafe(config.paths.orl)
};
