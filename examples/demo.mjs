// Objectif : montrer une décision sémantique avec des données entièrement synthétiques.
import assert from "node:assert/strict";
import { classifySchemaDrift } from "../src/index.mjs";
import { createFakeProvider } from "../src/jev.mjs";
const dossier = {
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
};
const provider = createFakeProvider(() => ({ model: "jev-1.13.0", answers: { decision: { type: "choice", choice: "breaking_change", probabilities: {
  "compatible": 0.045,
  "migration_required": 0.045,
  "breaking_change": 0.82,
  "editorial_only": 0.045,
  "unchanged": 0.045
}, confidence: 0.82 } }, usage: { input_tokens: 120, output_tokens: 0 } }));
const résultat = await classifySchemaDrift(dossier, provider);
assert.equal(résultat.decision, "breaking_change");
assert.equal(résultat.review, false);
assert.equal(provider.calls, 1);
console.log(`Décision : ${résultat.label} · probabilité : ${résultat.probability}`);
