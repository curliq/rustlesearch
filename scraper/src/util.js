const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const isSameOrAfter = require("dayjs/plugin/isSameOrAfter");

dayjs.extend(utc);
dayjs.extend(isSameOrAfter);

const capitalise = string => string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
const normalizeMessage = ({ channel, text, ts, username }, dateFormat) => {
  const day = dayjs(ts).utc();
  return {
    normMsg: {
      channel: capitalise(channel),
      username: username.toLowerCase(),
      text,
      ts: day.format(dateFormat),
    },
    day,
  };
};
const getDayRangeList = (startDay, endDay) => {
  const dayList = [];
  let tempDay = endDay;
  while (tempDay.isSameOrAfter(startDay)) {
    dayList.push(tempDay);
    tempDay = tempDay.subtract(1, "d");
  }
  return dayList;
};
module.exports = {
  dayjs,
  capitalise,
  normalizeMessage,
  getDayRangeList,
};
