import dotenv from "dotenv";
import play from "./utils/play";
import wakeup from "./utils/wakeup";
import { EventEmitter } from "stream";
import recordWait from "./utils/recordWait";
import TTS from "./utils/TTS";
import STT from "./utils/STT";
import query from "./utils/query";
import { SerialPort } from "serialport";

import fs from "fs";
import DomoticClient from "./DomoticClient";

dotenv.config();
import conf = require("./config.json");

class VelcroClient {
  private audioDevice: string;
  private _domotic: DomoticClient;
  private _os: "linux" | "windows" = "windows";
  private _events = new EventEmitter();

  constructor(config: typeof conf) {
    this.audioDevice = config.audioInput;
    this._domotic = new DomoticClient(config);

    if (conf.os === "windows") this._os = "windows";
    else if (conf.os === "linux") this._os = "linux";
    else throw Error("OS target not found");
  }

  on(eventName: "wake", listener: () => void): this;
  on(eventName: "wake" | string, listener: (...args: any[]) => void): any {
    this._events.on(eventName, (args) => {
      listener(args);
    });
  }

  emit(eventName: "wake"): boolean;
  emit(eventName: "wake" | string, ...args: any[]): any {
    this._events.emit(eventName, args);
  }

  //@ts-ignore
  communicate(callback: (code: boolean) => void | Promise<void>) {
    console.log(`Waiting for speech...`);

    let _this = this;
    recordWait(this.audioDevice, async (err, filepath) => {
      if (err) {
        this.communicate(callback);
      } else if (filepath) {
        let { text } = await STT(filepath);

        if (text === "") {
          this.communicate(callback);

          return;
        }

        console.log(`User:`, text);
        let response = await query(text);

        if (response) {
          let res = response.response;
          let code = response.code;
          if (code) {
            console.log(code.replace(/^(client)/g, "_this"));
            eval(code.replace(/^(client)/g, "_this"));
          }

          console.log(`Velcro:`, res);

          let { path } = await TTS(res);

          play(path, async () => {
            fs.rmSync(path);
            fs.rmSync(filepath);

            await callback(code ? true : false);
          });
        }
      }
    });
  }

  async wake() {
    let activated = await wakeup("velcro", this.audioDevice);
    if (activated) this.emit("wake");
    return activated;
  }

  quit() {
    process.kill(process.pid);
  }

  music(service: string) {
    return {
      search: (str: string) => {
        return {
          play: () => {
            (async () => {
              let s = this._domotic[service];
              let url = await s.search(str);

              if (url) {
                await s.play(url);
              }
            })();
          },
        };
      },
    };
  }
}

// Microphone (USB Audio Device)
// let client = new VelcroClient(require("./config.json"));

// (async () => {
//   async function vel() {
//     client.communicate(async (isThereCode) => {
//       await vel();
//     });
//   }

//   vel();
// })();

export default VelcroClient;
