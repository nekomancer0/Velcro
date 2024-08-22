import { OpenAI } from "openai";
import fs from "fs";
import path from "path";

import dotenv from "dotenv";
dotenv.config();

let openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function query(
  input: string
): Promise<{ response: string; code?: string | null } | null> {
  let thread_id = process.env.THREAD_ID;

  if (!thread_id) {
    let thread = await openai.beta.threads.create();
    let envPath = path.join(process.cwd(), ".env");
    let content = fs.readFileSync(envPath, "utf-8");
    content += `THREAD_ID=${thread.id}\n`;

    thread_id = thread.id;
    fs.writeFileSync(envPath, content);
  }

  await openai.beta.threads.messages.create(thread_id, {
    role: "user",
    content: input,
  });

  let run = await openai.beta.threads.runs.createAndPoll(thread_id, {
    assistant_id: process.env.OPENAI_ASSISTANT!,
    response_format: { type: "json_object" },
    model: "gpt-4o-mini",
  });

  if (run.status === "completed") {
    let messages = await openai.beta.threads.messages.list(thread_id);
    let assistantResponse = messages.data[0]!;
    if (assistantResponse.role === "assistant") {
      let res = assistantResponse.content[0];
      if (res.type === "text") {
        let json = JSON.parse(res.text.value);
        let ret: {
          response: string;
          code?: string | null;
        } = {
          response: json.response,
        };

        if (json.code) {
          ret.code = json.code;
        }
        return ret;
      } else {
        return null;
      }
    } else {
      return null;
    }
  } else return null;
}

export default query;
