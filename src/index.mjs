// Objectif : implémenter la frontière de décision métier propre au dépôt.
import { readFile } from "node:fs/promises";
export const DECISIONS = Object.freeze({
  "compatible": "compatible",
  "migration_required": "migration_requise",
  "breaking_change": "rupture_probable",
  "editorial_only": "éditorial_uniquement",
  "unchanged": "inchangé"
});
const CRITERIA = Object.freeze({
  "compatible": "compatible",
  "migration_required": "migration requise",
  "breaking_change": "rupture probable",
  "editorial_only": "éditorial uniquement",
  "unchanged": "inchangé"
});
export function datasetSnapshot(input) {
  if (!input?.id || !input?.text || !input?.source?.url || !input?.source?.date) throw new TypeError("Le dossier exige id, text, source.url et source.date");
  const date = new Date(input.source.date);
  if (Number.isNaN(date.valueOf())) throw new TypeError("source.date doit être une date ISO valide");
  return { ...input, id: String(input.id), text: String(input.text).trim(), source: { url: String(input.source.url), date: date.toISOString() } };
}
export async function classifySchemaDrift(input, provider) {
  const record = datasetSnapshot(input);
  if (record.beforeSchema !== undefined && record.beforeSchema === record.afterSchema && record.beforeDescription === record.afterDescription) return { decision: "unchanged", label: DECISIONS["unchanged"], probability: 1, review: false, deterministic: true };
  const response = await provider.decide({
    state: record,
    questions: { decision: { type: "choice", instructions: "Analysez ce comparaison de versions de jeu de données à partir des seuls éléments sourcés. Choisissez la catégorie la plus prudente. N’inventez ni fait, ni droit applicable, ni garantie.", criteria: CRITERIA } },
  });
  const answer = response.answers.decision;
  return { decision: answer.choice, label: DECISIONS[answer.choice], probability: answer.probabilities[answer.choice], confidence: answer.confidence, review: answer.confidence < 0.8, deterministic: false, usage: response.usage };
}
export async function runCli(argv, io = console) {
  if (argv.length !== 1) throw new Error("Usage : jev-datagouv-schema-drift <dossier.json>");
  const dossier = datasetSnapshot(JSON.parse(await readFile(argv[0], "utf8")));
  io.log(JSON.stringify({ dossier, prochaineÉtape: "Transmettez ce dossier à classifySchemaDrift avec un fournisseur Jev configuré." }, null, 2));
}
