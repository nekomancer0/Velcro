const mic = require("mic");
import fs from "fs";
import path from "path";

function recordWait(
  device: string,
  callback: (err: Error | null, filepath: string) => void
) {
  let filepath = path.join(__dirname, "..", "files", "record.mp3");

  const micInstance = mic({
    rate: "44100",
    device,
    exitOnSilence: 12,
  });

  const micInputStream = micInstance.getAudioStream();

  micInputStream.on("error", (err: any) => {
    console.error("Mic Error:", err);
    callback(err, filepath);
  });

  let stream = fs.createWriteStream(filepath);

  micInputStream.pipe(stream);

  // console.log("Recording started");

  micInputStream.on("data", (data: any) => {
    // console.log("Receiving audio stream:", data.length, "bytes");
  });

  micInputStream.on("silence", async () => {
    console.log("Silence detected, stopped.");

    micInstance.stop();

    callback(null, filepath);
  });

  micInstance.start();
}

export default recordWait;
