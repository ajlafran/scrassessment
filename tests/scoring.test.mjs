import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { computeResult, bandFor } from "../lib/scoring.js";

const { questions } = JSON.parse(readFileSync(new URL("../data/assessment.json", import.meta.url)));
const all = (n) => Object.fromEntries(questions.map((q) => [q.id, n]));

test("hay 25 preguntas en 3 dimensiones con planes para los 4 niveles", () => {
  assert.equal(questions.length, 25);
  assert.equal(new Set(questions.map((q) => q.dimension)).size, 3);
  assert.ok(questions.every((q) => q.plans.length === 4 && q.plans.every(Boolean)));
});
test("todo en No cumple = 0 y todo en Total = 100", () => {
  assert.equal(computeResult(questions, all(0)).score, 0);
  assert.equal(computeResult(questions, all(3)).score, 100);
});
test("todo Parcial ≈ 33,33 y todo Satisfactorio ≈ 66,67", () => {
  assert.ok(Math.abs(computeResult(questions, all(1)).score - 33.33) < 0.01);
  assert.ok(Math.abs(computeResult(questions, all(2)).score - 66.67) < 0.01);
});
test("franjas del Excel en los bordes", () => {
  assert.equal(bandFor(39.99).label, "Deficiente");
  assert.equal(bandFor(40).label, "Regular");
  assert.equal(bandFor(59.99).label, "Regular");
  assert.equal(bandFor(60).label, "Bueno");
  assert.equal(bandFor(79.99).label, "Bueno");
  assert.equal(bandFor(80).label, "Satisfactorio");
});
test("sin planes si todo es Total; con planes ordenados por prioridad si no", () => {
  assert.equal(computeResult(questions, all(3)).actions.length, 0);
  const a = { ...all(3), 3: 2, 10: 0, 14: 1 };
  const r = computeResult(questions, a);
  assert.deepEqual(r.actions.map((x) => x.question.id), [10, 14, 3]);
  assert.deepEqual(r.actions.map((x) => x.priority), ["Alta", "Media", "Baja"]);
  assert.equal(r.actions[0].plan, questions.find((q) => q.id === 10).plans[0]);
});
test("alerta crítica solo con No cumple en preguntas sensibles", () => {
  assert.deepEqual(computeResult(questions, { ...all(3), 10: 0, 4: 0 }).alerts.map((q) => q.id), [10]);
  assert.equal(computeResult(questions, { ...all(3), 10: 1 }).alerts.length, 0);
});
