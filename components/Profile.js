"use client";
import Logo from "./Logo";
import { SECTORS, SIZES, URGENCIES, profileComplete } from "../lib/funnel";
import { PHOTOS } from "../lib/photos";

function Group({ legend, name, options, value, onChange }) {
  return (
    <fieldset className="pgroup">
      <legend>{legend}</legend>
      <div className="pchips">
        {options.map((o) => (
          <label key={o} className={`pchip ${value === o ? "sel" : ""}`}>
            <input type="radio" name={name} checked={value === o} onChange={() => onChange(o)} />
            <span>{o}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export default function Profile({ profile, setProfile, onContinue, onExit }) {
  const set = (k) => (v) => setProfile({ ...profile, [k]: v });
  return (
    <div className="quiz">
      <header className="quiz-bar"><div className="quiz-bar-in"><Logo /><button className="link-arrow" onClick={onExit}>Salir</button></div></header>
      <div className="quiz-body profile">
        <img className="cp-photo" src={PHOTOS.person.src} alt={PHOTOS.person.alt} />
        <p className="eyebrow">Antes de empezar · 1 minuto</p>
        <h2 className="qtext">Contanos un poco sobre tu empresa.</h2>
        <p className="muted pmuted">Así adaptamos las recomendaciones a tu situación.</p>
        <Group legend="¿A qué rubro pertenece?" name="sector" options={SECTORS} value={profile.sector} onChange={set("sector")} />
        <Group legend="¿Cuántas personas trabajan en la empresa?" name="size" options={SIZES} value={profile.size} onChange={set("size")} />
        <Group legend="¿Qué tan urgente es calificar como proveedor?" name="urgency" options={URGENCIES} value={profile.urgency} onChange={set("urgency")} />
        <label className="ptext">¿A qué minera o proyecto querés venderle? <small>(opcional)</small>
          <input value={profile.target ?? ""} maxLength={120} onChange={(e) => set("target")(e.target.value)} />
        </label>
        <div className="quiz-nav">
          <span />
          <button className="pill-btn dark big" disabled={!profileComplete(profile)} onClick={onContinue}>Comenzar las preguntas</button>
        </div>
      </div>
    </div>
  );
}
