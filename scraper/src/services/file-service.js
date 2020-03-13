const fs = require("fs-extra");
const dayjs = require("dayjs");
const getStream = require("get-stream");
const { join } = require("path");
const zlib = require("zlib");
const { pipeline } = require("stream");
const { promisify } = require("util");

const pipe = promisify(pipeline);
const utc = require("dayjs/plugin/utc");
const FileWriter = require("./writers/file-writer");

dayjs.extend(utc);

class FileService {
  constructor(config) {
    this.config = config.fileWriter;
    this.fileEnding = ".zz";
  }

  async setup() {
    if (this.config.writerEnabled) {
      this.writer = await FileWriter.build(this.config);
    } else {
      this.writer = null;
    }
  }

  static async build(...args) {
    const instance = new FileService(...args);
    await instance.setup();
    return instance;
  }

  async logExists(filename) {
    const filepath = join(this.config.directory, filename);
    const fileExists = await fs.pathExists(filepath);
    if (fileExists) {
      return true;
    }
    const compressedFileExists = await fs.pathExists(`${filepath}${this.fileEnding}`);
    if (compressedFileExists) {
      return true;
    }
    return false;
  }

  async readLog(filename) {
    const filepath = join(this.config.directory, filename);
    const fileExists = await fs.pathExists(filepath);
    if (fileExists) {
      return fs.readFile(filepath);
    }
    const compressedFileExists = await fs.pathExists(`${filepath}${this.fileEnding}`);
    if (compressedFileExists) {
      const decoder = zlib.createInflate();

      const stream = fs.createReadStream(filepath).pipe(decoder);
      return getStream(stream);
    }
    return null;
  }

  async listFiles() {
    const dirExists = await fs.pathExists(this.config.directory);
    if (dirExists) {
      return fs.readdir(this.config.directory);
    }
    return [];
  }

  getFilepathNaive(channel, day) {
    const filename = `${channel}::${day.format("YYYY-MM-DD")}.txt`;
    return {
      filename,
      path: join(this.config.directory, filename),
    };
  }

  async getFilepathSmart(channel, day) {
    const { path: naive } = this.getFilepathNaive(channel, day);
    if (await fs.pathExists(naive)) {
      return naive;
    }
    if (await fs.pathExists(`${naive}.zz`)) {
      return `${naive}.zz`;
    }
    return null;
  }

  async compressFile(filepath) {
    if (!filepath.endsWith(this.fileEnding)) {
      const encoder = zlib.createDeflate();
      const readStream = fs.createReadStream(filepath);
      const writeStream = fs.createWriteStream(`${filepath}${this.fileEnding}`);
      await pipe(readStream, encoder, writeStream);
      return `${filepath}${this.fileEnding}`;
    }
    return filepath;
  }

  async compressAllLogs() {
    const filepaths = await this.listFiles();
    const uncompressedFiles = filepaths.filter(filename => {
      return !filename.endsWith(this.fileEnding);
    });
    const promises = uncompressedFiles.map(FileService.compressFile);
    return Promise.all(promises);
  }

  get orlDir() {
    return this.config.directory;
  }
}

module.exports = FileService;
