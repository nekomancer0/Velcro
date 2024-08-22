import fs from "fs";
import STT from "./STT";
import recordWait from "./recordWait";
import announceError from "./VelcroError";

async function wakeup(word: string, device: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    recordWait(device, async (err, filepath) => {
      if (err) {
        console.error(err);
        await announceError();
      } else {
        if (filepath && fs.existsSync(filepath)) {
          try {
            let { text } = await STT(filepath);
            console.log(text);

            if (!text) return resolve(false);

            if (text.toLowerCase().startsWith(word)) {
              resolve(true);
              try {
                fs.rmSync(filepath);
              } catch (e) {}
            } else resolve(false);
          } catch (e) {
            console.error(e);
            resolve(false);
          }
        } else resolve(false);
      }
    });
  });
}

export default wakeup;
