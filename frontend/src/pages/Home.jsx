import { useNavigate } from "react-router-dom";
import { Search, ChevronDown, Monitor, Sparkles, Stethoscope, Pill, Activity, Gauge, Bot, ArrowRight, ShieldCheck } from "lucide-react";
import { doctors } from "../data/doctors";

// Custom Hexagon Pattern component for hero background
const HexagonPattern = ({ className }) => (
  <svg className={className} width="160" height="180" viewBox="0 0 160 180" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M80 10L145 45v75L80 155 15 120V45z" stroke="#90c0cf" strokeWidth="1" strokeDasharray="4 4" opacity="0.35" fill="none" />
    <path d="M80 25L130 52v56L80 135 30 108V52z" stroke="#90c0cf" strokeWidth="1" strokeDasharray="3 3" opacity="0.25" fill="none" />
  </svg>
);

// Custom Medical Organ Line Art SVGs
const KidneyIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M6 5c1.5-2 4-2 5 0 .8 1.5 1.2 4 0 6.5s-2.5 3-5 3c-1.5 0-3-1.5-3-3s1.5-4.5 3-6.5Z" />
    <path d="M18 5c-1.5-2-4-2-5 0-.8 1.5-1.2 4 0 6.5s-2.5 3-5 3c-1.5 0-3-1.5-3-3s1.5-4.5-3-6.5Z" />
    <path d="M11 9.5h2M12 9.5v5" />
  </svg>
);

const HeartIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 21c-4-4.5-8-7.5-8-11.5C4 6 7 3.5 10 3.5c1.5 0 2.5.5 3 1.5.5-1 1.5-1.5 3-1.5 3 0 6 2.5 6 6 0 4-4 7-8 11.5Z" />
    <path d="M12 8c.5-1.5.5-3 1-3.5M10.5 7.5c-1-1.5-2.5-1.5-3-.5" />
  </svg>
);

const LungsIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 3v13M12 6a3 3 0 0 0-3-3H7a4 4 0 0 0-4 4v7c0 3 2.5 5 5.5 5h.5c2 0 3-2 3-4V6Z" />
    <path d="M12 6a3 3 0 0 1 3-3h2a4 4 0 0 1 4 4v7c0 3-2.5 5-5.5 5h-.5c-2 0-3-2-3-4V6Z" />
  </svg>
);

const ToothIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M7 3c2 0 3.5 1 5 3 1.5-2 3-3 5-3 3 0 4 2.5 4 5 0 4.5-2 7.5-3 9.5-.5 1-1.5 2-2 3.5-.5.5-1.5.5-2-.5L12 17l-2 3.5c-.5 1-1.5 1-2 .5-.5-1.5-1.5-2.5-2-3.5C5 15.5 3 12.5 3 8c0-2.5 1-5 4-5Z" />
  </svg>
);

const BrainIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v11A2.5 2.5 0 0 1 9.5 18H8A4 4 0 0 1 4 14v-2c0-1 .5-2 1.5-2.5C4 9 3 7.5 3 6a3 3 0 0 1 3-3h3.5Z" />
    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v11A2.5 2.5 0 0 0 14.5 18H16a4 4 0 0 0 4-4v-2c0-1-.5-2-1.5-2.5C19 9 20 7.5 20 6a3 3 0 0 0-3-3h-2.5Z" />
    <path d="M12 9h.01M12 12h.01" />
  </svg>
);

const StomachIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 3c-3 0-5 2-5 5.5v3c0 2 1.5 4 4 5v3c-1.5.5-2.5 1.5-2.5 2.5h7c0-1-1-2-2.5-2.5v-3c2.5-1 4-3 4-5v-3C17 5 15 3 12 3Z" />
    <path d="M9 10a3 3 0 0 0 6 0" />
  </svg>
);

const depCategories = [
  { name: "Kidneys", Icon: KidneyIcon },
  { name: "Heart", Icon: HeartIcon },
  { name: "Lungs", Icon: LungsIcon },
  { name: "Tooth", Icon: ToothIcon },
  { name: "Brain", Icon: BrainIcon },
  { name: "Joints", Icon: StomachIcon },
];

export default function Home() {
  const navigate = useNavigate();
  const heroDoctor = doctors[0]; // Male doctor for bottom section
  const femaleDoctorImg = "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=600&q=80";

  return (
    <main className="overflow-hidden bg-white text-slate-800 font-sans">
      
      {/* Hero Section */}
      <section className="relative isolate overflow-visible bg-gradient-to-br from-[#eaf3f6] via-[#f7fbfb] to-white pb-48 pt-20 sm:pt-28">
        
        {/* Background Patterns */}
        <HexagonPattern className="absolute right-[5%] top-[10%] opacity-80 hidden lg:block" />
        
        {/* Organic Blob shapes in background */}
        <div className="absolute right-[10%] top-[12%] h-[400px] w-[400px] rounded-full bg-[#90c0cf]/15 blur-3xl -z-10" />
        <div className="absolute right-[22%] top-[30%] h-[300px] w-[300px] rounded-full bg-[#bcd9e2]/20 blur-2xl -z-10" />

        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-6 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:px-10">
          
          {/* Left Column Text Content */}
          <div className="max-w-xl text-left">
            <h1 className="text-4xl font-extrabold leading-[1.15] tracking-tight text-slate-900 sm:text-5xl md:text-6xl">
              Premium Treatments
              <br />
              for a Healthy Lifestyle
            </h1>
            <p className="mt-6 text-sm leading-relaxed text-slate-500">
              Seamlessly advance scalable architectures with future-ready growth strategies. Efficiently implement low-risk, high-return process enhancements for mission-critical testing procedures, especially in publishing and related industries.
            </p>
            <button
              onClick={() => navigate("/about")}
              className="mt-8 flex items-center gap-3.5 rounded-full bg-[#0d5c75] hover:bg-[#0a4659] px-6 py-3.5 text-sm font-semibold text-white shadow-md shadow-sky-950/10 transition-all duration-200 hover:-translate-y-0.5"
            >
              View Our Hospital
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-[#0d5c75]">
                <svg className="h-2.5 w-2.5 fill-current ml-0.5" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
            </button>
          </div>

          {/* Right Column Image & Floating Cards */}
          <div className="relative mx-auto flex w-full max-w-md items-end justify-center pt-8 lg:pt-0">
            {/* Organic back shape under doctor */}
            <div className="absolute bottom-0 top-10 left-12 right-12 rounded-[5rem] bg-[#89b8c7]/20 -z-10" />
            
            <img
              src={femaleDoctorImg}
              alt="Female doctor smiling"
              className="relative z-10 h-[380px] w-[300px] sm:h-[460px] sm:w-[360px] object-cover object-top drop-shadow-xl rounded-b-[4rem]"
            />

            {/* Floating Card 1 (Top Right) */}
            <div className="absolute right-0 top-16 z-20 flex items-center gap-2 rounded-full bg-white px-4 py-2.5 shadow-md border border-slate-100">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-slate-700">2500+ Doctors Online</span>
            </div>

            {/* Floating Card 2 (Bottom Left) */}
            <div className="absolute -left-4 bottom-24 z-20 flex items-center gap-3 rounded-2xl bg-white p-3.5 shadow-md border border-slate-100">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white shrink-0">
                <Search className="h-5 w-5" />
              </span>
              <div className="text-left">
                <h4 className="text-xs font-bold text-slate-800">Search the Medical</h4>
                <p className="text-[9px] text-slate-400 font-semibold leading-none mt-1">With more Care Option</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Counter Bar (Sits horizontally at bottom of hero) */}
        <div className="absolute bottom-0 left-0 right-0 bg-white pt-10 pb-6 rounded-t-[3.5rem] z-10 shadow-[0_-15px_40px_-20px_rgba(0,0,0,0.05)]">
          <div className="mx-auto max-w-6xl px-6 sm:px-8 lg:px-10">
            <div className="grid grid-cols-2 gap-y-6 md:grid-cols-4 md:gap-y-0 text-center border-b border-slate-100 pb-6">
              <div className="border-r border-slate-100 last:border-0">
                <span className="block text-2xl font-extrabold text-slate-800">4500+</span>
                <span className="mt-1 block text-xs font-semibold text-slate-400">Happy Patients</span>
              </div>
              <div className="border-r border-slate-100 last:border-0">
                <span className="block text-2xl font-extrabold text-slate-800">200</span>
                <span className="mt-1 block text-xs font-semibold text-slate-400">Hospital Room</span>
              </div>
              <div className="border-r border-slate-100 last:border-0">
                <span className="block text-2xl font-extrabold text-slate-800">500+</span>
                <span className="mt-1 block text-xs font-semibold text-slate-400">Award Win</span>
              </div>
              <div className="last:border-0">
                <span className="block text-2xl font-extrabold text-slate-800">20+</span>
                <span className="mt-1 block text-xs font-semibold text-slate-400">Ambulance</span>
              </div>
            </div>
          </div>
        </div>

      </section>

      {/* Search Widget */}
      <section className="relative z-20 -mt-8 px-6 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              navigate("/doctors");
            }}
            className="grid gap-4 rounded-2xl bg-[#7ba0ad] p-4 shadow-md sm:grid-cols-5 items-center"
          >
            {/* Select Department */}
            <div className="relative">
              <select className="w-full appearance-none rounded-xl border border-white/20 bg-white/10 px-4 py-3.5 pr-10 text-xs font-semibold text-white placeholder-white/70 outline-none cursor-pointer focus:bg-white/20">
                <option className="text-slate-800" value="">Select Department</option>
                <option className="text-slate-800" value="Cardiology">Cardiology</option>
                <option className="text-slate-800" value="Orthopedics">Orthopedics</option>
                <option className="text-slate-800" value="Physiotherapy">Physiotherapy</option>
                <option className="text-slate-800" value="Neurology">Neurology</option>
              </select>
              <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-white">
                <ChevronDown className="h-4 w-4" />
              </span>
            </div>

            {/* Select Doctor */}
            <div className="relative">
              <select className="w-full appearance-none rounded-xl border border-white/20 bg-white/10 px-4 py-3.5 pr-10 text-xs font-semibold text-white placeholder-white/70 outline-none cursor-pointer focus:bg-white/20">
                <option className="text-slate-800" value="">Select Doctor</option>
                {doctors.map(d => <option key={d.id} className="text-slate-800" value={d.id}>{d.name}</option>)}
              </select>
              <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-white">
                <ChevronDown className="h-4 w-4" />
              </span>
            </div>

            {/* Select Date */}
            <div className="relative">
              <select className="w-full appearance-none rounded-xl border border-white/20 bg-white/10 px-4 py-3.5 pr-10 text-xs font-semibold text-white placeholder-white/70 outline-none cursor-pointer focus:bg-white/20">
                <option className="text-slate-800" value="">Select Date</option>
                <option className="text-slate-800" value="today">Today</option>
                <option className="text-slate-800" value="tomorrow">Tomorrow</option>
              </select>
              <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-white">
                <ChevronDown className="h-4 w-4" />
              </span>
            </div>

            {/* Select Location */}
            <div className="relative">
              <select className="w-full appearance-none rounded-xl border border-white/20 bg-white/10 px-4 py-3.5 pr-10 text-xs font-semibold text-white placeholder-white/70 outline-none cursor-pointer focus:bg-white/20">
                <option className="text-slate-800" value="">Select Location</option>
                <option className="text-slate-800" value="hospital">Healora Center</option>
              </select>
              <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-white">
                <ChevronDown className="h-4 w-4" />
              </span>
            </div>

            {/* Search Button */}
            <button className="flex items-center justify-center gap-2 rounded-xl bg-white hover:bg-slate-50 px-6 py-3.5 text-xs font-bold text-[#678b97] shadow-sm transition">
              <Search className="h-4 w-4 text-[#678b97]" />
              Search
            </button>
          </form>
        </div>
      </section>

      {/* Department Category Section */}
      <section className="mx-auto max-w-6xl px-6 py-24 sm:px-8 lg:px-10">
        
        {/* Heading */}
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-extrabold text-slate-800">
            Department Category
          </h2>
          <p className="mt-3.5 text-xs font-semibold text-slate-400">
            Browse by department for tailored services and expert solutions
          </p>
        </div>

        {/* 6 Category Cards Row */}
        <div className="mt-12 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-6">
          {depCategories.map(({ name, Icon }) => (
            <div
              key={name}
              onClick={() => navigate(`/doctors?specialty=${name}`)}
              className="group flex h-32 items-center justify-center rounded-2xl border border-slate-100 bg-white p-6 shadow-sm hover:border-[#7ba0ad] hover:shadow-md transition-all duration-300 cursor-pointer"
            >
              <Icon className="h-14 w-14 text-[#8fbfcf] transition-transform duration-300 group-hover:scale-105" />
            </div>
          ))}
        </div>

      </section>

      {/* 🌟 NEXT-GEN AI HEALTHCARE INTELLIGENCE SHOWCASE SECTION */}
      <section className="bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 text-white py-20 px-6 sm:px-8 relative overflow-hidden border-y border-indigo-900/40">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent pointer-events-none" />
        
        <div className="relative mx-auto max-w-6xl z-10 space-y-12">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-6 border-b border-indigo-800/40">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-2 bg-indigo-500/20 text-indigo-300 px-3.5 py-1 rounded-full text-xs font-bold border border-indigo-400/30">
                <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                <span>Next-Gen Medical Intelligence Suite 2.0</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                Hospital-Grade AI Clinical Intelligence
              </h2>
              <p className="text-indigo-200/80 text-xs sm:text-sm leading-relaxed">
                Empowering patients and clinicians with Bayesian differential triage, multi-medication contraindication safety, biomarker lab analytics, and voice-assisted clinical copilots.
              </p>
            </div>

            <button
              onClick={() => navigate("/ai-assistant")}
              className="bg-primary-600 hover:bg-primary-500 text-white text-xs sm:text-sm font-bold px-6 py-3.5 rounded-full transition-all shadow-lg shadow-primary-600/30 flex items-center gap-2 cursor-pointer shrink-0"
            >
              <span>Explore AI Suite</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* 4 Flagship AI Capability Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Card 1: Differential Triage */}
            <div 
              onClick={() => navigate("/ai-assistant?tab=triage")}
              className="bg-white/10 hover:bg-white/15 border border-white/10 hover:border-indigo-400/50 p-6 rounded-3xl backdrop-blur-md transition-all duration-300 hover:-translate-y-1 cursor-pointer space-y-3 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-primary-500/20 text-primary-300 flex items-center justify-center group-hover:scale-110 transition">
                <Stethoscope className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-white text-base">Differential Triage</h3>
              <p className="text-xs text-indigo-200/70 leading-relaxed">
                Bayesian multi-factor symptom reasoning, ICD-10 matching, red-flag emergency detection, and verified specialist routing.
              </p>
              <div className="flex items-center gap-1 text-xs font-bold text-indigo-300 group-hover:text-amber-300 transition pt-1">
                <span>Try Triage</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Card 2: RxGuardian Drug Safety */}
            <div 
              onClick={() => navigate("/ai-assistant?tab=drug-interactions")}
              className="bg-white/10 hover:bg-white/15 border border-white/10 hover:border-rose-400/50 p-6 rounded-3xl backdrop-blur-md transition-all duration-300 hover:-translate-y-1 cursor-pointer space-y-3 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-300 flex items-center justify-center group-hover:scale-110 transition">
                <Pill className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-white text-base">RxGuardian Safety</h3>
              <p className="text-xs text-indigo-200/70 leading-relaxed">
                Analyzes multi-drug combinations for CYP3A4 inhibition, bleeding hazards, and food/alcohol contraindications.
              </p>
              <div className="flex items-center gap-1 text-xs font-bold text-rose-300 group-hover:text-amber-300 transition pt-1">
                <span>Check Drug Safety</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Card 3: BioVision Lab Interpreter */}
            <div 
              onClick={() => navigate("/ai-assistant?tab=lab-interpreter")}
              className="bg-white/10 hover:bg-white/15 border border-white/10 hover:border-teal-400/50 p-6 rounded-3xl backdrop-blur-md transition-all duration-300 hover:-translate-y-1 cursor-pointer space-y-3 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-teal-300 flex items-center justify-center group-hover:scale-110 transition">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-white text-base">BioVision Labs</h3>
              <p className="text-xs text-indigo-200/70 leading-relaxed">
                Instant biomarker validation across Lipid, Metabolic, and Renal panels with curated doctor discussion checklists.
              </p>
              <div className="flex items-center gap-1 text-xs font-bold text-teal-300 group-hover:text-amber-300 transition pt-1">
                <span>Interpret Labs</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Card 4: MedAI 2.0 Voice Copilot */}
            <div 
              onClick={() => navigate("/ai-assistant?tab=copilot")}
              className="bg-white/10 hover:bg-white/15 border border-white/10 hover:border-purple-400/50 p-6 rounded-3xl backdrop-blur-md transition-all duration-300 hover:-translate-y-1 cursor-pointer space-y-3 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-300 flex items-center justify-center group-hover:scale-110 transition">
                <Bot className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-white text-base">MedAI 2.0 Voice</h3>
              <p className="text-xs text-indigo-200/70 leading-relaxed">
                24/7 conversational clinical copilot featuring specialized doctor personas, voice dictation, and speech synthesis.
              </p>
              <div className="flex items-center gap-1 text-xs font-bold text-purple-300 group-hover:text-amber-300 transition pt-1">
                <span>Start AI Consultation</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* World-Class Healthcare Services Section (Bottom) */}
      <section className="relative bg-[#5b8595] px-6 py-24 sm:px-8 overflow-hidden">
        
        {/* Heartbeat pulse path decoration behind contents */}
        <div className="absolute left-[3%] bottom-[8%] opacity-10 text-white pointer-events-none hidden lg:block">
          <svg width="400" height="200" viewBox="0 0 400 200" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M0 100h120l15-40 20 80 15-55 10 15h220" />
          </svg>
        </div>

        <div className="relative mx-auto max-w-6xl z-10">
          
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_2.1fr_1.1fr] gap-10 items-center">
            
            {/* Column 1: Title & Action Button */}
            <div className="text-left space-y-6">
              <h2 className="text-3xl font-extrabold leading-tight text-white sm:text-4xl">
                World-Class Healthcare Services for you and your loved ones
              </h2>
              <button
                onClick={() => navigate("/doctors")}
                className="inline-flex items-center gap-2 rounded-full bg-white hover:bg-slate-50 px-6 py-3.5 text-xs font-bold text-[#5b8595] shadow-sm transition"
              >
                More Service
                <span className="font-extrabold">&rarr;</span>
              </button>
            </div>

            {/* Column 2: Staggered Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-6">
              
              {/* Left Column Stack */}
              <div className="space-y-6">
                
                {/* Emergency Services */}
                <div className="rounded-3xl bg-white p-6 shadow-md border border-slate-100 text-left transition-all hover:-translate-y-1">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#5b8595]/15 text-[#5b8595] mb-5">
                    <Monitor className="h-5 w-5" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800">Emergency Services</h4>
                  <p className="mt-2.5 text-[10px] leading-relaxed text-slate-400">
                    24/7 immediate medical care for critical conditions, accidents, and life-threatening situations. Equipped to handle trauma, cardiac arrest, and urgent interventions.
                  </p>
                </div>

                {/* Pharmacy */}
                <div className="rounded-3xl bg-white p-6 shadow-md border border-slate-100 text-left transition-all hover:-translate-y-1">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#5b8595]/15 text-[#5b8595] mb-5">
                    <Monitor className="h-5 w-5" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800">Pharmacy</h4>
                  <p className="mt-2.5 text-[10px] leading-relaxed text-slate-400">
                    In-house medical store providing prescribed medications and health essentials, ensuring timely access to necessary drugs for both inpatient and outpatient services.
                  </p>
                </div>

              </div>

              {/* Right Column Stack (Staggered offsets on md+ screens) */}
              <div className="space-y-6 md:translate-y-8">
                
                {/* Radiology & Imaging */}
                <div className="rounded-3xl bg-white p-6 shadow-md border border-slate-100 text-left transition-all hover:-translate-y-1">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#5b8595]/15 text-[#5b8595] mb-5">
                    <Monitor className="h-5 w-5" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800">Radiology & Imaging</h4>
                  <p className="mt-2.5 text-[10px] leading-relaxed text-slate-400">
                    Advanced diagnostic imaging services including X-ray, CT scan, MRI, and ultrasound to assist in accurate and efficient diagnosis of medical conditions.
                  </p>
                </div>

                {/* Laboratory Services */}
                <div className="rounded-3xl bg-white p-6 shadow-md border border-slate-100 text-left transition-all hover:-translate-y-1">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#5b8595]/15 text-[#5b8595] mb-5">
                    <Monitor className="h-5 w-5" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800">Laboratory Services</h4>
                  <p className="mt-2.5 text-[10px] leading-relaxed text-slate-400">
                    Comprehensive lab testing for blood, urine, and other samples, supporting fast and precise medical diagnosis and treatment planning.
                  </p>
                </div>

              </div>

            </div>

            {/* Column 3: Male Doctor Image (Hidden on mobile) */}
            <div className="relative self-end hidden lg:block h-full">
              <img
                src={heroDoctor.image}
                alt="Male doctor crossing arms"
                className="h-[460px] w-full object-cover object-top drop-shadow-xl mix-blend-multiply"
              />
            </div>

          </div>

        </div>

        {/* Pulse/Heartbeat line decoration at bottom */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-48 text-white/30">
          <svg viewBox="0 0 100 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-8">
            <path d="M0 10h30l3-8 4 16 3-11 2 3h28" />
          </svg>
        </div>

      </section>

    </main>
  );
}
