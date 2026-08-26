import { useState } from "react";
import { Mail, Phone, MapPin, Clock, MessageSquareCode, CheckCircle2, ShieldAlert } from "lucide-react";

export default function Contact() {
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate API request
    setTimeout(() => {
      setSubmitted(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
    }, 400);
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-16">
      
      {/* Header Banner */}
      <section className="bg-gradient-to-r from-blue-900 to-slate-900 text-white py-16 text-center space-y-4">
        <span className="bg-primary-500/20 text-primary-300 border border-primary-500/30 px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
          Get in Touch
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold">Contact Us</h1>
        <p className="text-primary-200 max-w-xl mx-auto text-sm sm:text-base">
          Have queries about appointment scheduling, prescriptions, or billing? Our dedicated support desk is available 24/7.
        </p>
      </section>

      {/* Main Grid Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* LEFT 5 COLS: CONTACT INFORMATION */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Info card */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
              <h3 className="font-bold text-slate-800 text-sm border-b border-slate-50 pb-3">Clinical Operations Desk</h3>
              
              <ul className="space-y-5 text-xs text-slate-600">
                <li className="flex items-start gap-4">
                  <Phone className="w-5 h-5 text-primary-600 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-slate-800 text-sm">Emergency Hotlines</h5>
                    <p className="font-semibold text-slate-700 mt-1">+1 (415) 555-4928 (Cardiology)</p>
                    <p className="text-slate-500">+1 (415) 555-1033 (ER Helpline)</p>
                  </div>
                </li>

                <li className="flex items-start gap-4">
                  <Mail className="w-5 h-5 text-primary-600 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-slate-800 text-sm">Official Email Channels</h5>
                    <p className="font-semibold text-slate-700 mt-1">support@healorahealth.com</p>
                    <p className="text-slate-500">appointments@healorahealth.com</p>
                  </div>
                </li>

                <li className="flex items-start gap-4">
                  <MapPin className="w-5 h-5 text-primary-600 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-slate-800 text-sm">Healora HQ Medical Center</h5>
                    <p className="text-slate-500 mt-1">1840 Parkside Blvd, Suite 400</p>
                    <p className="text-slate-500">Los Angeles, CA 90017, USA</p>
                  </div>
                </li>

                <li className="flex items-start gap-4">
                  <Clock className="w-5 h-5 text-primary-600 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-slate-800 text-sm">Visiting Schedules</h5>
                    <p className="text-slate-500 mt-1">Outpatient Dept: Mon - Sat (08:00 AM - 08:00 PM)</p>
                    <p className="font-bold text-rose-500 mt-0.5">Emergency Trauma Center: Open 24/7</p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Warning emergency alert */}
            <div className="bg-amber-50 border border-amber-200 p-5 rounded-3xl flex items-start gap-3.5">
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-700 space-y-1">
                <p className="font-bold">Medical Emergency Notice</p>
                <p className="leading-relaxed">This online contact form is not intended for active clinical emergencies. If you are experiencing a life-threatening symptom, please call emergency services immediately.</p>
              </div>
            </div>

          </div>

          {/* RIGHT 7 COLS: FORM COMPONENT */}
          <div className="lg:col-span-7">
            {submitted ? (
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 text-center space-y-6">
                <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-xl text-slate-900">Message Transmitted</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    We have successfully received your inquiry ticket. A clinical supervisor will email you within 2-4 hours.
                  </p>
                </div>
                <button 
                  onClick={() => setSubmitted(false)}
                  className="bg-primary-750 hover:bg-primary-850 text-white font-bold py-2.5 px-6 rounded-xl text-xs transition-colors"
                >
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <MessageSquareCode className="w-4 h-4 text-primary-600" />
                  <span>Send An Online Inquiry Ticket</span>
                </h3>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1 text-xs">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Your Name</label>
                      <input 
                        type="text" 
                        required 
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-primary-500" 
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="space-y-1 text-xs">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Your Email</label>
                      <input 
                        type="email" 
                        required 
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-primary-500" 
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-1 text-xs">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Subject</label>
                    <input 
                      type="text" 
                      required 
                      value={formData.subject}
                      onChange={(e) => setFormData({...formData, subject: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-primary-500" 
                      placeholder="e.g. Health Packages, Telehealth appointment help..."
                    />
                  </div>

                  <div className="space-y-1 text-xs">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Message Details</label>
                    <textarea 
                      rows="5" 
                      required 
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 focus:outline-none focus:border-primary-500 resize-none" 
                      placeholder="Write your detailed query description..."
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="w-full bg-primary-700 hover:bg-primary-800 text-white font-bold py-3.5 rounded-2xl text-xs transition-colors shadow-md"
                  >
                    Submit Support Ticket
                  </button>
                </form>
              </div>
            )}
          </div>

        </div>
      </main>

    </div>
  );
}
