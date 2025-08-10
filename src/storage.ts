// src/storage.ts
export type CheckIn = {
  date: string;   // YYYY-MM-DD
  mode: string;
  score: number;  // 0–100
};

const KEY = "coherence_checkins_v1";

export function loadCheckIns(): CheckIn[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as CheckIn[]) : [];
  } catch {
    return [];
  }
}

export function saveCheckIns(entries: CheckIn[]) {
  // keep last ~6 months to avoid bloat
  const trimmed = entries.slice(-180);
  localStorage.setItem(KEY, JSON.stringify(trimmed));
}

export function upsertToday(entry: Omit<CheckIn, "date">) {
  const today = new Date().toISOString().slice(0, 10);
  const list = loadCheckIns();
  const i = list.findIndex(e => e.date === today);
  const next: CheckIn = { date: today, ...entry };
  if (i >= 0) list[i] = next; else list.push(next);
  saveCheckIns(list);
  return list;
}

export function calcStreak(entries: CheckIn[]): number {
  if (!entries.length) return 0;
  const sorted = [...entries].sort((a,b) => a.date.localeCompare(b.date));
  let streak = 0;
  let d = new Date();
  const set = new Set(sorted.map(e => e.date));
  while (true) {
    const key = d.toISOString().slice(0,10);
    if (!set.has(key)) break;
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

export function avgLastNDays(entries: CheckIn[], n=7): number {
  const slice = [...entries].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,n);
  if (!slice.length) return 0;
  const sum = slice.reduce((acc,e)=>acc+e.score,0);
  return Math.round((sum / slice.length) * 10) / 10;
}
