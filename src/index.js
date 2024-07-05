const fs = require("fs");
const axios = require("axios");
const puppeteer = require("puppeteer");
const readline = require("readline");
const figlet = require("figlet");
const chalk = require("chalk");

class InstagramReelsDownloader {
  constructor() {
    this.browser = null;
    this.page = null;
    this.interface = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  }

  async initialize() {
    this.browser = await puppeteer.launch();
    this.page = await this.browser.newPage();
    await this.askForVideoLink();
  }

  async askForVideoLink() {
    console.log(chalk.blue(figlet.textSync("VIDOWNLOAD")));
    console.log(chalk.cyan("✓ Instagram Reels"));
    console.log(chalk.red("✗ YouTube Shorts, TikTok, YouTube Video"));
    this.interface.question(
      chalk.yellow("Paste The URL Of Video: "),
      async (inputUrl) => {
        await this.downloadVideo(inputUrl);
      }
    );
  }

  async downloadVideo(url) {
    try {
      await this.page.goto(url);
      await this.page.waitForSelector("video");
      const videoUrl = await this.page.evaluate(() => {
        const video = document.querySelector("video");
        return video.src;
      });

      const writer = fs.createWriteStream("output/result.mp4");
      const response = await axios({
        url: videoUrl,
        method: "GET",
        responseType: "stream",
      });

      console.log(chalk.green("Downloading video..."));
      response.data.pipe(writer);

      writer.on("finish", () => {
        console.log(chalk.green("Video downloaded successfully!"));
        process.exit(0);
      });
    } catch (error) {
      console.error(chalk.red("Error downloading video:"), error);
      process.exit(1);
    } finally {
      await this.browser.close();
    }
  }
}

(async () => {
  const downloader = new InstagramReelsDownloader();
  await downloader.initialize();
})();
