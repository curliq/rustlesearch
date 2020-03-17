const superagent = require("superagent");

const buildLogUrl = ({ channel, day }) =>
  `https://overrustlelogs.net/${channel} chatlog/${day.format(`MMMM YYYY/YYYY-MM-DD`)}.txt`;
const buildMonthsUrl = channel => `https://overrustlelogs.net/api/v1/${channel}/months.json`;

const downloadLog = ({ channel, day }) =>
  superagent.get(buildLogUrl({ channel, day })).then(res => res.text);
const downloadMonths = channel => superagent.get(buildMonthsUrl(channel)).then(res => res.body);

module.exports = () => {
  return {
    buildMonthsUrl,
    buildLogUrl,
    downloadLog,
    downloadMonths,
  };
};
// const FileWriter = require("./writers/file-writer");

// class FileService {
//   constructor(config) {
//     this.dir = config.fileWriter.directory;
//     this.writerEnabled = config.fileWriter.writerEnabled;

//     this.config = config;
//     this.fileEnding = ".zz";
//   }

//   async setup() {
//     if (this.writerEnabled) {
//       this.writer = await FileWriter.build(this.config);
//     } else {
//       this.writer = null;
//     }
//   }

//   static async build(...args) {
//     const instance = new FileService(...args);
//     await instance.setup();
//     return instance;
//   }

//   async logExists(channel, day) {
//     const { path } = this.getFilepathNaive(channel, day);
//     const fileExists = await fs.pathExists(path);
//     if (fileExists) {
//       return true;
//     }
//     const compressedFileExists = await fs.pathExists(`${path}${this.fileEnding}`);
//     if (compressedFileExists) {
//       return true;
//     }
//     return false;
//   }

//   async readLog(filename) {
//     const filepath = join(this.dir, filename);
//     const fileExists = await fs.pathExists(filepath);
//     if (fileExists) {
//       return fs.readFile(filepath);
//     }
//     const compressedFileExists = await fs.pathExists(`${filepath}${this.fileEnding}`);
//     if (compressedFileExists) {
//       const decoder = zlib.createInflate();

//       const stream = fs.createReadStream(filepath).pipe(decoder);
//       return getStream(stream);
//     }
//     return null;
//   }

//   async listFiles() {
//     const dirExists = await fs.pathExists(this.dir);
//     if (dirExists) {
//       return fs.readdir(this.dir);
//     }
//     return [];
//   }

//   getFilepathNaive(channel, day) {
//     const filename = `${channel}::${day.format("YYYY-MM-DD")}.txt`;
//     return {
//       filename,
//       path: join(this.dir, filename),
//     };
//   }

//   async compressFile(filepath) {
//     if (!filepath.endsWith(this.fileEnding)) {
//       const encoder = zlib.createDeflate();
//       const readStream = fs.createReadStream(filepath);
//       const writeStream = fs.createWriteStream(`${filepath}${this.fileEnding}`);
//       await pipe(readStream, encoder, writeStream);
//       return `${filepath}${this.fileEnding}`;
//     }
//     return filepath;
//   }

//   async compressAllLogs() {
//     const filepaths = await this.listFiles();
//     const uncompressedFiles = filepaths.filter(filename => {
//       return !filename.endsWith(this.fileEnding);
//     });
//     const promises = uncompressedFiles.map(FileService.compressFile);
//     return Promise.all(promises);
//   }

//   get orlDir() {
//     return this.dir;
//   }
// }
