// Objectif : vérifier la normalisation, la règle déterministe et les décisions sémantiques.
import test from "node:test";
import assert from "node:assert/strict";
import { datasetSnapshot, classifySchemaDrift } from "../src/index.mjs";
import { createFakeProvider } from "../src/jev.mjs";
const casLimite = {
  "id": "limite-1",
  "text": "Cas synthétique traité par une règle déterministe avant toute analyse sémantique.",
  "source": {
    "url": "https://example.test/cas-limite",
    "date": "2026-09-27"
  },
  "beforeSchema": "id:string,date:date",
  "afterSchema": "id:string,date:date",
  "beforeDescription": "Description stable",
  "afterDescription": "Description stable"
};
const casPrincipal = {
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
const casÀRevoir = {
  "id": "revue-1",
  "text": "Deux colonnes sont renommées avec des libellés proches, mais aucune note de migration ne confirme leur équivalence.",
  "source": {
    "url": "https://example.test/dossier-ambigu",
    "date": "2026-09-26"
  },
  "details": {
    "origine": "donnée synthétique",
    "signal": "informations incomplètes"
  }
};
test("exige une source", () => assert.throws(() => datasetSnapshot({ id: "x", text: "y" }), /source/));
test("applique le cas limite sans appel Jev", async () => {
  const provider = createFakeProvider(() => { throw new Error("appel interdit"); });
  assert.equal((await classifySchemaDrift(casLimite, provider)).decision, "unchanged");
  assert.equal(provider.calls, 0);
});
test("classe un dossier sourcé avec une confiance suffisante", async () => {
  const provider = createFakeProvider(() => ({ model: "jev-1.13.0", answers: { decision: { type: "choice", choice: "breaking_change", probabilities: {
  "compatible": 0.045,
  "migration_required": 0.045,
  "breaking_change": 0.82,
  "editorial_only": 0.045,
  "unchanged": 0.045
}, confidence: 0.82 } }, usage: { input_tokens: 10, output_tokens: 0 } }));
  const résultat = await classifySchemaDrift(casPrincipal, provider);
  assert.equal(résultat.decision, "breaking_change");
  assert.equal(résultat.review, false);
  assert.equal(provider.calls, 1);
});
test("marque une décision incertaine pour revue humaine", async () => {
  const provider = createFakeProvider(() => ({ model: "jev-1.13.0", answers: { decision: { type: "choice", choice: "migration_required", probabilities: {
  "compatible": 0.12,
  "migration_required": 0.52,
  "breaking_change": 0.12,
  "editorial_only": 0.12,
  "unchanged": 0.12
}, confidence: 0.62 } }, usage: { input_tokens: 10, output_tokens: 0 } }));
  const résultat = await classifySchemaDrift(casÀRevoir, provider);
  assert.equal(résultat.decision, "migration_required");
  assert.equal(résultat.review, true);
  assert.equal(résultat.confidence, 0.62);
  assert.equal(provider.calls, 1);
});
