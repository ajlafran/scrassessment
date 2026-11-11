"use client";
import Logo from "./Logo";
import { DIMENSIONS } from "../lib/scoring";

export default function Checkpoint({ dimension, questions, result, onContinue, onReview }) {
  const dim = result.dimensions.find((d) => d.name === dimension);
  const qs = questions.filter((q) => q.dimension === dimension);
  const improve = result.actions.filter((a) => a.question.dimension === dimension).length;
  const alerts = result.alerts.filter((q) => q.dimension === dimension).length;
  const step = DIMENSIONS.indexOf(dimension) + 1;
  const next = DIMENSIONS[step];
  return (
    <div className="quiz">
      <header className="quiz-bar"><div className="quiz-bar-in"><Logo /></div></header>
      <div className="quiz-body cp">
        <p className="eyebrow">Área {step} de {DIMENSIONS.length} completada</p>
        <h2 className="qtext">{dimension}: {Math.round(dim.score)} <span className="muted">/ 100</span></h2>
        <div className="check-bar"><i><u style={{ width: `${dim.score}%` }} /></i><span className={`pill ${dim.band.tone}`}>{dim.band.label}</span></div>
        <ul className="check-list">
          <li><b>{qs.length - improve}</b> de {qs.length} puntos en nivel total</li>
          <li><b>{improve}</b> {improve === 1 ? "punto" : "puntos"} con mejoras posibles</li>
          {alerts > 0 && <li className="warn-li"><b>{alerts}</b> {alerts === 1 ? "alerta crítica" : "alertas críticas"} en esta área</li>}
        </ul>
        <div className="dots" aria-hidden="true">{DIMENSIONS.map((d, i) => <i key={d} className={i < step ? "on" : ""} />)}</div>
        <div className="quiz-nav">
          <button className="link-arrow" onClick={onReview}>← Revisar respuestas</button>
          <button className="pill-btn dark big" onClick={onContinue}>Continuar con {next}</button>
        </div>
      </div>
    </div>
  );
}
