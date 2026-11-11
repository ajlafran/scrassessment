"use client";
import { useEffect, useRef, useState } from "react";
import { PHOTOS } from "../lib/photos";

// Los tres valores sobre la foto: posición (% del marco), etiqueta y color
const NODES = [
  { n: "01", label: "SUSTENTABILIDAD", x: 62, y: 30, side: "left" },
  { n: "02", label: "COMPLIANCE", x: 70, y: 49, side: "left" },
  { n: "03", label: "RIESGOS", x: 58, y: 68, side: "left" },
];

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
      const q = p <= 1 ? p : 2 - p; // ida y vuelta
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
    <div className="art" ref={ref}>
      <div className="px photo-wrap" style={{ "--d": 6 }}>
        <div className="photo-frame">
          <img className="hero-photo" src={PHOTOS.hero.src} alt={PHOTOS.hero.alt} fetchPriority="high" />
          <div className="photo-shade" />
          <svg className="route" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <polyline points={NODES.map((n) => `${n.x},${n.y}`).join(" ")} />
          </svg>
          <span className="route-dot" ref={dot} aria-hidden="true" />
          {NODES.map((n, i) => (
            <div className="vnode" key={n.n} style={{ left: `${n.x}%`, top: `${n.y}%`, "--i": i }}>
              <span className="vdot" /><span className="vhalo" />
              <span className="vlabel"><b>{n.n}</b> {n.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function MockCard() {
  const [n, setN] = useState(0);
  const [go, setGo] = useState(false);
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) { setN(72); setGo(true); return; }
    let raf, start;
    const t0 = setTimeout(() => {
      setGo(true);
      const tick = (ts) => {
        start ??= ts;
        const p = Math.min((ts - start) / 1500, 1);
        setN(Math.round(72 * (1 - Math.pow(1 - p, 3))));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }, 900);
    return () => { clearTimeout(t0); cancelAnimationFrame(raf); };
  }, []);
  return (
    <div className="mock-wrap" aria-hidden="true">
      <div className="px" style={{ "--d": 4 }}>
        <div className="mock">
          <div className="mock-top"><span>Tu diagnóstico</span><b>Bueno</b></div>
          <div className="mock-score">{n}<small>/100</small></div>
          {[["Sustentabilidad", 78, "leaf"], ["Compliance", 66, "leaf"], ["Gestión de riesgos", 72, "leaf"]].map(([name, v, c], i) => (
            <div className="mock-row" key={name}><span>{name}</span>
              <i><u className={c} style={{ width: go ? `${v}%` : "0%", transitionDelay: `${i * 0.15}s` }} /></i></div>
          ))}
          <div className="mock-foot"><span>2 alertas críticas</span><span>19 acciones sugeridas</span></div>
        </div>
      </div>
    </div>
  );
}
