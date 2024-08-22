import play from "./play";
import TTS from "./TTS";

async function announceError() {
  let { path } = await TTS("Désolé, une erreur est survenue.");

  play(path, () => {});
}

export default announceError;
