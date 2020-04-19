const dayjs = require("dayjs");
const superagent = require("superagent");
const utc = require("dayjs/plugin/utc");
const isSameOrAfter = require("dayjs/plugin/isSameOrAfter");

dayjs.extend(utc);
dayjs.extend(isSameOrAfter);

const capitalise = (string) => string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
// const getDayRangeList = (startDay, endDay) => {
//   const dayList = [];
//   let tempDay = endDay;
//   while (tempDay.isSameOrAfter(startDay)) {
//     dayList.push(tempDay);
//     tempDay = tempDay.subtract(1, "d");
//   }
//   return dayList;
// };

// const cmpDayWithMonths = (xs, day) => {
//   const minDay = dayjs(R.last(xs));
//   return day.isSameOrAfter(minDay);
// };
const getChannels = async () => {
  const { body } = await superagent.get("https://overrustlelogs.net/api/v1/channels.json");
  return body;
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
// const onceNoResult = fn => {
//   let executed = false;
//   if (executed) {
//     return true;
//   }
//   executed = true;
//   return fn();
// };
module.exports = {
  dayjs,
  capitalise,
  sleep,
  getChannels,
};
