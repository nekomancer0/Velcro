import yts from "yt-search";
import announceError from "../utils/VelcroError";
import fs, { fstatSync } from "fs";
import path from "path";
import ytdl from "@distube/ytdl-core";
import play from "../utils/play";

class YouTubePlugin {
  constructor() {}

  // Méthode pour rechercher une vidéo
  async search(query: string): Promise<string | null> {
    console.log(`Recherche de la vidéo sur YouTube : ${query}`);

    try {
      let data = await yts(query);
      let url = data.videos.sort((a, b) => a.views - b.views).at(-1)!.url;

      return url;
    } catch (e) {
      console.error("Erreur lors de la recherche sur YouTube:", e);
      await announceError();
      return null;
    }
  }

  async play(url: string): Promise<void> {
    const info = await ytdl.getBasicInfo(url);
    const filepath = path.join(
      __dirname,
      "..",
      "files",
      info.videoDetails.videoId + ".mp4"
    );

    if (fs.existsSync(filepath)) {
      play(filepath, () => {});
    } else {
      let stream = fs.createWriteStream(filepath);

      let size = 0;
      stream.on("open", (fd) => {
        console.log(`Started writing file ${url}`);

        let interval = setInterval(() => {
          let stats = fstatSync(fd);

          if (size === stats.size) {
            clearInterval(interval);

            stream.emit("finish");
          } else size = stats.size;
        }, 1000);
      });

      stream.on("finish", () => {
        play(filepath);
      });

      // Télécharge la vidéo au format audio (mp3)
      ytdl(info.videoDetails.video_url, {
        filter: "videoandaudio",
      }).pipe(stream);
    }
  }
}

export default YouTubePlugin;
