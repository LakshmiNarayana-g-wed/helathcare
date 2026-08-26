import { BrowserRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom";
import { LockKeyhole, ShieldCheck } from "lucide-react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Doctors from "./pages/Doctors";
import Patients from "./pages/Patients";
import Medicines from "./pages/Medicines";
import AboutUs from "./pages/AboutUs";
import Reports from "./pages/Reports";
import PatientLogin from "./pages/PatientLogin";
import AiAssistant from "./pages/AiAssistant";
import ScrollToTop from "./components/ScrollToTop";
import { getCurrentUser } from "./utils/sessionUser";

function PatientProtectedRoute({ children }) {
  const hasPatientSession = Boolean(localStorage.getItem("healora.token") && getCurrentUser());

  if (hasPatientSession) return children;

  return (
    <main className="flex min-h-[calc(100vh-5rem)] items-center justify-center bg-slate-50 px-4 py-16">
      <section className="w-full max-w-md rounded-3xl border border-slate-100 bg-white p-8 text-center shadow-xl shadow-slate-200/60 sm:p-10">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50 text-primary-700">
          <LockKeyhole className="h-8 w-8" />
        </div>
        <h1 className="mt-6 text-2xl font-extrabold text-slate-900">Please login</h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">You need to sign in to your patient account before opening this section.</p>
        <Link to="/patient-login" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-primary-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-primary-800">
          <ShieldCheck className="h-4 w-4" /> Patient login
        </Link>
      </section>
    </main>
  );
}

function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="flex flex-col min-h-screen bg-slate-50">
        <Navbar />
        <div className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/doctors" element={<PatientProtectedRoute><Doctors /></PatientProtectedRoute>} />
            <Route path="/patients" element={<PatientProtectedRoute><Patients /></PatientProtectedRoute>} />
            <Route path="/medicines" element={<PatientProtectedRoute><Medicines /></PatientProtectedRoute>} />
            <Route path="/ai-assistant" element={<PatientProtectedRoute><AiAssistant /></PatientProtectedRoute>} />
            <Route path="/about" element={<PatientProtectedRoute><AboutUs /></PatientProtectedRoute>} />
            <Route path="/reports" element={<PatientProtectedRoute><Reports /></PatientProtectedRoute>} />
            <Route path="/login" element={<Navigate to="/patient-login" replace />} />
            <Route path="/patient-login" element={<PatientLogin />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
