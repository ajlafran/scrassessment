"use client";
import { useEffect, useMemo, useState } from "react";
import { LEVELS } from "../lib/scoring";
import { buildReport, shareQuery } from "../lib/report";

const AREA_COLOR = { Sustentabilidad: "leaf", Compliance: "peach", "Gestión de riesgos": "lilac" };

function ShareBar({ questions, answers, company }) {
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);
  useEffect(() => {
    setUrl(`${location.origin}/informe?${shareQuery(questions, answers, company)}`);
    setCanShare(typeof navigator.share === "function");
  }, [questions, answers, company]);
  const title = company ? `Informe de diagnóstico SCR — ${company}` : "Informe de diagnóstico SCR";
  const copy = async () => {
    try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2200); }
    catch { window.prompt("Copiá este enlace:", url); }
  };
  return (
    <div className="share">
      <div className="share-btns">
        <button className="pill-btn dark" onClick={copy} disabled={!url}>{copied ? "¡Enlace copiado!" : "Copiar enlace"}</button>
        <a className="pill-btn ghost" href={`https://wa.me/?text=${encodeURIComponent(`${title}: ${url}`)}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>
        <a className="pill-btn ghost" href={`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`Te comparto el informe de diagnóstico:\n\n${url}`)}`}>Email</a>
        {canShare && <button className="pill-btn ghost" onClick={() => navigator.share({ title, url }).catch(() => {})}>Compartir…</button>}
        <button className="pill-btn ghost" onClick={() => window.print()}>Descargar PDF</button>
      </div>
      <p className="share-note">El enlace incluye las respuestas de este diagnóstico: quien lo reciba podrá ver el informe completo.</p>
    </div>
  );
}

export default function ReportBody({ questions, answers, company, dateLabel, showScore = true, withShare = true }) {
  const rep = useMemo(() => buildReport(questions, answers, company), [questions, answers, company]);
  const { result, summary, strengths, improvements } = rep;
  const total = improvements.reduce((n, g) => n + g.items.length, 0);
  return (
    <section className="rep" id="informe">
      <div className="rep-head">
        <div>
          <p className="eyebrow">Informe ejecutivo{dateLabel ? ` · ${dateLabel}` : ""}</p>
          <h2>{company ? `Diagnóstico de ${company}` : "Diagnóstico de cumplimiento"}</h2>
        </div>
        {withShare && <ShareBar questions={questions} answers={answers} company={company} />}
      </div>

      <div className="rep-summary">
        <p className="rep-lead">{summary.lead}</p>
        <ul>{summary.points.map((p) => <li key={p}>{p}</li>)}</ul>
      </div>

      {showScore && (
        <div className="rep-areas">
          {result.dimensions.map((d) => (
            <div key={d.name} className={`rep-area ${AREA_COLOR[d.name]}`}>
              <span>{d.name}</span><b>{Math.round(d.score)}<small>/100</small></b><i><u style={{ width: `${d.score}%` }} /></i><em>{d.band.label}</em>
            </div>
          ))}
        </div>
      )}

      <div className="rep-block">
        <div className="rep-block-head"><h3>Fortalezas principales</h3><span>{strengths.length ? "Lo que ya juega a tu favor" : ""}</span></div>
        {strengths.length === 0 ? (
          <p className="rep-empty">Todavía no hay prácticas consolidadas. El plan de mejoras indica por dónde empezar.</p>
        ) : (
          <ul className="rep-strengths">
            {strengths.map(({ question: q, level, text }) => (
              <li key={q.id}>
                <span className="ok-dot">✓</span>
                <div>
                  <strong>{q.topic}</strong>
                  <small>{q.dimension} · {LEVELS[level]}</small>
                  <p>{text}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rep-block">
        <div className="rep-block-head"><h3>Mejoras por nivel de criticidad</h3><span>{total} {total === 1 ? "punto" : "puntos"}</span></div>
        <div className="crit-tiles">
          {improvements.map((g) => (
            <div key={g.id} className={`crit-tile ${g.id}`}><b>{g.items.length}</b><span>{g.label}</span><small>{g.horizon}</small></div>
          ))}
        </div>
        {improvements.filter((g) => g.items.length).map((g) => (
          <div className={`crit-group ${g.id}`} key={g.id}>
            <div className="crit-head">
              <span className="crit-badge">{g.label}</span>
              <p>{g.note}</p>
              <small>Plazo sugerido: {g.horizon}</small>
            </div>
            <ol className="crit-items">
              {g.items.map(({ question: q, level, plan }) => (
                <li key={q.id}>
                  <div><strong>{q.topic}</strong><small>{q.dimension} · {LEVELS[level]}</small></div>
                  <p>{plan}</p>
                </li>
              ))}
            </ol>
          </div>
        ))}
        {total === 0 && <p className="rep-empty">No se identificaron mejoras pendientes. Mantené las revisiones periódicas.</p>}
      </div>

      <p className="rep-note">Autoevaluación orientativa basada en respuestas declaradas; no constituye una certificación ni reemplaza una auditoría. Los planes son recomendaciones iniciales que deben ajustarse a la situación de cada empresa.</p>
    </section>
  );
}
