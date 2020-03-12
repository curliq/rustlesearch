const { dayjs } = require("../../util");

const getDaysFromRange = (startDay, endDay) => {
  const dayList = [];
  let tempDay = endDay;
  while (endDay.isSameOrAfter(startDay)) {
    dayList.push(endDay);
    tempDay = tempDay.subtract(1, "d");
  }
  return dayList;
};
const cacheDownloads = () => {};
const downloadLogs = (startDay, endDay) => {};

const replaceDay = (elasticWriter, day) => {
  downloadLogs();
};
