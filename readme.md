<h1 align="center">● Velcro ●</h1>

Velcro est un assistant vocal conçu pour la domotique, offrant un contrôle total sur les appareils connectés de la maison. Il répond aux questions générales tout en exécutant des commandes pour gérer l'éclairage, la musique, et d'autres dispositifs domestiques. Velcro aspire à devenir totalement autonome, fonctionnant sans dépendre d'APIs externes ou d'Internet pour maximiser la sécurité et la confidentialité des données de ses utilisateurs.

## Initilisation

Quand vous démarrerez Velcro, des erreurs seront affichés, notamment en lien avec des clés d'environnements, appliquez les: ajoutez un <code>google_credentials.json</code> contenant les informations demandés, ainsi qu'un <code>.env</code> contenant `PORT`, `OPENAI_ASSISTANT` et `OPENAI_API_KEY`.

## Compatibilité

Vous avez besoin de ffmpeg pour enregistrer et jouer de l'audio.

Pour l'instant, seulement windows est compatible, mais vous pouvez changer les paramètres de ffmpeg dans le code source pour qu'il fonctionne sur linux et macos.
