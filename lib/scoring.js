export const LEVELS = ["No cumple", "Cumple parcialmente", "Cumple satisfactoriamente", "Cumple totalmente"];
export const DIMENSIONS = ["Sustentabilidad", "Compliance", "Gestión de riesgos"];
export const CRITICAL_IDS = [5, 6, 10, 12];

export const BANDS = [
  { min: 80, label: "Satisfactorio", tone: "good", text: "Prácticas consolidadas y monitoreo periódico." },
  { min: 60, label: "Bueno", tone: "ok", text: "Gestión implementada con oportunidades de mejora." },
  { min: 40, label: "Regular", tone: "warn", text: "Prácticas parciales y controles insuficientes en áreas relevantes." },
  { min: 0, label: "Deficiente", tone: "bad", text: "Brechas importantes; requiere acciones correctivas prioritarias." },
];

export function bandFor(score) {
  return BANDS.find((b) => score >= b.min) ?? BANDS[BANDS.length - 1];
}

const pct = (got, total) => (total ? (got / total) * 100 : 0);

// answers: { [questionId]: 0..3 }
export function computeResult(questions, answers) {
  let got = 0, total = 0;
  const byDim = {};
  for (const q of questions) {
    const level = answers[q.id];
    const points = q.weight * ((level ?? 0) / 3);
    got += points; total += q.weight;
    const d = (byDim[q.dimension] ??= { got: 0, total: 0 });
    d.got += points; d.total += q.weight;
  }
  const score = Math.round(pct(got, total) * 100) / 100;
  const dimensions = Object.entries(byDim).map(([name, d]) => ({
    name, score: Math.round(pct(d.got, d.total) * 100) / 100, band: bandFor(pct(d.got, d.total)),
  }));
  const alerts = questions.filter((q) => CRITICAL_IDS.includes(q.id) && answers[q.id] === 0);
  const actions = questions
    .filter((q) => answers[q.id] !== undefined && answers[q.id] < 3)
    .map((q) => ({ question: q, level: answers[q.id], plan: q.plans[answers[q.id]],
      priority: ["Alta", "Media", "Baja"][answers[q.id]] }))
    .sort((a, b) => a.level - b.level || b.question.weight - a.question.weight || a.question.id - b.question.id);
  return { score, band: bandFor(score), dimensions, alerts, actions };
}
