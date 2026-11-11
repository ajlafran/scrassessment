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

import { serviceTier, temperature, gapTo, profileComplete, URGENCIES } from "../lib/funnel.js";
test("nivel de servicio según puntaje", () => {
  assert.equal(serviceTier(10).id, "adecuacion");
  assert.equal(serviceTier(39.9).id, "adecuacion");
  assert.equal(serviceTier(40).id, "acompanamiento");
  assert.equal(serviceTier(79.9).id, "acompanamiento");
  assert.equal(serviceTier(80).id, "auditoria");
});
test("temperatura del contacto", () => {
  const r = (score, nAlerts) => ({ score, alerts: Array(nAlerts).fill(1) });
  assert.equal(temperature({ urgency: URGENCIES[0] }, r(90, 0)), "Caliente");
  assert.equal(temperature({ urgency: URGENCIES[1] }, r(50, 0)), "Caliente");
  assert.equal(temperature({ urgency: URGENCIES[1] }, r(85, 0)), "Tibio");
  assert.equal(temperature({ urgency: URGENCIES[2] }, r(70, 0)), "Frío");
  assert.equal(temperature({ urgency: URGENCIES[2] }, r(30, 1)), "Tibio");
});
test("brecha al nivel satisfactorio y perfil completo", () => {
  assert.equal(gapTo(62.5), 17.5);
  assert.equal(gapTo(95), 0);
  assert.equal(profileComplete({ sector: "a", size: "b", urgency: "c" }), true);
  assert.equal(profileComplete({ sector: "a" }), false);
});

import { buildReport, criticalityOf, encodeAnswers, decodeAnswers, shareQuery, parseShareDate } from "../lib/report.js";
test("criticidad por reglas", () => {
  assert.equal(criticalityOf(10, 0), "critica"); // anticorrupción sin cumplimiento
  assert.equal(criticalityOf(1, 0), "alta");
  assert.equal(criticalityOf(1, 1), "media");
  assert.equal(criticalityOf(1, 2), "baja");
});
test("informe: fortalezas, mejoras por criticidad y resumen", () => {
  const a = { ...all(3), 10: 0, 3: 1, 4: 2, 7: 0 };
  const r = buildReport(questions, a);
  const g = Object.fromEntries(r.improvements.map((x) => [x.id, x.items.map((i) => i.question.id)]));
  assert.deepEqual(g.critica, [10]);
  assert.deepEqual(g.alta, [7]);
  assert.deepEqual(g.media, [3]);
  assert.deepEqual(g.baja, [4]);
  assert.ok(r.strengths.length === 6 && r.strengths.every((s) => s.level === 3));
  assert.ok(r.summary.lead.includes("sobre 100"));
  assert.ok(r.summary.points.some((p) => p.includes("punto crítico")));
  assert.ok(r.summary.points.some((p) => p.includes("4 mejoras")));
});
test("informe sin fortalezas totales usa las satisfactorias y sin alertas lo dice", () => {
  const r = buildReport(questions, all(2));
  assert.equal(r.strengths.length, 3);
  assert.ok(r.strengths.every((s) => s.level === 2));
  assert.ok(r.summary.points.some((p) => p.includes("No hay puntos críticos")));
  assert.equal(buildReport(questions, all(0)).strengths.length, 0);
});
test("enlace compartible: ida y vuelta y validación", () => {
  const a = Object.fromEntries(questions.map((q, i) => [q.id, i % 4]));
  const s = encodeAnswers(questions, a);
  assert.equal(s.length, 25);
  assert.deepEqual(decodeAnswers(questions, s), a);
  assert.equal(decodeAnswers(questions, s.slice(1)), null);
  assert.equal(decodeAnswers(questions, "x".repeat(25)), null);
  assert.equal(decodeAnswers(questions, "9".repeat(25)), null);
  const q = new URLSearchParams(shareQuery(questions, a, "Minera Test SA", new Date("2026-11-11T12:00:00Z")));
  assert.equal(q.get("e"), "Minera Test SA");
  assert.equal(q.get("f"), "20261111");
  assert.equal(parseShareDate("20261111"), "11 de noviembre de 2026");
});
