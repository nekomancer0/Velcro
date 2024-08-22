import fs from "fs";

import { SpeechClient } from "@google-cloud/speech";

let speechClient = new SpeechClient({
  credentials: require("../google_credentials.json"),
});

async function STT(filepath: string) {
  let response = await speechClient.recognize({
    audio: { content: fs.readFileSync(filepath) },
    config: {
      languageCode: "fr-FR",
      encoding: "MP3",
      sampleRateHertz: 44100,
      audioChannelCount: 1,
      enableAutomaticPunctuation: true,
      enableSpokenPunctuation: { value: true },
    },
  });

  try {
    //@ts-ignore

    let text = response[0].results[0].alternatives[0].transcript;
    return {
      text: text!,
    };
  } catch (e) {
    console.error(e);
    return {
      text: "",
    };
  }
}

export default STT;
