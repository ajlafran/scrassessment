"use client";
import Logo from "./Logo";
import { useState } from "react";
import { HeroArt, MockCard } from "./HeroArt";
import data from "../data/assessment.json";
import { PHOTOS } from "../lib/photos";

const AREAS = [
  { name: "Sustentabilidad", color: "leaf", text: "Impacto ambiental y social, seguridad de las personas, derechos humanos y objetivos medibles." },
  { name: "Compliance", color: "peach", text: "Ética, anticorrupción, canal de denuncias, debida diligencia y obligaciones legales y contractuales." },
  { name: "Gestión de riesgos", color: "lilac", text: "Matriz de riesgos, controles, indicadores, continuidad del negocio y ciberseguridad." },
].map((a) => ({ ...a, topics: data.questions.filter((q) => q.dimension === a.name).map((q) => q.topic) }));
const COMPARE = [
  ["Para saber dónde estás", "Revisar documentos a ciegas", "Un relevamiento que lleva tiempo", "Un diagnóstico guiado en minutos"],
  ["Criterio de evaluación", "El que cada uno improvisa", "El de cada consultora", "25 puntos con niveles descriptos"],
  ["Qué recibís", "Una lista de dudas", "Un informe al final del trabajo", "Puntaje, alertas y plan de acción"],
  ["Primer paso", "Buscar por dónde empezar", "Coordinar reuniones", "Empezar hoy, sin costo"],
];
const FAQ = [
  ["¿Cuánto tarda?", "Entre 15 y 20 minutos. Son 25 preguntas y cada una tiene 4 niveles de respuesta con una descripción clara para elegir con criterio."],
  ["¿Qué pasa con mis respuestas?", "Se guardan solo en tu navegador mientras completás el diagnóstico. Si pedís tu plan de acción, nos llegan junto con tus datos de contacto."],
  ["¿Es una certificación?", "No. Es una autoevaluación basada en lo que declarás, pensada para detectar brechas antes de que las detecte un cliente minero."],
  ["¿Qué recibo al final?", "Un puntaje de 0 a 100, tu nivel en cada área, las alertas críticas y un plan de acción priorizado para cada punto a mejorar."],
];

function AreasPanel() {
  const [open, setOpen] = useState(-1);
  return (
    <section className="areas3" id="areas">
      <div className="areas3-head">
        <p className="eyebrow">Qué evaluamos</p>
        <h2>Tres áreas. <span className="hl">Un solo puntaje.</span></h2>
      </div>
      <div className="photo-row">
        {AREAS.map((a, i) => (
          <article className="pcard" key={a.name}>
            <button className={`pimg ${open === i ? "open" : ""}`} aria-expanded={open === i}
              aria-label={`Ver los ${a.topics.length} puntos de ${a.name}`} onClick={() => setOpen(open === i ? -1 : i)}>
              <img src={PHOTOS.areas[a.name].src} alt={PHOTOS.areas[a.name].alt} loading="lazy" />
              <span className="ptag">{String(i + 1).padStart(2, "0")} · {a.topics.length} puntos</span>
              <span className="pover"><ul>{a.topics.map((t) => <li key={t}>{t}</li>)}</ul></span>
            </button>
            <h3>{a.name}</h3>
            <p>{a.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default function Landing({ onStart, resume, onRestart }) {
  return (
    <>
      <header className="nav">
        <div className="nav-in">
          <Logo />
          <nav aria-label="Principal">
            <a href="#como">Cómo funciona</a>
            <a href="#areas">Áreas</a>
            <a href="#faq">Preguntas</a>
          </nav>
          <button className="pill-btn dark" onClick={onStart}>{resume ? "Continuar" : "Comenzar"}</button>
        </div>
      </header>

      <section className="hero">
        <HeroArt />
        <div className="hero-in">
          <p className="eyebrow light">Diagnóstico para proveedores mineros</p>
          <h1 aria-label="¿Está tu empresa lista para ser proveedor de la minería?">{"¿Está tu empresa lista para ser proveedor de la minería?".split(" ").map((w, i) => <span className="w" aria-hidden="true" key={i} style={{ animationDelay: `${0.15 + i * 0.07}s` }}>{w}</span>)}</h1>
          <p className="hero-sub">Respondé 25 preguntas y conocé tu nivel de cumplimiento en Sustentabilidad, Compliance y Riesgos.</p>
          <div className="hero-cta">
            <button className="pill-btn white big" onClick={onStart}>{resume ? "Continuar diagnóstico" : "Comenzar diagnóstico"}</button>
            {resume && <button className="link-arrow light" onClick={onRestart}>Empezar de nuevo</button>}
            {!resume && <a className="link-arrow light" href="#como">Ver cómo funciona <span aria-hidden="true">→</span></a>}
          </div>
        </div>
        <MockCard />
        <div className="wordmark" aria-hidden="true">SCR<sup>®</sup></div>
      </section>

      <section className="editorial">
        <p className="small-copy">Un diagnóstico pensado para la cadena de valor minera.</p>
        <h2>Las grandes mineras exigen más que buen precio. Medí tu nivel antes de que lo midan ellas.</h2>
      </section>

      <section className="steps" id="como">
        {[["01", "Respondés", "25 preguntas en 3 áreas, con niveles de respuesta descriptos para no dudar."],
          ["02", "Medimos", "Un puntaje de 0 a 100, tu nivel en cada área y las alertas críticas que suelen ser excluyentes."],
          ["03", "Actuás", "Un plan de acción priorizado, punto por punto, para cerrar las brechas y calificar como proveedor."]].map(([n, t, d]) => (
          <article key={n}><div className="rule" /><span className="step-n">{n}</span><h3>{t}</h3><p>{d}</p></article>
        ))}
      </section>

      <AreasPanel />

      <section className="showcase">
        <h2>Un informe que se entiende <span className="hl">de un vistazo</span>.</h2>
        <p className="showcase-sub">Sin planillas ni jerga: tu nivel, lo que te puede dejar afuera y qué hacer primero.</p>
        <div className="panel panel-photo" style={{ backgroundImage: `url(${PHOTOS.team.src})` }}>
          <div className="fc fc-score"><span>Puntaje global</span><b>72<small>/100</small></b><i><u style={{ width: "72%" }} /></i><em>Nivel Bueno · meta 80</em></div>
          <div className="fc fc-alert"><strong>⚠ Alerta crítica</strong><span>Canal de denuncias sin ningún nivel de cumplimiento</span></div>
          <div className="fc fc-plan"><span className="prio Alta">Prioridad Alta</span><strong>Canal de denuncias</strong><span>Implementar un canal confidencial y accesible, con protocolo de gestión y plazos.</span></div>
          <div className="fc fc-next"><span>Próximo paso</span><strong>Acompañamiento para cerrar brechas</strong></div>
        </div>
      </section>

      <section className="compare">
        <h2>Tres formas de llegar a saber qué te falta. <span className="hl">Una es la rápida.</span></h2>
        <div className="table" role="table" aria-label="Comparación">
          <div className="tr th" role="row"><span /><span>Sin guía</span><span>Consultora tradicional</span><span className="us">SCR</span></div>
          {COMPARE.map(([k, a, b, c]) => (
            <div className="tr" role="row" key={k}><span className="tk">{k}</span><span>{a}</span><span>{b}</span><span className="us">{c}</span></div>
          ))}
        </div>
      </section>

      <section className="faq" id="faq">
        <h2>Preguntas frecuentes</h2>
        <div>
          {FAQ.map(([q, a]) => (
            <details key={q}><summary>{q}</summary><p>{a}</p></details>
          ))}
        </div>
      </section>

      <section className="final">
        <h2>Empezá hoy. Son entre 15 y 20 minutos.</h2>
        <button className="pill-btn dark big" onClick={onStart}>{resume ? "Continuar diagnóstico" : "Comenzar diagnóstico"}</button>
      </section>
    </>
  );
}
