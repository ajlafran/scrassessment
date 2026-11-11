"use client";
import { useEffect, useRef, useState } from "react";
import { PHOTOS } from "../lib/photos";

// Los tres valores sobre la foto (posición en % del marco)
const NODES = [
  { n: "01", label: "SUSTENTABILIDAD", x: 56, y: 53 },
  { n: "02", label: "COMPLIANCE", x: 82, y: 61 },
  { n: "03", label: "RIESGOS", x: 68, y: 74 },
];
// Datos del informe distribuidos arriba, como puntos
const METRICS = [
  { to: 72, suffix: " / 100", label: "Puntaje global", x: 62, y: 13 },
  { to: 2, suffix: "", label: "alertas críticas", x: 78, y: 26 },
  { to: 19, suffix: "", label: "acciones sugeridas", x: 62, y: 38 },
];

function CountUp({ to, delay = 900 }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) { setN(to); return; }
    let raf, t0;
    const t = setTimeout(() => {
      const tick = (ts) => { t0 ??= ts; const p = Math.min((ts - t0) / 1500, 1); setN(Math.round(to * (1 - Math.pow(1 - p, 3)))); if (p < 1) raf = requestAnimationFrame(tick); };
      raf = requestAnimationFrame(tick);
    }, delay);
    return () => { clearTimeout(t); cancelAnimationFrame(raf); };
  }, [to, delay]);
  return <>{n}</>;
}

export function HeroArt() {
  const ref = useRef(null);
  const dot = useRef(null);
  useEffect(() => {
    const hero = ref.current?.closest(".hero");
    if (!hero || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const move = (e) => {
      const r = hero.getBoundingClientRect();
      hero.style.setProperty("--mx", ((e.clientX - r.left) / r.width - 0.5) * 2);
      hero.style.setProperty("--my", ((e.clientY - r.top) / r.height - 0.5) * 2);
    };
    hero.addEventListener("pointermove", move);
    // punto que recorre los tres valores, como el camino de acarreo
    let raf, t0;
    const pts = NODES.map((n) => [n.x, n.y]);
    const tick = (ts) => {
      t0 ??= ts;
      const total = pts.length - 1, p = (((ts - t0) / 9000) % 1) * 2;
      const q = p <= 1 ? p : 2 - p;
      const f = q * total, i = Math.min(Math.floor(f), total - 1), k = f - i;
      const ease = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      const x = pts[i][0] + (pts[i + 1][0] - pts[i][0]) * ease;
      const y = pts[i][1] + (pts[i + 1][1] - pts[i][1]) * ease;
      if (dot.current) { dot.current.style.left = `${x}%`; dot.current.style.top = `${y}%`; }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { hero.removeEventListener("pointermove", move); cancelAnimationFrame(raf); };
  }, []);
  return (
    <div className="pano" ref={ref}>
      <img className="pano-img" src={PHOTOS.hero.src} alt={PHOTOS.hero.alt} fetchPriority="high" />
      <div className="photo-shade" />
      <svg className="route" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <polyline points={NODES.map((n) => `${n.x},${n.y}`).join(" ")} />
      </svg>
      <span className="route-dot" ref={dot} aria-hidden="true" />
      {NODES.map((n, i) => (
        <div className={`vnode v${i}`} key={n.n} style={{ left: `${n.x}%`, top: `${n.y}%`, "--i": i }}>
          <span className="vdot" /><span className="vhalo" />
          <span className="vlabel"><b>{n.n}</b> {n.label}</span>
        </div>
      ))}
      <aside className="hdata" aria-label="Qué entrega el diagnóstico">
        {METRICS.map((m, i) => (
          <div className="hrow" key={m.label} style={{ "--i": i }}>
            <span className="vdot sm live" /><span className="hnum"><CountUp to={m.to} delay={900 + i * 250} />{m.suffix && <small>{m.suffix}</small>}</span><span className="hlab">{m.label}</span>
          </div>
        ))}
      </aside>
    </div>
  );
}
