"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Logo from "./Logo";
import { DIMENSIONS, LEVELS, computeResult } from "../lib/scoring";

const KEY = "scr-assessment-v1";
const DIM_INFO = {
  Sustentabilidad: "Impacto ambiental y social, seguridad de las personas y objetivos medibles.",
  Compliance: "Ética, anticorrupción, denuncias y cumplimiento de obligaciones legales y contractuales.",
  "Gestión de riesgos": "Cómo se identifican, miden, tratan y reportan los riesgos del negocio.",
};

function save(state) { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {} }
function load() { try { return JSON.parse(localStorage.getItem(KEY)); } catch { return null; } }

export default function Assessment({ questions, config }) {
  const [stage, setStage] = useState("intro"); // intro | quiz | result
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [unlocked, setUnlocked] = useState(false);
  const [ready, setReady] = useState(false);
  const top = useRef(null);

  useEffect(() => {
    const s = load();
    if (s) { setStage(s.stage ?? "intro"); setStep(s.step ?? 0); setAnswers(s.answers ?? {}); setUnlocked(!!s.unlocked); }
    setReady(true);
  }, []);
  useEffect(() => { if (ready) save({ stage, step, answers, unlocked }); }, [ready, stage, step, answers, unlocked]);
  useEffect(() => { if (ready) top.current?.scrollIntoView({ behavior: "smooth", block: "start" }); }, [stage, step, ready]);

  const dim = DIMENSIONS[step];
  const stepQuestions = useMemo(() => questions.filter((q) => q.dimension === dim), [questions, dim]);
  const stepDone = stepQuestions.every((q) => answers[q.id] !== undefined);
  const answered = Object.keys(answers).length;
  const result = useMemo(() => (stage === "result" ? computeResult(questions, answers) : null), [stage, questions, answers]);

  const restart = () => { setAnswers({}); setStep(0); setUnlocked(false); setStage("intro"); };

  return (
    <>
      <header className="topbar"><div className="wrap"><Logo /></div></header>
      <main className="wrap" ref={top}>
        {!ready ? null : stage === "intro" ? (
          <Intro onStart={() => setStage("quiz")} resume={answered > 0} onRestart={restart} />
        ) : stage === "quiz" ? (
          <section aria-labelledby="dim-title">
            <Progress step={step} answered={answered} total={questions.length} />
            <p className="eyebrow">Área {step + 1} de {DIMENSIONS.length}</p>
            <h2 id="dim-title">{dim}</h2>
            <p className="muted">{DIM_INFO[dim]}</p>
            {stepQuestions.map((q, i) => (
              <Question key={q.id} q={q} index={i + 1} value={answers[q.id]}
                onChange={(v) => setAnswers((a) => ({ ...a, [q.id]: v }))} />
            ))}
            <div className="nav">
              <button className="btn ghost" onClick={() => (step === 0 ? setStage("intro") : setStep(step - 1))}>Volver</button>
              <button className="btn primary" disabled={!stepDone}
                onClick={() => (step < DIMENSIONS.length - 1 ? setStep(step + 1) : setStage("result"))}>
                {step < DIMENSIONS.length - 1 ? "Siguiente área" : "Ver mi resultado"}
              </button>
            </div>
            {!stepDone && <p className="hint">Respondé todas las preguntas de esta área para continuar.</p>}
          </section>
        ) : (
          <Result result={result} answers={answers} unlocked={unlocked} onUnlock={() => setUnlocked(true)}
            config={config} onBack={() => { setStep(DIMENSIONS.length - 1); setStage("quiz"); }} onRestart={restart} />
        )}
      </main>
      <footer className="footer"><div className="wrap">© 2026 SCR · Autoevaluación orientativa basada en respuestas declaradas; no constituye una certificación.</div></footer>
    </>
  );
}

function Intro({ onStart, resume, onRestart }) {
  return (
    <section className="hero">
      <p className="eyebrow">Diagnóstico para proveedores mineros</p>
      <h1>¿Tu empresa está lista para ser proveedor de la minería?</h1>
      <p className="lead">
        Respondé 25 preguntas en unos 10 minutos y conocé tu nivel de cumplimiento en Sustentabilidad,
        Compliance y Gestión de riesgos, con un plan de acción para cerrar las brechas.
      </p>
      <div className="cta-row">
        <button className="btn primary big" onClick={onStart}>{resume ? "Continuar diagnóstico" : "Comenzar diagnóstico"}</button>
        {resume && <button className="btn ghost big" onClick={onRestart}>Empezar de nuevo</button>}
      </div>
      <ul className="cards">
        {DIMENSIONS.map((d) => (
          <li className="card" key={d}><h3>{d}</h3><p>{DIM_INFO[d]}</p></li>
        ))}
      </ul>
    </section>
  );
}

function Progress({ step, answered, total }) {
  return (
    <div className="progress" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={answered}
      aria-label="Progreso del diagnóstico">
      <div className="progress-meta"><span>{DIMENSIONS[step]}</span><span>{answered} de {total} respondidas</span></div>
      <div className="bar"><div style={{ width: `${(answered / total) * 100}%` }} /></div>
    </div>
  );
}

function Question({ q, index, value, onChange }) {
  return (
    <fieldset className="question">
      <legend><span className="qnum">{index}</span> {q.text}</legend>
      <div className="options">
        {LEVELS.map((label, lvl) => (
          <label key={lvl} className={`option ${value === lvl ? "selected" : ""}`}>
            <input type="radio" name={`q${q.id}`} checked={value === lvl} onChange={() => onChange(lvl)} />
            <span><strong>{label}</strong><small>{q.criteria[lvl]}</small></span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function Gauge({ score, tone }) {
  const r = 52, c = 2 * Math.PI * r;
  return (
    <svg className={`gauge ${tone}`} viewBox="0 0 120 120" role="img" aria-label={`Puntaje ${Math.round(score)} de 100`}>
      <circle cx="60" cy="60" r={r} className="gauge-bg" />
      <circle cx="60" cy="60" r={r} className="gauge-fg" strokeDasharray={c} strokeDashoffset={c * (1 - score / 100)}
        transform="rotate(-90 60 60)" />
      <text x="60" y="58" textAnchor="middle" className="gauge-num">{Math.round(score)}</text>
      <text x="60" y="78" textAnchor="middle" className="gauge-sub">de 100</text>
    </svg>
  );
}

function Result({ result, answers, unlocked, onUnlock, config, onBack, onRestart }) {
  const { score, band, dimensions, alerts, actions } = result;
  return (
    <section>
      <p className="eyebrow">Tu diagnóstico</p>
      <div className="summary">
        <Gauge score={score} tone={band.tone} />
        <div>
          <span className={`pill ${band.tone}`}>{band.label}</span>
          <h2>Tu nivel de cumplimiento es {band.label.toLowerCase()}</h2>
          <p className="muted">{band.text}</p>
        </div>
      </div>

      <div className="dims">
        {dimensions.map((d) => (
          <div className="dim" key={d.name}>
            <div className="dim-head"><strong>{d.name}</strong><span>{Math.round(d.score)} / 100</span></div>
            <div className="bar"><div className={d.band.tone} style={{ width: `${d.score}%` }} /></div>
            <small className="muted">{d.band.label}</small>
          </div>
        ))}
      </div>

      {alerts.length > 0 && (
        <div className="alert" role="alert">
          <strong>Alertas críticas</strong>
          <p>Estos puntos suelen ser excluyentes al evaluar proveedores mineros. Aparecen sin ningún nivel de cumplimiento:</p>
          <ul>{alerts.map((q) => <li key={q.id}>{q.topic}</li>)}</ul>
        </div>
      )}

      {actions.length === 0 ? (
        <div className="card"><h3>¡Excelente!</h3><p>Declaraste cumplimiento total en todas las áreas. Mantener las revisiones periódicas es la clave.</p></div>
      ) : unlocked ? (
        <Plan actions={actions} config={config} />
      ) : (
        <LeadForm count={actions.length} score={score} band={band} dimensions={dimensions} alerts={alerts}
          answers={answers} onUnlock={onUnlock} />
      )}

      <div className="nav">
        <button className="btn ghost" onClick={onBack}>Revisar respuestas</button>
        <button className="btn ghost" onClick={onRestart}>Empezar de nuevo</button>
      </div>
    </section>
  );
}

function LeadForm({ count, score, band, dimensions, alerts, answers, onUnlock }) {
  const [f, setF] = useState({ company: "", name: "", email: "", phone: "", consent: false, website: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setError("");
    try {
      const res = await fetch("/api/lead", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...f, score, band: band.label, dimensions: dimensions.map((d) => ({ name: d.name, score: d.score })),
          alerts: alerts.map((q) => q.topic), answers }),
      });
      const out = await res.json().catch(() => ({}));
      if (!res.ok || !out.ok) throw new Error(out.error || "No pudimos enviar tus datos.");
      onUnlock();
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  }

  return (
    <form className="card lead" onSubmit={submit}>
      <h3>Recibí tu plan de acción</h3>
      <p className="muted">Detectamos {count} {count === 1 ? "punto" : "puntos"} a mejorar. Dejanos tus datos y te mostramos el plan recomendado para cada uno.</p>
      <div className="fields">
        <label>Empresa<input required value={f.company} onChange={set("company")} autoComplete="organization" /></label>
        <label>Nombre y apellido<input required value={f.name} onChange={set("name")} autoComplete="name" /></label>
        <label>Email<input required type="email" value={f.email} onChange={set("email")} autoComplete="email" /></label>
        <label>Teléfono<input required type="tel" value={f.phone} onChange={set("phone")} autoComplete="tel" /></label>
      </div>
      <input className="trap" tabIndex={-1} aria-hidden="true" autoComplete="off" value={f.website} onChange={set("website")} />
      <label className="check">
        <input type="checkbox" checked={f.consent} onChange={set("consent")} required />
        <span>Acepto que me contacten con información sobre este diagnóstico y que se guarden mis datos para ese fin.</span>
      </label>
      {error && <p className="error" role="alert">{error}</p>}
      <button className="btn primary big" disabled={busy}>{busy ? "Enviando…" : "Ver mi plan de acción"}</button>
    </form>
  );
}

function Plan({ actions, config }) {
  const wa = config.whatsapp && `https://wa.me/${config.whatsapp}?text=${encodeURIComponent("Hola, completé el diagnóstico SCR y quiero avanzar con el plan de acción.")}`;
  return (
    <section>
      <h2>Tu plan de acción</h2>
      <p className="muted">Ordenado por prioridad. Son recomendaciones iniciales que conviene ajustar según la situación de tu empresa.</p>
      <ol className="plan">
        {actions.map(({ question: q, level, plan, priority }) => (
          <li className="card" key={q.id}>
            <div className="plan-head">
              <span className={`pill ${priority === "Alta" ? "bad" : priority === "Media" ? "warn" : "ok"}`}>Prioridad {priority}</span>
              <small className="muted">{q.dimension} · {LEVELS[level]}</small>
            </div>
            <h3>{q.topic}</h3>
            <p>{plan}</p>
          </li>
        ))}
      </ol>
      <div className="card contact">
        <h3>¿Querés que te ayudemos a llevarlo adelante?</h3>
        <p className="muted">Ya tenemos tus datos y te vamos a contactar. Si preferís, escribinos o agendá una reunión ahora.</p>
        <div className="cta-row">
          {wa && <a className="btn primary" href={wa} target="_blank" rel="noopener noreferrer">Escribir por WhatsApp</a>}
          {config.calendarUrl && <a className="btn ghost" href={config.calendarUrl} target="_blank" rel="noopener noreferrer">Agendar reunión</a>}
        </div>
      </div>
    </section>
  );
}
