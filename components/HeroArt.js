"use client";
import { useEffect, useRef, useState } from "react";

const CX = 330, CY = 250;
// Camino de acarreo: espiral descendente desde el borde de la mina hasta el fondo
function spiralPath() {
  const pts = [];
  const turns = 3.2, steps = 220;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps, a = -Math.PI / 2 + t * turns * 2 * Math.PI;
    const k = 1 - t * 0.9;
    pts.push([CX + 270 * k * Math.cos(a) + t * 6, CY + 150 * k * Math.sin(a) + t * 34]);
  }
  return "M" + pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(" L");
}
const SPIRAL = spiralPath();

export function HeroArt() {
  const ref = useRef(null);
  useEffect(() => {
    const hero = ref.current?.closest(".hero");
    if (!hero || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const move = (e) => {
      const r = hero.getBoundingClientRect();
      hero.style.setProperty("--mx", ((e.clientX - r.left) / r.width - 0.5) * 2);
      hero.style.setProperty("--my", ((e.clientY - r.top) / r.height - 0.5) * 2);
    };
    hero.addEventListener("pointermove", move);
    return () => hero.removeEventListener("pointermove", move);
  }, []);

  return (
    <div className="art" ref={ref} aria-hidden="true">
      <div className="px" style={{ "--d": 10 }}>
        <svg className="pit" viewBox="0 0 700 520">
          {Array.from({ length: 9 }, (_, i) => (
            <ellipse key={i} className="ring" style={{ animationDelay: `${i * 0.28}s` }}
              cx={CX + i * 4} cy={CY + i * 9} rx={285 - i * 29} ry={178 - i * 17}
              fill={i % 2 ? "#3a3f3d" : "#2b2f2d"} stroke="#555c58" strokeWidth="1.4" />
          ))}
          <path d={SPIRAL} className="haul" fill="none" />
          <circle r="5.5" fill="#feba88">
            <animateMotion dur="14s" repeatCount="indefinite" path={SPIRAL} />
          </circle>
          <circle className="target-halo" cx={CX + 34} cy={CY + 82} r="20" fill="#97c680" />
          <ellipse cx={CX + 34} cy={CY + 82} rx="20" ry="9" fill="#97c680" />
        </svg>
      </div>

      <div className="px s1" style={{ "--d": 26 }}><div className="shape leaf"><span>Sustentabilidad</span></div></div>
      <div className="px s2" style={{ "--d": 18 }}><div className="shape peach"><span>Compliance</span></div></div>
      <div className="px s3" style={{ "--d": 34 }}><div className="shape lilac"><span>Riesgos</span></div></div>
      <div className="px s4" style={{ "--d": 14 }}><div className="shape ring-s" /></div>
      <div className="px s5" style={{ "--d": 22 }}><div className="shape plus">+</div></div>
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
      <div className="px" style={{ "--d": 8 }}>
        <div className="mock">
          <div className="mock-top"><span>Tu diagnóstico</span><b>Bueno</b></div>
          <div className="mock-score">{n}<small>/100</small></div>
          {[["Sustentabilidad", 78, "leaf"], ["Compliance", 66, "peach"], ["Gestión de riesgos", 72, "lilac"]].map(([name, v, c], i) => (
            <div className="mock-row" key={name}><span>{name}</span>
              <i><u className={c} style={{ width: go ? `${v}%` : "0%", transitionDelay: `${i * 0.15}s` }} /></i></div>
          ))}
        </div>
      </div>
      <div className="px chipA" style={{ "--d": 20 }}><div className="float-chip warn">⚠ Alerta crítica</div></div>
      <div className="px chipB" style={{ "--d": 28 }}><div className="float-chip ok">✓ Plan de acción</div></div>
    </div>
  );
}
