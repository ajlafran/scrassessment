"use client";
import { useEffect, useRef } from "react";
import Logo from "./Logo";
import { DIMENSIONS, LEVELS } from "../lib/scoring";

const AREA_COLOR = { Sustentabilidad: "leaf", Compliance: "peach", "Gestión de riesgos": "lilac" };

export default function Quiz({ questions, idx, setIdx, answers, setAnswers, onFinish, onCheckpoint, onExit }) {
  const q = questions[idx];
  const last = idx === questions.length - 1;
  const timer = useRef(null);
  const value = answers[q.id];

  const advance = (merged) => {
    if (last) { if (questions.every((x) => merged[x.id] !== undefined)) onFinish(); return; }
    if (questions[idx + 1].dimension !== q.dimension) onCheckpoint(); else setIdx(idx + 1);
  };
  const next = () => advance(answers);
  const choose = (lvl) => {
    const merged = { ...answers, [q.id]: lvl };
    setAnswers(merged);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => advance(merged), 420);
  };
  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === "INPUT" && e.target.type !== "radio") return;
      if (["1", "2", "3", "4"].includes(e.key)) choose(Number(e.key) - 1);
      else if (e.key === "ArrowLeft" && idx > 0) { clearTimeout(timer.current); setIdx(idx - 1); }
      else if (e.key === "Enter" && value !== undefined) { clearTimeout(timer.current); next(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const segs = DIMENSIONS.map((d) => {
    const qs = questions.filter((x) => x.dimension === d);
    return { d, total: qs.length, done: qs.filter((x) => answers[x.id] !== undefined).length };
  });
  const inArea = questions.filter((x) => x.dimension === q.dimension);
  const posInArea = inArea.findIndex((x) => x.id === q.id) + 1;

  return (
    <div className={`quiz tone-${AREA_COLOR[q.dimension]}`}>
      <header className="quiz-bar">
        <div className="quiz-bar-in"><Logo /><button className="link-arrow" onClick={onExit}>Salir</button></div>
      </header>
      <div className="quiz-body">
        <div className="segs" role="progressbar" aria-valuemin={0} aria-valuemax={questions.length}
          aria-valuenow={Object.keys(answers).length} aria-label="Progreso del diagnóstico">
          {segs.map((s) => (
            <div key={s.d} className={`seg ${s.d === q.dimension ? "on" : ""}`} style={{ flex: s.total }}>
              <i style={{ width: `${(s.done / s.total) * 100}%` }} /><span>{s.d}</span>
            </div>
          ))}
        </div>

        <div className="qgrid" key={q.id}>
          <div className="qleft">
            <span className={`chip ${AREA_COLOR[q.dimension]}`}>{q.dimension} · {posInArea}/{inArea.length}</span>
            <h2 className="qtext">{q.text}</h2>
            <p className="qtopic">Tema: {q.topic}</p>
          </div>
          <fieldset className="qright">
            <legend className="sr">Nivel de cumplimiento</legend>
            {LEVELS.map((label, lvl) => (
              <label key={lvl} className={`opt l${lvl} ${value === lvl ? "sel" : ""}`}>
                <input type="radio" name={`q${q.id}`} checked={value === lvl} onChange={() => choose(lvl)} />
                <span className="meter" aria-hidden="true">{[0, 1, 2, 3].map((i) => <u key={i} className={i < lvl + 1 ? "f" : ""} style={lvl === 0 ? { opacity: i === 0 ? 1 : 0.25 } : undefined} />)}</span>
                <span className="opt-text"><strong>{label}</strong><small>{q.criteria[lvl]}</small></span>
                <kbd>{lvl + 1}</kbd>
              </label>
            ))}
          </fieldset>
        </div>

        <div className="quiz-nav">
          <button className="link-arrow" disabled={idx === 0} onClick={() => { clearTimeout(timer.current); setIdx(idx - 1); }}>← Anterior</button>
          <span className="count">Pregunta {idx + 1} de {questions.length}</span>
          <button className="pill-btn dark" disabled={value === undefined} onClick={() => { clearTimeout(timer.current); next(); }}>
            {last ? "Ver resultado" : questions[idx + 1].dimension !== q.dimension ? "Terminar área" : "Siguiente"}
          </button>
        </div>
      </div>
    </div>
  );
}
