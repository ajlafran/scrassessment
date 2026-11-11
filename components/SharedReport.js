"use client";
import { useEffect, useState } from "react";
import Logo from "./Logo";
import ReportBody from "./ReportBody";
import data from "../data/assessment.json";
import { decodeAnswers, parseShareDate } from "../lib/report";
import { computeResult } from "../lib/scoring";
import { Gauge } from "./Result";

export default function SharedReport() {
  const [state, setState] = useState({ status: "loading" });
  useEffect(() => {
    const p = new URLSearchParams(location.search);
    const answers = decodeAnswers(data.questions, p.get("r"));
    if (!answers) return setState({ status: "invalid" });
    setState({ status: "ok", answers, company: (p.get("e") ?? "").slice(0, 80), date: parseShareDate(p.get("f")) });
  }, []);

  if (state.status === "loading") return null;
  const bar = (
    <header className="quiz-bar dark"><div className="quiz-bar-in"><Logo light /><a className="link-arrow light" href="/">Hacer mi diagnóstico</a></div></header>
  );
  if (state.status === "invalid")
    return (<>{bar}<main className="res-body"><h2>No pudimos abrir este informe</h2><p className="muted">El enlace está incompleto o fue modificado. Pedile a quien te lo compartió que lo envíe de nuevo.</p><p style={{ marginTop: 24 }}><a className="pill-btn dark" href="/">Hacer mi propio diagnóstico</a></p></main></>);

  const result = computeResult(data.questions, state.answers);
  return (
    <>
      {bar}
      <section className="res-hero">
        <div className="res-in">
          <div>
            <p className="eyebrow leaf">Informe de diagnóstico SCR</p>
            <h1>{state.company ? state.company : "Nivel de cumplimiento"}: <em>{result.band.label.toLowerCase()}</em>.</h1>
            <p className="res-sub">{result.band.text}</p>
          </div>
          <Gauge score={result.score} />
        </div>
      </section>
      <div className="res-body">
        <ReportBody questions={data.questions} answers={state.answers} company={state.company} dateLabel={state.date} />
        <div className="contact">
          <p className="eyebrow leaf">SCR · Sustainability, Compliance &amp; Risk</p>
          <h2>¿Qué nivel tiene tu empresa?</h2>
          <p>Respondé el diagnóstico y recibí tu propio informe con fortalezas, mejoras por criticidad y un plan de acción.</p>
          <div className="hero-cta"><a className="pill-btn white big" href="/">Hacer el diagnóstico</a></div>
        </div>
      </div>
    </>
  );
}
