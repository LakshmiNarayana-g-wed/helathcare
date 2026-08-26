import { useState } from "react";
import { Activity, ChevronDown, Download, FileText, HeartPulse, Info, Stethoscope, UserRound } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { getCurrentUser } from "../utils/sessionUser";

const pressure = [
  { day: "Mon", value: 118 }, { day: "Tue", value: 122 }, { day: "Wed", value: 120 },
  { day: "Thu", value: 126 }, { day: "Fri", value: 121 }, { day: "Sat", value: 124 }, { day: "Sun", value: 120 },
];
const heartRate = [
  { day: "Mon", value: 76 }, { day: "Tue", value: 79 }, { day: "Wed", value: 75 },
  { day: "Thu", value: 82 }, { day: "Fri", value: 80 }, { day: "Sat", value: 85 }, { day: "Sun", value: 78 },
];

function VitalChart({ title, value, unit, data, color, gradient }) {
  return (
    <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-4">
        <h2 className="text-sm font-bold text-slate-800">{title}</h2>
        <p className="text-right text-sm font-bold text-slate-800">{value}<span className="ml-1 text-[10px] font-medium text-slate-400">{unit}</span></p>
      </div>
      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 4, left: -26, bottom: 0 }}>
            <defs>
              <linearGradient id={gradient} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.32} />
                <stop offset="100%" stopColor={color} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#e9eef5" strokeDasharray="2 4" vertical={false} />
            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 10 }} />
            <YAxis domain={["dataMin - 5", "dataMax + 5"]} hide />
            <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }} />
            <Area type="monotone" dataKey="value" stroke={color} strokeWidth={3} fill={`url(#${gradient})`} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

export default function Reports() {
  const [range, setRange] = useState("Last 7 days");
  const currentUser = getCurrentUser();
  const patient = { name: currentUser?.name || "Lakshmi Narayana", age: currentUser?.age || 35, gender: currentUser?.gender || "Female", height: currentUser?.height || "168 cm", weight: currentUser?.weight || "62 kg", bloodGroup: currentUser?.bloodGroup || "A+" };

  return (
    <main className="min-h-screen bg-[#f5f8fc] pb-16">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-7 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary-600">Patient workspace / Reports</p>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Health reports</h1>
            <p className="mt-1 text-sm text-slate-500">Your latest vital signs, clinical results, and health overview.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600">
              <span className="sr-only">Report date range</span>
              <select value={range} onChange={(event) => setRange(event.target.value)} className="appearance-none bg-transparent outline-none">
                <option>Last 7 days</option><option>Last 30 days</option><option>This year</option>
              </select>
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </label>
            <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-xl bg-primary-700 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-primary-800">
              <Download className="h-4 w-4" /> Download report
            </button>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 xl:grid-cols-[0.82fr_1.5fr_0.72fr]">
          <aside className="space-y-6">
            <section className="overflow-hidden rounded-3xl bg-slate-900 p-6 text-white shadow-xl shadow-slate-900/10">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-500/20 text-primary-200"><UserRound className="h-7 w-7" /></div>
                <div><p className="text-xs font-semibold uppercase tracking-wider text-primary-300">Patient profile</p><h2 className="mt-1 text-xl font-bold">{patient.name}</h2></div>
              </div>
              <div className="mt-6 grid grid-cols-3 gap-2 border-t border-white/10 pt-5 text-center text-xs">
                <div><p className="text-slate-400">Gender</p><p className="mt-1 font-bold">{patient.gender}</p></div>
                <div><p className="text-slate-400">Age</p><p className="mt-1 font-bold">{patient.age} years</p></div>
                <div><p className="text-slate-400">Blood group</p><p className="mt-1 font-bold">{patient.bloodGroup}</p></div>
              </div>
              <p className="mt-4 border-t border-white/10 pt-4 text-center text-xs text-slate-300">Height {patient.height} &nbsp;•&nbsp; Weight {patient.weight}</p>
            </section>

            <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2"><Stethoscope className="h-5 w-5 text-rose-500" /><h2 className="font-bold text-slate-800">Care focus</h2></div>
              <div className="mt-5 rounded-2xl border border-amber-100 bg-amber-50 p-4">
                <p className="text-[11px] font-bold uppercase tracking-wider text-amber-700">Active follow-up</p>
                <p className="mt-1 text-sm font-bold text-slate-800">Annual cardiac screening</p>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">Next review with Dr. Emily Tanaka on 30 Aug 2026.</p>
              </div>
              <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-primary-200 py-2.5 text-xs font-bold text-primary-700 transition hover:bg-primary-50"><FileText className="h-4 w-4" /> View clinical notes</button>
            </section>
          </aside>

          <div className="space-y-6">
            <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><p className="text-xs font-semibold uppercase tracking-wider text-primary-600">Health composition</p><h2 className="mt-1 text-xl font-bold text-slate-900">Your overall health is on track</h2></div><span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700"><Activity className="h-4 w-4" /> Updated today</span></div>
              <div className="mt-6 grid gap-6 md:grid-cols-[190px_1fr] md:items-center">
                <div className="relative mx-auto flex h-40 w-40 items-center justify-center rounded-full" style={{ background: "conic-gradient(#2563eb 0deg 292deg, #e8eef8 292deg 360deg)" }}><div className="flex h-28 w-28 flex-col items-center justify-center rounded-full bg-white"><strong className="text-3xl text-primary-700">81%</strong><span className="text-[10px] font-semibold text-slate-400">health score</span></div></div>
                <div className="grid grid-cols-2 gap-x-7 gap-y-3 text-sm">
                  {[['Glucose', '7.9 mmol/L', 'text-emerald-600'], ['Cholesterol', '195 mg/dL', 'text-amber-600'], ['Haemoglobin', '12.6 g/dL', 'text-emerald-600'], ['Platelets', '395 x10⁹/L', 'text-emerald-600'], ['Blood pressure', '120/70 mmHg', 'text-primary-600'], ['Resting pulse', '78 bpm', 'text-primary-600']].map(([label, result, color]) => <div key={label} className="flex justify-between gap-3 border-b border-slate-100 pb-2"><span className="text-xs text-slate-500">{label}</span><span className={`text-xs font-bold ${color}`}>{result}</span></div>)}
                </div>
              </div>
              <p className="mt-6 flex items-start gap-2 rounded-xl bg-slate-50 p-3 text-[11px] leading-relaxed text-slate-500"><Info className="mt-0.5 h-4 w-4 shrink-0 text-primary-600" />This overview supports—not replaces—advice from your clinician. Discuss unusual readings with your care team.</p>
            </section>
            <div className="grid gap-6 md:grid-cols-2"><VitalChart title="Blood pressure" value="120/70" unit="mmHg" data={pressure} color="#e05a67" gradient="pressureFill" /><VitalChart title="Heart rate" value="78" unit="BPM" data={heartRate} color="#2563eb" gradient="heartFill" /></div>
          </div>

          <aside className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm xl:sticky xl:top-28 xl:h-fit">
            <div className="border-b border-slate-100 px-5 py-4">
              <p className="text-xs font-bold text-slate-800">Body health map</p>
              <p className="mt-1 text-[11px] text-slate-500">Visual overview of active care areas</p>
            </div>
            <img
              src="/anatomy-health-journey.png"
              alt="Anatomical health map showing heart, lung, and kidney care areas"
              className="h-auto w-full object-cover object-top"
            />
          </aside>
        </div>
      </div>
    </main>
  );
}
