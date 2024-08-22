import { OpenAI } from "openai";
import fs from "fs";
import path from "path";

import dotenv from "dotenv";
dotenv.config();

let openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function TTS(text: string) {
  let filepath = path.join(__dirname, "..", "files", "tts.mp3");
  let response = await openai.audio.speech.create({
    voice: "alloy",
    input: text,
    model: "tts-1",
  });

  const buffer = Buffer.from(await response.arrayBuffer());
  await fs.promises.writeFile(filepath, buffer);

  return {
    path: filepath,
  };
}

export default TTS;
