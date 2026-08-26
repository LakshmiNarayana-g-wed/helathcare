 import { useState, useEffect } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, HeartPulse, Bell, User, LogOut, Sparkles } from "lucide-react";
import { getCurrentUser } from "../utils/sessionUser";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("healora.token");
    const currentUser = getCurrentUser();
    if (token && currentUser) {
      setIsLoggedIn(true);
      setUser(currentUser);
    } else {
      setIsLoggedIn(false);
      setUser(null);
    }
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("healora.currentUser");
    localStorage.removeItem("healora.token");
    setIsLoggedIn(false);
    setUser(null);
    navigate("/patient-login");
  };

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Doctors", path: "/doctors" },
    { name: "Patient Dashboard", path: isLoggedIn ? "/patients" : "/patient-login" },
    { name: "AI Assistant", path: "/ai-assistant", isAi: true },
    { name: "Medicines", path: "/medicines" },
    { name: "About Us", path: "/about" },
    { name: "Reports", path: "/reports" }
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-white/30 bg-white/70 shadow-sm backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-primary-700">
              <HeartPulse className="w-8 h-8 text-primary-600" />
              <span>Healora</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                className={({ isActive }) =>
                  `transition-colors font-medium text-sm flex items-center gap-1 ${
                    isActive ? "text-primary-600 border-b-2 border-primary-600 py-1" : "text-slate-600 hover:text-primary-600"
                  }`
                }
              >
                {link.isAi && <Sparkles className="w-4 h-4 text-purple-600 animate-pulse" />}
                <span>{link.name}</span>
                {link.isAi && <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-1.5 py-0.5 rounded-md">New</span>}
              </NavLink>
            ))}
          </div>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link 
              to={isLoggedIn ? "/patients" : "/patient-login"} 
              title={isLoggedIn ? "View Patient Dashboard" : "Patient dashboard login"} 
              className="p-2 text-slate-500 hover:text-primary-600 rounded-full hover:bg-slate-50 transition-all relative"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full"></span>
            </Link>
            
            {isLoggedIn ? (
              <div className="flex items-center gap-3 border-l border-slate-200 pl-3">
                <Link 
                  to="/patients" 
                  className="flex items-center gap-2 text-sm font-semibold text-teal-800 bg-teal-50 px-3 py-1.5 rounded-full border border-teal-100 hover:bg-teal-100 transition"
                >
                  <User className="w-4 h-4 text-teal-600" />
                  <span>{user?.name || "Dashboard"}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  title="Logout patient session"
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link to="/patient-login" className="text-sm font-semibold text-slate-700 transition hover:text-primary-700">Patient login</Link>
            )}

            <button 
              onClick={() => navigate("/doctors")}
              className="bg-rose-600 hover:bg-rose-700 text-white px-5 py-2.5 rounded-full font-medium text-sm transition-all shadow-md shadow-rose-600/10 hover:shadow-rose-600/20 active:scale-95"
            >
              Consult Online
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-slate-500 hover:text-primary-600 hover:bg-slate-100 focus:outline-none"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-slate-100 animate-fadeIn">
          <div className="px-2 pt-2 pb-4 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-md text-base font-medium ${
                    isActive ? "text-primary-600 bg-primary-50" : "text-slate-600 hover:text-primary-600 hover:bg-slate-50"
                  }`
                }
              >
                <div className="flex items-center gap-2">
                  {link.isAi && <Sparkles className="w-5 h-5 text-purple-600 animate-pulse" />}
                  <span>{link.name}</span>
                </div>
                {link.isAi && <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-2 py-0.5 rounded-md">New</span>}
              </NavLink>
            ))}
            <div className="pt-4 pb-2 border-t border-slate-100 flex flex-col gap-3 px-3">
              {isLoggedIn ? (
                <div className="flex justify-between items-center py-2">
                  <Link 
                    to="/patients" 
                    onClick={() => setIsOpen(false)} 
                    className="font-semibold text-teal-800 flex items-center gap-2"
                  >
                    <User className="w-4 h-4 text-teal-600" />
                    <span>{user?.name || "Patient Dashboard"}</span>
                  </Link>
                  <button 
                    onClick={() => {
                      setIsOpen(false);
                      handleLogout();
                    }}
                    className="text-xs font-bold text-rose-600 bg-rose-50 px-3 py-1 rounded-full"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Link to="/patient-login" onClick={() => setIsOpen(false)} className="py-2 font-semibold text-primary-700">Patient login</Link>
              )}
              <button 
                onClick={() => {
                  setIsOpen(false);
                  navigate("/doctors");
                }}
                className="w-full bg-rose-600 hover:bg-rose-700 text-white text-center py-3 rounded-full font-medium shadow-md shadow-rose-600/10"
              >
                Consult Online
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
