import { useEffect, useMemo, useState } from "react";
import {
  avgLastNDays,
  calcStreak,
  loadCheckIns,
  upsertToday,
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

  // history + quick metrics
  const [history, setHistory] = useState<CheckIn[]>([]);
  const streak = useMemo(() => calcStreak(history), [history]);
  const avg7 = useMemo(() => avgLastNDays(history, 7), [history]);

  useEffect(() => {
    setHistory(loadCheckIns());
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
          <p className="text-slate-400 text-xs mt-1">
            Streak: <span className="font-semibold text-slate-200">{streak}</span> •
            7-day avg: <span className="font-semibold text-slate-200">{avg7}</span>
          </p>
        </header>

        {!submitted ? (
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
        ) : (
          <section className="bg-slate-900/50 rounded-2xl p-6 space-y-3 text-center shadow">
            <p className="text-xl">✅ Check-In Complete</p>
            <p>Mode: <span className="font-semibold">{mode}</span></p>
            <p>Coherence: <span className="font-semibold">{score}</span></p>
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
                    <span>{h.mode} · {h.score}</span>
                  </li>
                ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
