"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Landing from "./Landing";
import Quiz from "./Quiz";
import Result from "./Result";
import Profile from "./Profile";
import Checkpoint from "./Checkpoint";
import { computeResult } from "../lib/scoring";
import { profileComplete } from "../lib/funnel";

const KEY = "scr-assessment-v3";
function save(s) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {} }
function load() { try { return JSON.parse(localStorage.getItem(KEY)); } catch { return null; } }

export default function Assessment({ questions, config }) {
  const [stage, setStage] = useState("intro"); // intro | profile | quiz | checkpoint | result
  const [profile, setProfile] = useState({});
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [unlocked, setUnlocked] = useState(false);
  const [ready, setReady] = useState(false);
  const first = useRef(true);

  useEffect(() => {
    const s = load();
    if (s && typeof s.answers === "object") {
      setStage(s.stage ?? "intro"); setIdx(Math.min(s.idx ?? 0, questions.length - 1));
      setAnswers(s.answers ?? {}); setUnlocked(!!s.unlocked); setProfile(s.profile ?? {});
    }
    setReady(true);
  }, [questions.length]);
  useEffect(() => { if (ready) save({ stage, idx, answers, unlocked, profile }); }, [ready, stage, idx, answers, unlocked, profile]);
  useEffect(() => {
    if (!ready) return;
    if (first.current) { first.current = false; return; }
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [stage, ready]);

  const answered = Object.keys(answers).length;
  const result = useMemo(() => (stage === "result" || stage === "checkpoint" ? computeResult(questions, answers) : null), [stage, questions, answers]);

  const start = () => {
    if (answered === questions.length) return setStage("result");
    if (answered === 0 && !profileComplete(profile)) return setStage("profile");
    const firstOpen = questions.findIndex((q) => answers[q.id] === undefined);
    setIdx(firstOpen === -1 ? 0 : firstOpen); setStage("quiz");
  };
  const restart = () => { setAnswers({}); setIdx(0); setUnlocked(false); setProfile({}); setStage("intro"); };

  if (stage === "profile")
    return <Profile profile={profile} setProfile={setProfile} onExit={() => setStage("intro")}
      onContinue={() => { setIdx(0); setStage("quiz"); }} />;
  if (stage === "quiz")
    return <Quiz questions={questions} idx={idx} setIdx={setIdx} answers={answers} setAnswers={setAnswers}
      onFinish={() => setStage("result")} onCheckpoint={() => setStage("checkpoint")} onExit={() => setStage("intro")} />;
  if (stage === "checkpoint" && result)
    return <Checkpoint dimension={questions[idx].dimension} questions={questions} result={result}
      onReview={() => setStage("quiz")} onContinue={() => { setIdx(idx + 1); setStage("quiz"); }} />;
  if (stage === "result" && result)
    return <Result result={result} answers={answers} profile={profile} unlocked={unlocked} onUnlock={() => setUnlocked(true)} config={config}
      onBack={() => { setIdx(questions.length - 1); setStage("quiz"); }} onRestart={restart} />;
  return (
    <>
      <Landing onStart={start} resume={answered > 0} onRestart={restart} />
      <footer className="footer">© 2026 SCR · Autoevaluación orientativa basada en respuestas declaradas; no constituye una certificación. Fotografías: Pexels.</footer>
    </>
  );
}
