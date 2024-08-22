import { exec } from "child_process";
import { existsSync } from "fs";

type PlayCallback = (
  playback: {
    stop: () => void;
  },
  onFinish: (callback: () => void) => void
) => void;

function play(path: string, callback?: PlayCallback) {
  if (!existsSync(path)) return;

  console.log(`Playback starting...`);
  let process = exec(
    `ffplay "${path}" -nodisp -autoexit`,
    (err, stdout, stderr) => {
      if (err) console.error(err);
    }
  );

  if (callback) {
    callback(
      {
        stop() {
          process.kill();
        },
      },
      (callback) => {
        process.on("close", callback);
      }
    );
  }
}

export default play;
