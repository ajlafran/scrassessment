"use client";
import Logo from "./Logo";
import { useEffect, useRef, useState } from "react";
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

function useInView() {
  const ref = useRef(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    if (typeof IntersectionObserver === "undefined" || matchMedia("(prefers-reduced-motion: reduce)").matches) { setSeen(true); return; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect(); } }, { threshold: 0.3 });
    io.observe(el); return () => io.disconnect();
  }, []);
  return [ref, seen];
}

function ReportSection({ onStart, resume }) {
  const [ref, seen] = useInView();
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!seen) return;
    let raf, t0;
    const tick = (ts) => { t0 ??= ts; const p = Math.min((ts - t0) / 1400, 1); setN(Math.round(72 * (1 - Math.pow(1 - p, 3)))); if (p < 1) raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [seen]);
  const bars = [["Sustentabilidad", 78, "leaf"], ["Compliance", 66, "peach"], ["Gestión de riesgos", 72, "lilac"]];
  return (
    <section className="report-wrap" ref={ref}>
      <div className="report" style={{ backgroundImage: `url(/photos/report.jpg)` }}>
        <div className="report-in">
          <div className="report-copy">
            <p className="eyebrow leaf">El informe</p>
            <h2>Un informe que se entiende <span>de un vistazo.</span></h2>
            <p className="report-p">Sin planillas ni jerga: tu nivel, lo que te puede dejar afuera y qué hacer primero.</p>
            <button className="link-arrow light" onClick={onStart}>{resume ? "Continuar diagnóstico" : "Comenzar diagnóstico"} <span aria-hidden="true">→</span></button>
          </div>
          <div className={`glass ${seen ? "in" : ""}`} aria-hidden="true">
            <div className="glass-top"><span>Tu diagnóstico</span><b>Nivel Bueno</b></div>
            <div className="glass-score">{n}<small>/100</small><em>Meta · 80</em></div>
            <div className="glass-bars">
              {bars.map(([name, v, c], i) => (
                <div key={name}><span>{name}</span><i><u className={c} style={{ width: seen ? `${v}%` : "0%", transitionDelay: `${0.2 + i * 0.15}s` }} /></i><b>{v}</b></div>
              ))}
            </div>
            <div className="glass-rows">
              <div><span className="gdot bad" /><p><strong>Alerta crítica</strong>Canal de denuncias sin ningún nivel de cumplimiento</p></div>
              <div><span className="gdot warn" /><p><strong>Prioridad alta · Canal de denuncias</strong>Implementar un canal confidencial con protocolo y plazos</p></div>
              <div><span className="gdot ok" /><p><strong>Próximo paso</strong>Acompañamiento para cerrar brechas</p></div>
            </div>
          </div>
        </div>
      </div>
      <div className="stats">
        {[["25", "preguntas con niveles descriptos"], ["3", "áreas que miran las mineras"], ["1", "plan de acción priorizado"]].map(([k, t]) => (
          <div key={k}><b>{k}</b><span>{t}</span></div>
        ))}
      </div>
    </section>
  );
}

function AreasPanel() {
  const track = useRef(null);
  const drag = useRef({ on: false, x: 0, left: 0, moved: false });
  const [dragging, setDragging] = useState(false);

  const scrollByCard = (dir) => {
    const el = track.current; if (!el) return;
    const card = el.querySelector(".pcard");
    el.scrollBy({ left: dir * (card.offsetWidth + 24), behavior: "smooth" });
  };
  const onDown = (e) => {
    if (e.pointerType !== "mouse") return; // en pantallas táctiles se desliza nativamente
    drag.current = { on: true, x: e.clientX, left: track.current.scrollLeft, moved: false };
    setDragging(true);
  };
  const onMove = (e) => {
    const d = drag.current; if (!d.on) return;
    const dx = e.clientX - d.x;
    if (Math.abs(dx) > 4) d.moved = true;
    track.current.scrollLeft = d.left - dx;
  };
  const onUp = () => { drag.current.on = false; setDragging(false); };

  return (
    <section className="areas3" id="areas">
      <div className="areas3-head">
        <div>
          <p className="eyebrow">Qué evaluamos</p>
          <h2>Tres áreas. <span className="hl">Un solo puntaje.</span></h2>
        </div>
        <div className="arrows">
          <button aria-label="Anterior" onClick={() => scrollByCard(-1)}>←</button>
          <button aria-label="Siguiente" onClick={() => scrollByCard(1)}>→</button>
        </div>
      </div>
      <div className={`carousel ${dragging ? "dragging" : ""}`} ref={track} onPointerDown={onDown} onPointerMove={onMove}
        onPointerUp={onUp} onPointerLeave={onUp} onDragStart={(e) => e.preventDefault()}>
        {AREAS.map((a, i) => (
          <article className="pcard" key={a.name}>
            <div className="pimg">
              <img src={PHOTOS.areas[a.name].src} alt={PHOTOS.areas[a.name].alt} loading="lazy" draggable="false" />
              <span className="ptag">{String(i + 1).padStart(2, "0")} · {a.topics.length} puntos</span>
            </div>
            <h3>{a.name}</h3>
            <p>{a.text}</p>
            <details>
              <summary>Ver los {a.topics.length} puntos</summary>
              <ul>{a.topics.map((t) => <li key={t}>{t}</li>)}</ul>
            </details>
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

      <ReportSection onStart={onStart} resume={resume} />

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
