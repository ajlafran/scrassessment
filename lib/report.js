import { CRITICAL_IDS, computeResult } from "./scoring.js";
import { gapTo } from "./funnel.js";

// Niveles de criticidad: se asignan por reglas a partir del nivel de respuesta de cada pregunta
export const CRITICALITY = [
  { id: "critica", label: "Crítica", horizon: "0 a 30 días", note: "Sin ningún nivel de cumplimiento en un punto que suele ser excluyente para calificar como proveedor." },
  { id: "alta", label: "Alta", horizon: "30 a 60 días", note: "Sin ningún nivel de cumplimiento: no hay prácticas implementadas." },
  { id: "media", label: "Media", horizon: "60 a 90 días", note: "Prácticas parciales o informales que hay que formalizar." },
  { id: "baja", label: "Baja", horizon: "Mejora continua", note: "Base sólida con brechas menores de alcance, evidencia o seguimiento." },
];

export function criticalityOf(questionId, level) {
  if (level === 0) return CRITICAL_IDS.includes(questionId) ? "critica" : "alta";
  if (level === 1) return "media";
  return "baja";
}

const fmt = (n) => String(Math.round(n * 10) / 10).replace(".", ",");
const plural = (n, one, many) => (n === 1 ? one : many);

export function buildReport(questions, answers, company = "") {
  const who = company ? company : "La empresa";
  const result = computeResult(questions, answers);
  const { score, band, dimensions, alerts, actions } = result;

  const improvements = CRITICALITY.map((c) => ({
    ...c,
    items: actions
      .filter((a) => criticalityOf(a.question.id, a.level) === c.id)
      .map((a) => ({ question: a.question, level: a.level, plan: a.plan }))
      .sort((x, y) => y.question.weight - x.question.weight || x.question.id - y.question.id),
  }));

  const byWeight = (a, b) => b.weight - a.weight || a.id - b.id;
  const full = questions.filter((q) => answers[q.id] === 3).sort(byWeight);
  const solid = questions.filter((q) => answers[q.id] === 2).sort(byWeight);
  const strengths = full.slice(0, 6).map((q) => ({ question: q, level: 3, text: q.criteria[3] }));
  for (const q of solid) {
    if (strengths.length >= 3) break;
    strengths.push({ question: q, level: 2, text: q.criteria[2] });
  }

  // Resumen ejecutivo armado con reglas
  const lead = `${who} alcanzó ${fmt(score)} puntos sobre 100, en el nivel ${band.label}.`;
  const points = [];
  const gap = gapTo(score);
  points.push(gap > 0
    ? `Faltan ${fmt(gap)} puntos para el nivel Satisfactorio (80), la referencia habitual al evaluar proveedores mineros.`
    : `${who} alcanzó el nivel Satisfactorio, la referencia habitual al evaluar proveedores mineros.`);
  const sorted = [...dimensions].sort((a, b) => b.score - a.score);
  const strong = sorted[0], weak = sorted[sorted.length - 1];
  if (strong.score !== weak.score) {
    points.push(`El área más sólida es ${strong.name} (${fmt(strong.score)}/100) y la que requiere más atención es ${weak.name} (${fmt(weak.score)}/100).`);
  } else {
    points.push("Las tres áreas muestran un nivel similar.");
  }
  points.push(alerts.length
    ? `Hay ${alerts.length} ${plural(alerts.length, "punto crítico", "puntos críticos")} sin ningún nivel de cumplimiento (${alerts.map((q) => q.topic.toLowerCase()).join(", ")}): suelen ser excluyentes y conviene resolverlos primero.`
    : "No hay puntos críticos sin cumplimiento, lo que reduce el riesgo de quedar excluido en una evaluación.");
  const parts = improvements.filter((g) => g.items.length).map((g) => `${g.items.length} ${g.label.toLowerCase()}${g.items.length === 1 ? "" : "s"}`);
  points.push(actions.length
    ? `Se identificaron ${actions.length} ${plural(actions.length, "mejora", "mejoras")}: ${parts.length > 1 ? parts.slice(0, -1).join(", ") + " y " + parts[parts.length - 1] : parts[0]}.`
    : "No se identificaron mejoras pendientes.");

  return { result, summary: { lead, points }, strengths, improvements };
}

// Enlace para compartir: las respuestas viajan codificadas (un dígito por pregunta)
export const encodeAnswers = (qs, a) => qs.map((q) => a[q.id] ?? "x").join("");
export function decodeAnswers(qs, s) {
  if (typeof s !== "string" || s.length !== qs.length) return null;
  const out = {};
  for (let i = 0; i < qs.length; i++) {
    if (!/[0-3]/.test(s[i])) return null;
    out[qs[i].id] = Number(s[i]);
  }
  return out;
}
export function shareQuery(qs, answers, company, date = new Date()) {
  const p = new URLSearchParams();
  p.set("r", encodeAnswers(qs, answers));
  if (company) p.set("e", company.slice(0, 80));
  p.set("f", date.toISOString().slice(0, 10).replaceAll("-", ""));
  return p.toString();
}
export function parseShareDate(f) {
  if (!/^\d{8}$/.test(f ?? "")) return "";
  const d = new Date(Date.UTC(+f.slice(0, 4), +f.slice(4, 6) - 1, +f.slice(6, 8)));
  return d.toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}
