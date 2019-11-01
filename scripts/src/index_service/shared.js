const { capitalise } = require("../../util");

function parseDateToISO(date) {
  const yyyy = date.slice(0, 4);
  const MM = date.slice(5, 7);
  const dd = date.slice(8, 10);
  const hh = date.slice(11, 13);
  const mm = date.slice(14, 16);
  const ss = date.slice(17, 19);

  return `${yyyy}-${MM}-${dd}T${hh}:${mm}:${ss}.000Z`;
}

const timestampRegex = "\\[(?<tsStr>.{23})\\]";
const usernameRegex = "(?<username>[a-z0-9_\\$]{3,25})";
const textRegex = "(?<text>.{1,512})";

const messageRegex = new RegExp(
  ["^", timestampRegex, "\\s", usernameRegex, ":\\s", textRegex].join(""),
  "iu",
);

const lineToMessage = (line, channel) => {
  // eslint-disable-next-line no-undefined
  if (line.text.length === 0) return undefined;
  const replacedLine = line.text.replace("\r", "");
  const matched = replacedLine.match(messageRegex);

  // we cant parse that message yet
  if (!matched) {
    console.debug({ channel, line, message: "Cannot be parsed" });

    // eslint-disable-next-line no-undefined
    return undefined;
  }

  const { tsStr, username, text } = matched.groups;
  const ts = parseDateToISO(tsStr);
  const lowerUsername = username.toLowerCase();

  return {
    channel: capitalise(channel),
    text,
    ts,
    username: lowerUsername,
  };
};

const blacklistLineToMessage = blacklist => (line, channel) => {
  const message = lineToMessage(line, channel);
  if (!message) return message;
  if (blacklist.has(message.username)) {
    console.debug(`${message.username} in blacklist, ignoring message...`);

    return undefined;
  }

  return message;
};

module.exports = {
  lineToMessage,
  blacklistLineToMessage,
};
