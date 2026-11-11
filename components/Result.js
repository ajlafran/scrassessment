"use client";
import { useState } from "react";
import Logo from "./Logo";
import { BANDS, LEVELS } from "../lib/scoring";
import { gapTo, serviceTier, temperature } from "../lib/funnel";
import ReportBody from "./ReportBody";

const AREA_COLOR = { Sustentabilidad: "leaf", Compliance: "peach", "Gestión de riesgos": "lilac" };

export function Gauge({ score }) {
  const r = 92, c = 2 * Math.PI * r;
  return (
    <svg className="gauge" viewBox="0 0 220 220" role="img" aria-label={`Puntaje ${Math.round(score)} de 100`}>
      <circle cx="110" cy="110" r={r} className="g-bg" />
      <circle cx="110" cy="110" r={r} className="g-fg" strokeDasharray={c} strokeDashoffset={c * (1 - score / 100)} transform="rotate(-90 110 110)" />
      <text x="110" y="124" textAnchor="middle" className="g-num">{Math.round(score)}</text>
      <text x="110" y="152" textAnchor="middle" className="g-sub">de 100</text>
    </svg>
  );
}

export default function Result({ result, answers, profile, company, questions, unlocked, onUnlock, config, onBack, onRestart }) {
  const { score, band, dimensions, alerts, actions } = result;
  const tier = serviceTier(score);
  const temp = temperature(profile, result);
  return (
    <>
      <header className="quiz-bar dark">
        <div className="quiz-bar-in"><Logo light /><button className="link-arrow light" onClick={onRestart}>Empezar de nuevo</button></div>
      </header>

      <section className="res-hero">
        <div className="res-in">
          <div>
            <p className="eyebrow leaf">Tu diagnóstico SCR</p>
            <h1>Tu nivel de cumplimiento es <em>{band.label.toLowerCase()}</em>.</h1>
            <p className="res-sub">{band.text}</p>
            <button className="link-arrow light" onClick={onBack}>← Revisar mis respuestas</button>
          </div>
          <Gauge score={score} />
        </div>
        <div className="dim-cards">
          {dimensions.map((d) => (
            <article className={`dim-card ${AREA_COLOR[d.name]}`} key={d.name}>
              <span>{d.name}</span>
              <b>{Math.round(d.score)}<small>/100</small></b>
              <i><u style={{ width: `${d.score}%` }} /></i>
              <em>{d.band.label}</em>
            </article>
          ))}
        </div>
      </section>

      <div className="res-body">
        <ScaleBar score={score} />
        {alerts.length > 0 && (
          <div className="alert" role="alert">
            <strong>Alertas críticas</strong>
            <p>Estos puntos suelen ser excluyentes al evaluar proveedores mineros. Figuran sin ningún nivel de cumplimiento:</p>
            <ul>{alerts.map((q) => <li key={q.id}>{q.topic}</li>)}</ul>
          </div>
        )}

        {actions.length === 0 && (
          <div className="done-card"><h2>¡Excelente!</h2><p>Declaraste cumplimiento total en todas las áreas. Mantener las revisiones periódicas es la clave.</p></div>
        )}
        {unlocked || actions.length === 0 ? (
          <>
            <ReportBody questions={questions} answers={answers} company={company} dateLabel={new Date().toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" })} showScore={false} />
            <Contact config={config} tier={tier} />
          </>
        ) : (
          <>
            <div className="plan-title">
              <div>
                <p className="eyebrow">Informe ejecutivo</p>
                <h2>{actions.length} {actions.length === 1 ? "punto" : "puntos"} para mejorar, por criticidad.</h2>
              </div>
            </div>
            <div className="plan-wrap locked">
              <ol className="plan">
                {actions.map(({ question: q, level, priority }, i) => (
                  <li className="plan-item" key={q.id}>
                    <span className="plan-n">{String(i + 1).padStart(2, "0")}</span>
                    <div>
                      <div className="plan-head">
                        <span className={`prio ${priority}`}>Prioridad {priority}</span>
                        <small>{q.dimension} · {LEVELS[level]}</small>
                      </div>
                      <h3>{q.topic}</h3>
                      <p className="skel"><i /><i /><i /></p>
                    </div>
                  </li>
                ))}
              </ol>
              <LeadForm count={actions.length} score={score} band={band} dimensions={dimensions} alerts={alerts}
                answers={answers} profile={profile} tier={tier} temp={temp} onUnlock={onUnlock} />
            </div>
          </>
        )}
      </div>
    </>
  );
}

function LeadForm({ count, score, band, dimensions, alerts, answers, profile, tier, temp, onUnlock }) {
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
          alerts: alerts.map((q) => q.topic), answers, profile, tier: tier.title, temperature: temp }),
      });
      const out = await res.json().catch(() => ({}));
      if (!res.ok || !out.ok) throw new Error(out.error || "No pudimos enviar tus datos.");
      onUnlock(f.company);
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  }

  return (
    <form className="lead-form" onSubmit={submit}>
      <h3>Desbloqueá tu plan de acción</h3>
      <p>Dejanos tus datos y te mostramos qué hacer en cada uno de los {count} puntos.</p>
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
      <button className="pill-btn dark big" disabled={busy}>{busy ? "Enviando…" : "Ver mi plan de acción"}</button>
    </form>
  );
}

function Contact({ config, tier }) {
  const wa = config.whatsapp && `https://wa.me/${config.whatsapp}?text=${encodeURIComponent("Hola, completé el diagnóstico SCR y quiero avanzar con el plan de acción.")}`;
  return (
    <div className="contact">
      <p className="eyebrow leaf">Próximo paso recomendado</p>
      <h2>{tier.title}</h2>
      <p>{tier.text} Ya tenemos tus datos y te vamos a contactar. Si preferís, escribinos o agendá una reunión ahora.</p>
      <div className="hero-cta">
        {wa && <a className="pill-btn white big" href={wa} target="_blank" rel="noopener noreferrer">Escribir por WhatsApp</a>}
        <button className="link-arrow light pdf-btn" onClick={() => window.print()}>Descargar informe (PDF)</button>
        {config.calendarUrl && <a className="link-arrow light" href={config.calendarUrl} target="_blank" rel="noopener noreferrer">Agendar reunión <span aria-hidden="true">→</span></a>}
      </div>
    </div>
  );
}

function ScaleBar({ score }) {
  const gap = gapTo(score);
  return (
    <div className="scale">
      <div className="scale-head">
        <h2>{gap > 0 ? `Te faltan ${String(gap).replace(".", ",")} puntos para el nivel Satisfactorio.` : "Alcanzaste el nivel Satisfactorio."}</h2>
        <p className="muted">Las mineras suelen exigir prácticas consolidadas: el objetivo de referencia es 80 o más.</p>
      </div>
      <div className="scale-track" role="img" aria-label={`Tu puntaje es ${Math.round(score)}. Referencia: 80`}>
        {[...BANDS].reverse().map((b, i, arr) => {
          const next = arr[i + 1]?.min ?? 100;
          return <span key={b.label} className={`seg-band ${b.tone}`} style={{ width: `${next - b.min}%` }}><em>{b.label}</em></span>;
        })}
        <i className="you" style={{ left: `${Math.min(score, 99.5)}%` }}><b>Vos · {Math.round(score)}</b></i>
        <i className="target" style={{ left: "80%" }}><b>Meta · 80</b></i>
      </div>
    </div>
  );
}
