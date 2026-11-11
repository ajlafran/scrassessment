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
// Tres nodos (uno por área) sobre el borde de anillos de la mina
const NODES = [["01", "SUSTENTABILIDAD", 0, -235], ["02", "COMPLIANCE", 2, -35], ["03", "RIESGOS", 1, 135]].map(([num, label, i, dx]) => {
  const rx = 285 - i * 29, ry = 178 - i * 17, cy = CY + i * 9, cx = CX + i * 4;
  return { num, label, x: cx + dx, y: cy - ry * Math.sqrt(1 - (dx / rx) ** 2) };
});

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
      <div className="px" style={{ "--d": 6 }}>
        <svg className="pit" viewBox="0 0 700 520">
          {Array.from({ length: 9 }, (_, i) => (
            <ellipse key={i} className="ring" style={{ animationDelay: `${i * 0.28}s` }}
              cx={CX + i * 4} cy={CY + i * 9} rx={285 - i * 29} ry={178 - i * 17}
              fill={i % 2 ? "#3a3f3d" : "#2b2f2d"} stroke="#555c58" strokeWidth="1.4" />
          ))}
          <path d={SPIRAL} className="haul" fill="none" />
          <circle r="4" fill="#fff">
            <animateMotion dur="14s" repeatCount="indefinite" path={SPIRAL} />
          </circle>
          {NODES.map((n) => (
            <g key={n.label} className="node">
              <line x1={n.x} y1={n.y} x2={n.x} y2="52" className="lead" />
              <circle cx={n.x} cy={n.y} r="4.5" fill="#fff" />
              <circle cx={n.x} cy={n.y} r="4.5" className="node-halo" />
              <text x={n.x + 10} y="44" className="node-t"><tspan className="node-n">{n.num}</tspan>  {n.label}</text>
            </g>
          ))}
          <circle className="target-halo" cx={CX + 34} cy={CY + 82} r="20" fill="#3a9d86" />
          <ellipse cx={CX + 34} cy={CY + 82} rx="20" ry="9" fill="#3a9d86" />
        </svg>
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
