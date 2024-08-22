import YouTubePlugin from "./plugins/youtube"; // On ajoute les plugins nécessaires

export class DomoticClient {
  private config: any; // Le type peut être amélioré en fonction de ta config

  constructor(config: any) {
    this.config = config;
  }

  youtube() {
    return new YouTubePlugin();
  }
}

export default DomoticClient;
