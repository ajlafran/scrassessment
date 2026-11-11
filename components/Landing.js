import Logo from "./Logo";
import { HeroArt, MockCard } from "./HeroArt";

const AREAS = [
  { name: "Sustentabilidad", n: 8, color: "leaf", text: "Impacto ambiental y social, seguridad de las personas, derechos humanos y objetivos medibles." },
  { name: "Compliance", n: 8, color: "peach", text: "Ética, anticorrupción, canal de denuncias, debida diligencia y obligaciones legales y contractuales." },
  { name: "Gestión de riesgos", n: 9, color: "lilac", text: "Matriz de riesgos, controles, indicadores, continuidad del negocio y ciberseguridad." },
];
const FAQ = [
  ["¿Cuánto tarda?", "Unos 10 minutos. Son 25 preguntas y cada una tiene 4 niveles de respuesta con una descripción clara para elegir con criterio."],
  ["¿Qué pasa con mis respuestas?", "Se guardan solo en tu navegador mientras completás el diagnóstico. Si pedís tu plan de acción, nos llegan junto con tus datos de contacto."],
  ["¿Es una certificación?", "No. Es una autoevaluación basada en lo que declarás, pensada para detectar brechas antes de que las detecte un cliente minero."],
  ["¿Qué recibo al final?", "Un puntaje de 0 a 100, tu nivel en cada área, las alertas críticas y un plan de acción priorizado para cada punto a mejorar."],
];

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

      <section className="areas" id="areas">
        <div className="areas-in">
          <p className="eyebrow leaf">Qué evaluamos</p>
          <h2>Tres áreas, un solo puntaje.</h2>
          <div className="area-grid">
            {AREAS.map((a, i) => (
              <article className={`area ${a.color}`} key={a.name}>
                <span className="area-n">{String(i + 1).padStart(2, "0")}</span>
                <h3>{a.name}</h3>
                <p>{a.text}</p>
                <b>{a.n} preguntas</b>
              </article>
            ))}
          </div>
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
        <h2>Empezá hoy. Son 10 minutos.</h2>
        <button className="pill-btn dark big" onClick={onStart}>{resume ? "Continuar diagnóstico" : "Comenzar diagnóstico"}</button>
      </section>
    </>
  );
}
