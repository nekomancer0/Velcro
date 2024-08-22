import fs from "node:fs";
import { exec } from "node:child_process";
import path = require("node:path");

function record(options?: {
  secs?: number;
  device?: string;
  loop?: boolean;
  silenceDuration?: number;
  name?: string;
  deleteOnEnd?: boolean;
}) {
  if (!options) options = {};
  if (!options.secs) options.secs = 4.5;
  if (!options.device) options.device = "Microphone (USB Audio Device)";
  if (typeof options.loop === "undefined") options.loop = false;
  if (!options.silenceDuration) options.silenceDuration = 2;
  if (!options.name) options.name = "instructions.wav";
  if (!options.deleteOnEnd) options.deleteOnEnd = false;

  let started = false;
  let finished = false;

  let outputFilePath = path.join(__dirname, "..", "files", options.name);

  try {
    if (fs.existsSync(outputFilePath)) fs.rmSync(outputFilePath);
  } catch (e) {
    console.error(e);
  }

  let cmd = `ffmpeg -f dshow -i audio="${options.device}" "${outputFilePath}"`;

  let recorder = exec(cmd, (err, stdout, stderr) => {
    // if (err) console.error(err);
    // console.log(stdout);
  });

  let ret = {
    process: recorder,
    path: outputFilePath,
    close: () => {
      exec(`taskkill /F /PID ${recorder.pid} /T`, (err, stdout, stderr) => {
        // if (err) console.error(err);

        try {
          if (options && options.deleteOnEnd) {
            if (fs.existsSync(outputFilePath)) fs.rmSync(outputFilePath);
          }
        } catch (e) {
          // console.error(e);
        }
      });
    },
    onStart(callback: () => Promise<void> | void) {
      let interval = setInterval(async () => {
        if (started) {
          clearInterval(interval);
          await callback();
          return;
        }
      });
    },
    onFinish(callback: () => void) {
      let interval = setInterval(() => {
        if (finished) {
          clearInterval(interval);
          callback();
          return;
        }
      });
    },
  };

  recorder.on("spawn", () => {
    let i = 0;
    let interval = setInterval(() => {
      if (fs.existsSync(outputFilePath)) {
        clearInterval(interval);
        // console.log("time delay writing file:", i, "miliseconds");

        setTimeout(() => {
          started = true;
        }, i);

        ret.onStart(() => {
          if (
            (typeof options.loop !== "undefined" || options.loop === false) &&
            typeof options.secs !== "undefined"
          ) {
            setTimeout(() => {
              ret.close();
              finished = true;
            }, options.secs * 1000 - i);
          }
        });
      } else {
        i++;
      }
    }, 0);
  });

  return ret;
}

export default record;
