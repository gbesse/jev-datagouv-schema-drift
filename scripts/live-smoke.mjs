// Objectif : effectuer un appel Jev synthétique uniquement sur demande explicite.
import { createJevClient } from "../src/jev.mjs";
import { classifySchemaDrift } from "../src/index.mjs";
const client = createJevClient();
const résultat = await classifySchemaDrift({
  "id": "exemple-1",
  "text": "La colonne code_commune disparaît et la ressource CSV principale est remplacée par un fichier dont les identifiants ont changé.",
  "source": {
    "url": "https://example.test/source-publique",
    "date": "2026-09-25"
  },
  "details": {
    "territoire": "Commune Exemple",
    "origine": "donnée synthétique"
  }
}, client);
console.log(JSON.stringify({ décision: résultat.decision, confiance: résultat.confidence, usage: résultat.usage }, null, 2));
