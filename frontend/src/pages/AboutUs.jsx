import { Activity, ShieldCheck, Heart, Award, Sparkles, Stethoscope, Users } from "lucide-react";

export default function AboutUs() {
  const milestones = [
    { year: "2005", title: "Hospital Founded", desc: "Healora started as a local clinic with 5 doctors and 10 beds." },
    { year: "2012", title: "State-of-the-Art Wing", desc: "Opened a specialized cardiac and neuro diagnostics wing." },
    { year: "2018", title: "Global Expansion", desc: "Started telehealth platforms and integrated digital pharmacy." },
    { year: "2026", title: "Healora 2.0 Launch", desc: "Now serving over 10,000+ monthly digital and clinical patients." }
  ];

  return (
    <div className="bg-slate-50 min-h-screen pb-16">
      
      {/* Header Banner */}
      <section className="bg-gradient-to-r from-blue-900 to-slate-900 text-white py-16 text-center space-y-4">
        <span className="bg-primary-500/20 text-primary-300 border border-primary-500/30 px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
          Who We Are
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold">About Healora</h1>
        <p className="text-primary-200 max-w-xl mx-auto text-sm sm:text-base">
          Learn about our journey, our values, and our commitment to bringing world-class healthcare directly to your community.
        </p>
      </section>

      {/* Main Content Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">
        
        {/* Row 1: Intro Story */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Pioneering Compassionate Healthcare Since 2005
            </h2>
            <p className="text-slate-600 leading-relaxed text-sm">
              Healora was established with a singular mission: to provide patient-centric medical treatment utilizing the latest technology and top clinical minds. Over the past two decades, we have evolved from a local health clinic into a comprehensive, multi-specialty healthcare platform.
            </p>
            <p className="text-slate-600 leading-relaxed text-sm">
              We integrate clinical consultation, digital scheduling, continuous patient health monitoring, and doorstep pharmaceutical delivery in one unified experience. Our goal is to make quality healthcare accessible, affordable, and stress-free.
            </p>
            
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-3 gap-6 pt-4 border-t border-slate-100">
              <div>
                <p className="text-2xl font-extrabold text-primary-750">200+</p>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">Expert Doctors</p>
              </div>
              <div>
                <p className="text-2xl font-extrabold text-primary-750">15+</p>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">Medical Specialties</p>
              </div>
              <div>
                <p className="text-2xl font-extrabold text-primary-750">10k+</p>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">Happy Patients</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 relative">
            <div className="absolute inset-0 bg-primary-100/50 rounded-[32px] blur-2xl top-4 left-4 -z-10"></div>
            <img 
              src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=600&q=80" 
              alt="Healora Clinical Team" 
              className="w-full h-[400px] object-cover rounded-[32px] shadow-xl border-4 border-white"
            />
          </div>
        </section>

        {/* Row 2: Core Pillars */}
        <section className="bg-white rounded-[32px] border border-slate-100 p-8 sm:p-12 shadow-sm space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Our Core Philosophy</h2>
            <p className="text-slate-500 text-sm">Three basic principles drive our day-to-day decisions at Healora.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Pillar 1 */}
            <div className="space-y-4 text-center md:text-left flex flex-col items-center md:items-start">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shrink-0">
                <Heart className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-800 text-base">Uncompromising Care</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                We approach diagnostics and surgery with empathy, putting the patient's convenience, emotional health, and physical comfort at the forefront.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="space-y-4 text-center md:text-left flex flex-col items-center md:items-start">
              <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center border border-cyan-100 shrink-0">
                <Stethoscope className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-800 text-base">Advanced Diagnostics</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                By deploying intelligent systems, telemedicine tools, and remote patient monitoring, we prevent medical issues and deliver faster, precise interventions.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="space-y-4 text-center md:text-left flex flex-col items-center md:items-start">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-800 text-base">Ethical Integrity</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                We believe in full cost transparency, medical file confidentiality, and treating patients without unnecessary procedures or overhead.
              </p>
            </div>
          </div>
        </section>

        {/* Row 3: Timeline Timeline */}
        <section className="space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Our Growth Journey</h2>
            <p className="text-slate-500 text-sm">Tracing our key medical milestones over the years.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {milestones.map((m, i) => (
              <div key={i} className="bg-slate-50 hover:bg-white border border-slate-200/50 hover:border-primary-100 p-6 rounded-2xl transition-all shadow-sm">
                <span className="text-2xl font-extrabold text-primary-600 block mb-2">{m.year}</span>
                <h4 className="font-bold text-slate-800 text-sm mb-1">{m.title}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">{m.desc}</p>
              </div>
            ))}
          </div>
        </section>

      </main>

    </div>
  );
}
