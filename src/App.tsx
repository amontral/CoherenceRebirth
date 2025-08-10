import { useEffect, useMemo, useState } from "react";
import {
  avgLastNDays,
  calcStreak,
  loadCheckIns,
  upsertToday,
  mostFrequentMode,
  lastEntry,
  type CheckIn,
} from "./storage";

type Mode = "Focused" | "Scattered" | "On Edge" | "Calm" | "High Energy";

const MODES: { label: Mode; icon: string }[] = [
  { label: "Focused", icon: "🎯" },
  { label: "Scattered", icon: "🌪️" },
  { label: "On Edge", icon: "⚡" },
  { label: "Calm", icon: "🌿" },
  { label: "High Energy", icon: "🔥" },
];

export default function App() {
  const [mode, setMode] = useState<Mode | null>(null);
  const [score, setScore] = useState<number>(70);
  const [submitted, setSubmitted] = useState(false);

  const [history, setHistory] = useState<CheckIn[]>([]);
  const streak = useMemo(() => calcStreak(history), [history]);
  const avg7 = useMemo(() => avgLastNDays(history, 7), [history]);
  const topMode = useMemo(() => mostFrequentMode(history, 14), [history]);
  const latest = useMemo(() => lastEntry(history), [history]);

  const [showSummary, setShowSummary] = useState(false);

  useEffect(() => {
    const h = loadCheckIns();
    setHistory(h);
    if (h.length) setShowSummary(true);
  }, []);

  const reward = useMemo(() => {
    if (!submitted) return "";
    if (score >= 85) return "🔮 Crystal Earned";
    if (score >= 70) return "✨ Spark Earned";
    return "🪙 Coin Earned";
  }, [submitted, score]);

  function handleSubmit() {
    if (!mode) return;
    const next = upsertToday({ mode, score });
    setHistory(next);
    setSubmitted(true);
  }

  return (
    <div className="min-h-full bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-md p-4 space-y-4">
        <header className="pt-2 text-center">
          <h1 className="text-2xl font-bold">Coherence Check-In</h1>
          <p className="text-slate-400 text-sm">60-second daily tap</p>
        </header>

        {/* SUMMARY FIRST VIEW */}
        {showSummary && history.length > 0 && !submitted && (
          <section className="bg-slate-900/60 rounded-2xl p-4 shadow space-y-2">
            <h2 className="font-semibold text-lg">Your Pattern Snapshot</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl bg-slate-900 border border-slate-700 p-3">
                <p className="text-slate-400">Streak</p>
                <p className="text-xl font-bold">{streak} days</p>
              </div>
              <div className="rounded-xl bg-slate-900 border border-slate-700 p-3">
                <p className="text-slate-400">7-day avg</p>
                <p className="text-xl font-bold">{avg7}</p>
              </div>
              <div className="rounded-xl bg-slate-900 border border-slate-700 p-3">
                <p className="text-slate-400">Most frequent mode</p>
                <p className="text-lg font-semibold">{topMode ?? "—"}</p>
              </div>
              <div className="rounded-xl bg-slate-900 border border-slate-700 p-3">
                <p className="text-slate-400">Last check-in</p>
                <p className="text-lg font-semibold">
                  {latest ? `${latest.date} · ${latest.mode} · ${latest.score}` : "—"}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowSummary(false)}
              className="w-full rounded-2xl py-3 mt-1 bg-white text-slate-900 font-semibold hover:opacity-90 transition"
            >
              Start Today’s Check-In
            </button>
          </section>
        )}

        {/* CHECK-IN FLOW */}
        {!showSummary && !submitted && (
          <>
            <section className="bg-slate-900/50 rounded-2xl p-4 space-y-3 shadow">
              <h2 className="font-semibold">1) What mode are you in?</h2>
              <div className="grid grid-cols-2 gap-2">
                {MODES.map((m) => (
                  <button
                    key={m.label}
                    onClick={() => setMode(m.label)}
                    className={[
                      "rounded-xl py-3 px-3 border transition",
                      mode === m.label
                        ? "bg-slate-100 text-slate-900 border-slate-100"
                        : "bg-slate-900 border-slate-700 hover:border-slate-500",
                    ].join(" ")}
                  >
                    <span className="mr-2">{m.icon}</span>
                    {m.label}
                  </button>
                ))}
              </div>
            </section>

            <section className="bg-slate-900/50 rounded-2xl p-4 space-y-3 shadow">
              <h2 className="font-semibold">2) Rate today’s coherence</h2>
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={score}
                onChange={(e) => setScore(parseInt(e.target.value))}
                className="w-full accent-white"
              />
              <p className="text-center text-sm text-slate-300">
                Score: <span className="font-semibold">{score}</span>
              </p>
            </section>

            <button
              onClick={handleSubmit}
              disabled={!mode}
              className={[
                "w-full rounded-2xl py-3 text-center font-semibold transition shadow",
                mode
                  ? "bg-white text-slate-900 hover:opacity-90"
                  : "bg-slate-700 text-slate-300 cursor-not-allowed",
              ].join(" ")}
            >
              Submit Check-In
            </button>
          </>
        )}

        {/* SUBMISSION CONFIRMATION */}
        {submitted && (
          <section className="bg-slate-900/50 rounded-2xl p-6 space-y-3 text-center shadow">
            <p className="text-xl">✅ Check-In Complete</p>
            <p>
              Mode: <span className="font-semibold">{mode}</span>
            </p>
            <p>
              Coherence: <span className="font-semibold">{score}</span>
            </p>
            <p className="text-lg">{reward}</p>
            <div className="flex gap-2 justify-center pt-2">
              <button
                onClick={() => setSubmitted(false)}
                className="rounded-xl py-2 px-4 bg-slate-800 hover:bg-slate-700 border border-slate-600"
              >
                Log another
              </button>
            </div>
          </section>
        )}

        {/* RECENT LIST */}
        {history.length > 0 && (
          <section className="bg-slate-900/40 rounded-2xl p-4 shadow">
            <h3 className="font-semibold mb-2 text-sm">Recent</h3>
            <ul className="space-y-1 text-sm text-slate-300">
              {[...history]
                .sort((a, b) => b.date.localeCompare(a.date))
                .slice(0, 7)
                .map((h) => (
                  <li key={h.date} className="flex justify-between">
                    <span>{h.date}</span>
                    <span>
                      {h.mode} · {h.score}
                    </span>
                  </li>
                ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
