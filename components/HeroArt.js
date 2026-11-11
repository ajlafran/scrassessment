"use client";
import { useEffect, useRef, useState } from "react";
import { PHOTOS } from "../lib/photos";

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
    <div className="art" ref={ref}>
      <div className="px photo-wrap" style={{ "--d": 8 }}>
        <div className="photo-frame"><img className="hero-photo" src={PHOTOS.hero.src} alt={PHOTOS.hero.alt} fetchPriority="high" /></div>
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
