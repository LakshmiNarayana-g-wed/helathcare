import { Link } from "react-router-dom";
import { HeartPulse, Mail, Phone, MapPin, ArrowRight } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
        
        {/* Brand & Newsletter */}
        <div className="lg:col-span-1 space-y-6">
          <div className="flex items-center gap-2 text-2xl font-bold text-white">
            <HeartPulse className="w-8 h-8 text-primary-400" />
            <span>Healora</span>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed">
            Global Care. Local Heart. Always. Providing trusted healthcare solutions since 2005.
          </p>
          <div className="space-y-3">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Stay Updated</p>
            <div className="relative flex">
              <input 
                type="email" 
                placeholder="Your email" 
                className="w-full bg-slate-800 text-slate-100 placeholder-slate-500 border border-slate-700 px-4 py-2 rounded-l-full focus:outline-none focus:border-primary-500 text-sm"
              />
              <button className="bg-primary-600 hover:bg-primary-500 text-white px-4 rounded-r-full flex items-center justify-center transition-colors">
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          <p className="text-xs text-slate-500">
            www.healorahealth.com
          </p>
        </div>

        {/* Resources */}
        <div className="space-y-4">
          <h4 className="text-white font-semibold text-base">Resources</h4>
          <ul className="space-y-2.5 text-sm">
            <li><a href="#" className="hover:text-primary-400 transition-colors">Insurance Partners</a></li>
            <li><a href="#" className="hover:text-primary-400 transition-colors">Health Check Packages</a></li>
            <li><a href="#" className="hover:text-primary-400 transition-colors">Patient Guide</a></li>
            <li><a href="#" className="hover:text-primary-400 transition-colors">COVID-19 Info</a></li>
          </ul>
        </div>

        {/* About Us */}
        <div className="space-y-4">
          <h4 className="text-white font-semibold text-base">About Us</h4>
          <ul className="space-y-2.5 text-sm">
            <li><Link to="/" className="hover:text-primary-400 transition-colors">Home</Link></li>
            <li><Link to="/about" className="hover:text-primary-400 transition-colors">About Us</Link></li>
            <li><Link to="/" className="hover:text-primary-400 transition-colors">Departments</Link></li>
            <li><Link to="/doctors" className="hover:text-primary-400 transition-colors">Doctors</Link></li>
            <li><Link to="/doctors" className="hover:text-primary-400 transition-colors">Appointment</Link></li>
            <li><Link to="/" className="hover:text-primary-400 transition-colors">Testimonials</Link></li>
          </ul>
        </div>

        {/* Support */}
        <div className="space-y-4">
          <h4 className="text-white font-semibold text-base">Support</h4>
          <ul className="space-y-2.5 text-sm">
            <li><Link to="/reports" className="hover:text-primary-400 transition-colors">Health Reports</Link></li>
            <li><a href="#" className="hover:text-primary-400 transition-colors">FAQs</a></li>
            <li><a href="#" className="hover:text-primary-400 transition-colors">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-primary-400 transition-colors">Payment & Billing</a></li>
            <li><a href="#" className="hover:text-primary-400 transition-colors">Terms & Service</a></li>
          </ul>
        </div>

        {/* Contact info */}
        <div className="space-y-4 text-sm">
          <h4 className="text-white font-semibold text-base">Need Any Help?</h4>
          <ul className="space-y-3.5">
            <li className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-primary-400 shrink-0" />
              <span className="text-slate-200 font-medium">+1 (415) 555-4928</span>
            </li>
            <li className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-primary-400 shrink-0" />
              <span className="text-slate-200">contact@healorahealth.com</span>
            </li>
            <li className="flex gap-3">
              <MapPin className="w-4 h-4 text-primary-400 shrink-0 mt-1" />
              <div className="text-slate-300">
                <span className="font-semibold text-slate-200">Healora Medical Center</span>
                <p className="text-xs text-slate-400 mt-1">1840 Parkside Blvd, Suite 400<br />Los Angeles, CA 90017, USA</p>
              </div>
            </li>
          </ul>
        </div>

      </div>

      {/* Copyright & Social */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
        <p>© 2026 Healora. All Rights Reserved.</p>
        <div className="flex space-x-5">
          <a href="#" aria-label="Facebook" className="text-slate-500 hover:text-white transition-colors">
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.8c4.56-.93 8-4.96 8-9.8z"/></svg>
          </a>
          <a href="#" aria-label="Twitter" className="text-slate-500 hover:text-white transition-colors">
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
          </a>
          <a href="#" aria-label="Youtube" className="text-slate-500 hover:text-white transition-colors">
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.163a3.003 3.003 0 00-2.11-2.11C19.518 3.545 12 3.545 12 3.545s-7.518 0-9.388.507a3.003 3.003 0 00-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 002.11 2.11c1.87.507 9.388.507 9.388.507s7.518 0 9.388-.507a3.003 3.003 0 002.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
          </a>
        </div>
      </div>
    </footer>
  );
}
