const { capitalise, dayjs } = require("./util");

function parseLineDateToISO(date) {
  const yyyy = date.slice(0, 4);
  const MM = date.slice(5, 7);
  const dd = date.slice(8, 10);
  const hh = date.slice(11, 13);
  const mm = date.slice(14, 16);
  const ss = date.slice(17, 19);

  return `${yyyy}-${MM}-${dd}T${hh}:${mm}:${ss}.000Z`;
}

class TransformService {
  static parseLineToMsg(channel, line) {
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
      ts: dayjs(parseLineDateToISO(ts)).utc(),
      username: username.toLowerCase(),
      text,
    };
  }

  static msgToLine(msg) {
    return `[${msg.ts.format("YYYY-MM-DD HH:mm:ss")} UTC] ${msg.username}: ${msg.text}`;
  }

  static msgToElasticMsg(msg) {
    return { ...msg, ts: msg.ts.format("YYYY-MM-DDTHH:mm:ss[.000Z]") };
  }

  static toMessage({ channel, username, text, ts }) {
    return {
      channel: capitalise(channel),
      username: username.toLowerCase(),
      text,
      ts: dayjs(ts).utc(),
    };
  }
}

module.exports = TransformService;
