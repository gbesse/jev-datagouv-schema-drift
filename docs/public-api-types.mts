// Objectif : vérifier que les types publics sont importables.
import { datasetSnapshot, classifySchemaDrift } from "../src/index.mjs";
const dossier = datasetSnapshot({
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
});
void classifySchemaDrift(dossier, { decide: async () => ({}) });
