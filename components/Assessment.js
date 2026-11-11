"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Landing from "./Landing";
import Quiz from "./Quiz";
import Result from "./Result";
import { computeResult } from "../lib/scoring";

const KEY = "scr-assessment-v2";
function save(s) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {} }
function load() { try { return JSON.parse(localStorage.getItem(KEY)); } catch { return null; } }

export default function Assessment({ questions, config }) {
  const [stage, setStage] = useState("intro"); // intro | quiz | result
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [unlocked, setUnlocked] = useState(false);
  const [ready, setReady] = useState(false);
  const first = useRef(true);

  useEffect(() => {
    const s = load();
    if (s && typeof s.answers === "object") {
      setStage(s.stage ?? "intro"); setIdx(Math.min(s.idx ?? 0, questions.length - 1));
      setAnswers(s.answers ?? {}); setUnlocked(!!s.unlocked);
    }
    setReady(true);
  }, [questions.length]);
  useEffect(() => { if (ready) save({ stage, idx, answers, unlocked }); }, [ready, stage, idx, answers, unlocked]);
  useEffect(() => {
    if (!ready) return;
    if (first.current) { first.current = false; return; }
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [stage, ready]);

  const answered = Object.keys(answers).length;
  const result = useMemo(() => (stage === "result" ? computeResult(questions, answers) : null), [stage, questions, answers]);

  const start = () => {
    if (answered === questions.length) return setStage("result");
    const firstOpen = questions.findIndex((q) => answers[q.id] === undefined);
    setIdx(firstOpen === -1 ? 0 : firstOpen); setStage("quiz");
  };
  const restart = () => { setAnswers({}); setIdx(0); setUnlocked(false); setStage("intro"); };

  if (stage === "quiz")
    return <Quiz questions={questions} idx={idx} setIdx={setIdx} answers={answers} setAnswers={setAnswers}
      onFinish={() => setStage("result")} onExit={() => setStage("intro")} />;
  if (stage === "result" && result)
    return <Result result={result} answers={answers} unlocked={unlocked} onUnlock={() => setUnlocked(true)} config={config}
      onBack={() => { setIdx(questions.length - 1); setStage("quiz"); }} onRestart={restart} />;
  return (
    <>
      <Landing onStart={start} resume={answered > 0} onRestart={restart} />
      <footer className="footer">© 2026 SCR · Autoevaluación orientativa basada en respuestas declaradas; no constituye una certificación.</footer>
    </>
  );
}
