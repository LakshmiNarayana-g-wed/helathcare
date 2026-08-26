import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Heart, Activity, Calendar, FileText, Download, 
  Eye, Sparkles, Brain, Info, AlertTriangle, CheckCircle,
  MessageSquare, X, Send, Check, Trash, Plus, UserRound, ArrowRight,
  Pill, Gauge, Stethoscope, Bot, ShieldCheck, Bell, Clock,
  Mic, MicOff, Volume2, VolumeX
} from "lucide-react";
import { getCurrentUser } from "../utils/sessionUser";

export default function Patients() {
  const loggedInUser = getCurrentUser();
  const navigate = useNavigate();
  const [patient, setPatient] = useState({
    patient_id: "AN01",
    name: "Lakshmi",
    email: "lakshmi@healora.com",
    gender: "Female",
    age: 35,
    height: "168 cm",
    weight: "62 kg",
    bloodGroup: "A+"
  });

  // Coordination States
  const [appointments, setAppointments] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [investigations, setInvestigations] = useState([]);
  const [followups, setFollowups] = useState([]);
  const [orders, setOrders] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [medicationReminders, setMedicationReminders] = useState([]);
  const [counters, setCounters] = useState({
    appointments: 0,
    pending_referrals: 0,
    investigations: 0,
    overdue_followups: 0,
    missing_actions: 0,
    pharmacy_orders: 0
  });

  // AI Chat & Summary
  const [aiSummary, setAiSummary] = useState("");
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hello! I am your clinical AI Coordination Assistant. Ask me to 'generate summary', 'show appointments', 'track my medicine orders', or 'check alerts' to inspect patient coordination logs." }
  ]);

  // Voice Assistant States
  const [isVoiceAssistantActive, setIsVoiceAssistantActive] = useState(false);
  const [voiceStage, setVoiceStage] = useState("idle");
  const [voiceStatus, setVoiceStatus] = useState("Press button to start");
  const [voiceTextUser, setVoiceTextUser] = useState("");
  const [voiceTextAi, setVoiceTextAi] = useState("");
  const [voiceIsListening, setVoiceIsListening] = useState(false);
  const [voiceIsSpeaking, setVoiceIsSpeaking] = useState(false);
  const [voiceDoctorContextId, setVoiceDoctorContextId] = useState(null);
  const [voiceTriageDetails, setVoiceTriageDetails] = useState(null);
  const [voiceSpeechSupported, setVoiceSpeechSupported] = useState(false);

  // Form Inputs States
  const [newAppt, setNewAppt] = useState({ specialist: "", department: "", date: "", time: "", location: "" });
  const [newReferral, setNewReferral] = useState({ referring_department: "General Medicine", receiving_department: "", specialist: "", date: "" });
  const [newInv, setNewInv] = useState({ investigation_name: "", date: "" });
  const [newFollowUp, setNewFollowUp] = useState({ action: "", due_date: "", assigned_department: "" });
  const [newOrder, setNewOrder] = useState({ medicine_name: "", price: 0, date: "" });
  const [rescheduleData, setRescheduleData] = useState({ id: null, date: "", time: "" });

  const getLocalAppointments = () => {
    try {
      return JSON.parse(localStorage.getItem("healora_appointments") || "[]");
    } catch {
      return [];
    }
  };

  const saveLocalAppointments = (updatedList) => {
    try {
      localStorage.setItem("healora_appointments", JSON.stringify(updatedList));
      window.dispatchEvent(new Event("healora_appointment_booked"));
    } catch (err) {
      console.error("Error saving local appointments:", err);
    }
  };

  const refetchData = () => {
    const pId = patient.patient_id;
    const localAppts = getLocalAppointments();

    // 1. Fetch dashboard metrics & alerts
    fetch(`/patients/${pId}/alerts`)
      .then(res => res.json())
      .then(data => {
        if (data.alerts) setAlerts(data.alerts);
        if (data.counters) {
          setCounters(prev => ({
            ...data.counters,
            appointments: localAppts.filter(a => a.status !== "Cancelled" && a.status !== "Completed").length || data.counters.appointments
          }));
        }
      })
      .catch(err => console.log("Session active in local mode.", err));

    // 2. Fetch appointments & merge with local storage
    fetch(`/appointments?patient_id=${pId}`)
      .then(res => res.json())
      .then(data => {
        const apiAppts = Array.isArray(data) ? data : [];
        const mergedMap = new Map();
        localAppts.forEach(a => mergedMap.set(a.id, a));
        apiAppts.forEach(a => {
          if (!mergedMap.has(a.id)) {
            mergedMap.set(a.id, a);
          }
        });
        const combined = Array.from(mergedMap.values());
        setAppointments(combined);
        const activeCount = combined.filter(a => a.status !== "Cancelled" && a.status !== "Completed").length;
        setCounters(prev => ({ ...prev, appointments: activeCount }));
      })
      .catch(() => {
        // Fallback to local storage
        setAppointments(localAppts);
        const activeCount = localAppts.filter(a => a.status !== "Cancelled" && a.status !== "Completed").length;
        setCounters(prev => ({ ...prev, appointments: activeCount }));
      });

    // 3. Fetch referrals
    fetch(`/referrals?patient_id=${pId}`)
      .then(res => res.json())
      .then(data => setReferrals(Array.isArray(data) ? data : []))
      .catch(err => console.log("Local referrals fallback mode", err));

    // 4. Fetch investigations
    fetch(`/investigations?patient_id=${pId}`)
      .then(res => res.json())
      .then(data => setInvestigations(Array.isArray(data) ? data : []))
      .catch(err => console.log("Local investigations fallback mode", err));

    // 5. Fetch follow-ups
    fetch(`/followups?patient_id=${pId}`)
      .then(res => res.json())
      .then(data => setFollowups(Array.isArray(data) ? data : []))
      .catch(err => console.log("Local followups fallback mode", err));

    // 6. Fetch pharmacy orders
    fetch(`/orders?patient_id=${pId}`)
      .then(res => res.json())
      .then(data => setOrders(Array.isArray(data) ? data : []))
      .catch(err => console.log("Local orders fallback mode", err));

    // 7. Fetch timeline
    fetch(`/patients/${pId}/timeline`)
      .then(res => res.json())
      .then(data => setTimeline(Array.isArray(data) ? data : []))
      .catch(err => console.log("Local timeline fallback mode", err));
  };

  useEffect(() => {
    const token = localStorage.getItem("healora.token");
    if (!loggedInUser || !token) {
      navigate("/patient-login");
      return;
    }

    if (loggedInUser && loggedInUser.name) {
      setPatient(prev => ({
        ...prev,
        name: loggedInUser.name,
        email: loggedInUser.email || prev.email,
        gender: loggedInUser.gender || prev.gender,
        age: loggedInUser.age || prev.age,
        height: loggedInUser.height || prev.height,
        weight: loggedInUser.weight || prev.weight,
        bloodGroup: loggedInUser.bloodGroup || prev.bloodGroup
      }));
    }

    // Load patient dashboard metadata using current session token
    fetch("/api/patients/AN01/dashboard/", {
      headers: { "Authorization": `Bearer ${token}` }
    })
    .then(res => {
      if (res.status === 401 && token !== "mock-access-token-12345") {
        localStorage.removeItem("healora.token");
        localStorage.removeItem("healora.currentUser");
        navigate("/patient-login");
        return;
      }
      if (res.status === 401) return null;
      if (res.ok) return res.json();
    })
    .then(data => {
      if (data && data.success) {
        setPatient({
          patient_id: data.patient.patient_id,
          name: loggedInUser?.name || data.patient.name,
          email: loggedInUser?.email || data.patient.email,
          gender: loggedInUser?.gender || data.patient.gender,
          age: loggedInUser?.age || data.patient.age,
          height: loggedInUser?.height || "168 cm",
          weight: loggedInUser?.weight || "62 kg",
          bloodGroup: loggedInUser?.bloodGroup || "A+"
        });
      }
    })
    .catch(err => {
      console.log("Session active in local mode.", err);
    });
  }, [navigate]);

  useEffect(() => {
    const token = localStorage.getItem("healora.token");
    if (!token) return;
    fetch("/api/pharmacy/medication-reminders/", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.ok ? res.json() : [])
      .then((data) => setMedicationReminders(Array.isArray(data) ? data : data.results || []))
      .catch(() => setMedicationReminders([]));
  }, []);

  // Voice Assistant Hooks and Functions
  useEffect(() => {
    if (typeof window !== "undefined" && ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      setVoiceSpeechSupported(true);
    }
  }, []);

  const handleVoiceSpeak = (text, onComplete) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    
    // Stop any ongoing speech
    window.speechSynthesis.cancel();
    
    const cleanText = text.replace(/[*#`_-]/g, "");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    
    utterance.onstart = () => {
      setVoiceIsSpeaking(true);
      setVoiceStatus("Speaking...");
    };
    
    utterance.onend = () => {
      setVoiceIsSpeaking(false);
      setVoiceStatus("Ready");
      onComplete?.();
    };
    
    utterance.onerror = () => {
      setVoiceIsSpeaking(false);
      setVoiceStatus("Ready");
      onComplete?.();
    };
    
    window.speechSynthesis.speak(utterance);
  };

  const startVoiceIntake = () => {
    if (voiceIsSpeaking) {
      window.speechSynthesis.cancel();
      setVoiceIsSpeaking(false);
    }

    if (!voiceSpeechSupported) {
      setVoiceStatus("Voice input is not supported in this browser.");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setVoiceIsListening(true);
      setVoiceStatus("Listening... Describe your symptoms");
    };

    recognition.onresult = async (event) => {
      const transcript = event.results[0][0].transcript;
      setVoiceTextUser(transcript);
      setVoiceIsListening(false);
      setVoiceStatus("Thinking...");

      try {
        const token = localStorage.getItem("healora.token") || "mock-access-token-12345";
        const response = await fetch("/api/ai/voice-intake/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            message: transcript,
            patient_id: patient.patient_id,
            stage: voiceStage,
            context_doctor_id: voiceDoctorContextId
          })
        });

        if (response.ok) {
          const data = await response.json();
          setVoiceTextAi(data.reply);
          setVoiceStage(data.next_stage);
          setVoiceDoctorContextId(data.context_doctor_id || null);
          
          if (data.triage) {
            setVoiceTriageDetails(data.triage);
          } else if (data.booking_success) {
            setVoiceTriageDetails(null);
            refetchData(); // Refresh appointment list
          }

          // Speak back the response
          handleVoiceSpeak(data.voice_text, () => {
            // If confirm_booking stage, automatically prompt and listen again
            if (data.next_stage === "confirm_booking") {
              setTimeout(() => {
                startVoiceIntake();
              }, 400);
            }
          });
        } else {
          throw new Error("Voice API call failed");
        }
      } catch (err) {
        console.error(err);
        setVoiceStatus("Error processing. Please try again.");
      }
    };

    recognition.onerror = () => {
      setVoiceIsListening(false);
      setVoiceStatus("Ready (Didn't catch that)");
    };

    recognition.onend = () => {
      setVoiceIsListening(false);
    };

    recognition.start();
  };

  const activateVoiceAssistant = () => {
    setIsVoiceAssistantActive(true);
    setVoiceStage("idle");
    setVoiceDoctorContextId(null);
    setVoiceTriageDetails(null);
    setVoiceTextUser("");
    
    const greeting = "Hello, I am your Healora AI Voice Assistant. How are you feeling today? Please describe your symptoms or health concerns.";
    setVoiceTextAi(greeting);
    
    handleVoiceSpeak(greeting, () => {
      // Start listening after greeting completes
      startVoiceIntake();
    });
  };

  const deactivateVoiceAssistant = () => {
    setIsVoiceAssistantActive(false);
    window.speechSynthesis?.cancel();
    setVoiceIsSpeaking(false);
    setVoiceIsListening(false);
    setVoiceStatus("Press button to start");
  };

  // Sync appointments when booked anywhere across tabs or components
  useEffect(() => {
    const handleSync = () => refetchData();
    window.addEventListener("healora_appointment_booked", handleSync);
    window.addEventListener("storage", handleSync);
    return () => {
      window.removeEventListener("healora_appointment_booked", handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, []);

  // Trigger refetch once patient profile state is populated
  useEffect(() => {
    if (patient.patient_id) {
      refetchData();
    }
  }, [patient.patient_id]);

  // Logout Action
  const handleLogout = () => {
    localStorage.removeItem("healora.currentUser");
    localStorage.removeItem("healora.token");
    navigate("/patient-login");
  };

  // Appointment Actions with LocalStorage Persistence
  const handleScheduleAppt = (e) => {
    e.preventDefault();
    const newRecord = {
      id: "APT-" + Math.floor(100000 + Math.random() * 900000),
      patient_id: patient.patient_id,
      patient_name: patient.name || "Lakshmi",
      specialist: newAppt.specialist,
      department: newAppt.department,
      appointment_date: newAppt.date,
      time: newAppt.time,
      location: newAppt.location,
      status: "Scheduled"
    };

    const currentLocal = getLocalAppointments();
    saveLocalAppointments([newRecord, ...currentLocal]);
    setNewAppt({ specialist: "", department: "", date: "", time: "", location: "" });

    fetch("/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newRecord)
    }).catch(err => console.log("Backend offline, saved locally.", err))
      .finally(() => refetchData());
  };

  const handleCancelAppt = (id) => {
    const currentLocal = getLocalAppointments();
    const updated = currentLocal.map(a => a.id === id ? { ...a, status: "Cancelled" } : a);
    saveLocalAppointments(updated);
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: "Cancelled" } : a));

    fetch(`/appointments/${id}/cancel`, { method: "POST" })
      .catch(err => console.log("Backend offline, updated locally.", err))
      .finally(() => refetchData());
  };

  const handleCompleteAppt = (id) => {
    const currentLocal = getLocalAppointments();
    const updated = currentLocal.map(a => a.id === id ? { ...a, status: "Completed" } : a);
    saveLocalAppointments(updated);
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: "Completed" } : a));

    fetch(`/appointments/${id}/complete`, { method: "POST" })
      .catch(err => console.log("Backend offline, updated locally.", err))
      .finally(() => refetchData());
  };

  const handleRescheduleAppt = (e) => {
    e.preventDefault();
    const currentLocal = getLocalAppointments();
    const updated = currentLocal.map(a => 
      a.id === rescheduleData.id ? { ...a, appointment_date: rescheduleData.date, time: rescheduleData.time } : a
    );
    saveLocalAppointments(updated);
    setAppointments(prev => prev.map(a => 
      a.id === rescheduleData.id ? { ...a, appointment_date: rescheduleData.date, time: rescheduleData.time } : a
    ));

    const targetId = rescheduleData.id;
    const targetDate = rescheduleData.date;
    const targetTime = rescheduleData.time;
    setRescheduleData({ id: null, date: "", time: "" });

    fetch(`/appointments/${targetId}/reschedule?new_date=${targetDate}&new_time=${targetTime}`, {
      method: "POST"
    }).catch(err => console.log("Backend offline, updated locally.", err))
      .finally(() => refetchData());
  };

  // Referral Actions
  const handleCreateReferral = (e) => {
    e.preventDefault();
    fetch("/referrals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patient_id: patient.patient_id,
        referring_department: newReferral.referring_department,
        receiving_department: newReferral.receiving_department,
        specialist: newReferral.specialist,
        referral_date: newReferral.date,
        status: "Pending"
      })
    })
    .then(() => {
      setNewReferral({ referring_department: "General Medicine", receiving_department: "", specialist: "", date: "" });
      refetchData();
    });
  };

  // Investigation Actions
  const handleCreateInvestigation = (e) => {
    e.preventDefault();
    fetch("/investigations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patient_id: patient.patient_id,
        investigation_name: newInv.investigation_name,
        ordered_date: newInv.date,
        status: "Ordered"
      })
    })
    .then(() => {
      setNewInv({ investigation_name: "", date: "" });
      refetchData();
    });
  };

  // Follow-Up Actions
  const handleCreateFollowUp = (e) => {
    e.preventDefault();
    fetch("/followups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patient_id: patient.patient_id,
        followup_action: newFollowUp.action,
        due_date: newFollowUp.due_date,
        assigned_department: newFollowUp.assigned_department,
        status: "Pending"
      })
    })
    .then(() => {
      setNewFollowUp({ action: "", due_date: "", assigned_department: "" });
      refetchData();
    });
  };

  // Pharmacy Order Actions
  const handleCreateOrder = (e) => {
    e.preventDefault();
    fetch("/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patient_id: patient.patient_id,
        medicine_name: newOrder.medicine_name,
        price: parseFloat(newOrder.price),
        order_date: newOrder.date,
        status: "Ordered"
      })
    })
    .then(() => {
      setNewOrder({ medicine_name: "", price: 0, date: "" });
      refetchData();
    });
  };

  // Generate AI Summary with intelligent fallback
  const handleGenerateSummary = () => {
    setIsGeneratingSummary(true);
    fetch(`/ai/coordination-summary/${patient.patient_id}`, { method: "POST" })
      .then(res => res.json())
      .then(data => {
        if (data && data.summary) {
          setAiSummary(data.summary);
        } else {
          throw new Error("No server summary");
        }
      })
      .catch(() => {
        const activeAppts = appointments.filter(a => a.status !== "Cancelled");
        const summaryText = `Clinical Summary for ${patient.name} (${patient.age}Y, ${patient.gender}):\n\n` +
          `• Active Consultations: ${activeAppts.length} scheduled doctor appointment(s).\n` +
          `• Pending Referrals: ${referrals.filter(r => r.status === "Pending").length} specialist referral(s) tracking.\n` +
          `• Lab Investigations: ${investigations.length} diagnostic test(s) ordered.\n` +
          `• Pharmacy Deliveries: ${orders.length} medication order(s) registered in portal.\n\n` +
          `Care Plan Notice: Adhere to scheduled appointment times and review follow-up reminders.`;
        setAiSummary(summaryText);
      })
      .finally(() => setIsGeneratingSummary(false));
  };

  // Helper function for intelligent client-side fallback chat
  const generateAiFallbackResponse = (userMsg) => {
    const text = userMsg.toLowerCase();
    
    if (text.includes("appointment") || text.includes("doctor") || text.includes("schedule") || text.includes("visit")) {
      const activeAppts = appointments.filter(a => a.status !== "Cancelled");
      if (activeAppts.length === 0) {
        return "You currently have no active upcoming appointments scheduled. You can book a consultation anytime on our Doctors page!";
      }
      const apptList = activeAppts.map(a => `• ${a.specialist} (${a.department}) on ${a.appointment_date} at ${a.time}`).join("\n");
      return `You have ${activeAppts.length} active appointment(s):\n${apptList}`;
    }

    if (text.includes("order") || text.includes("medicine") || text.includes("prescription") || text.includes("pharmacy")) {
      if (orders.length === 0) {
        return "You have no active pharmacy orders recorded. You can browse and purchase medicines in our Medicines section.";
      }
      const orderList = orders.map(o => `• ${o.medicine_name} (₹${o.price}) - Status: ${o.status}`).join("\n");
      return `Here are your recent pharmacy orders:\n${orderList}`;
    }

    if (text.includes("alert") || text.includes("warning") || text.includes("overdue")) {
      if (alerts.length === 0) {
        return "Great news! You have no outstanding care alerts or overdue compliance items.";
      }
      const alertList = alerts.map(a => `• ${a.title}: ${a.description}`).join("\n");
      return `Current Care Alerts:\n${alertList}`;
    }

    if (text.includes("summary") || text.includes("coordination") || text.includes("report")) {
      return `Patient Care Coordination Overview for ${patient.name}:\n• Scheduled Appointments: ${counters.appointments}\n• Pending Referrals: ${counters.pending_referrals}\n• Lab Investigations: ${counters.investigations}\n• Overdue Follow-ups: ${counters.overdue_followups}`;
    }

    if (text.includes("chest") || text.includes("fever") || text.includes("rash") || text.includes("pain") || text.includes("symptom")) {
      return "For comprehensive symptom triage and risk assessment, please visit our new AI Health Assistant tab! If you are experiencing acute chest discomfort or severe breathlessness, please seek emergency medical evaluation immediately.";
    }

    return `I am your Clinical AI Coordinator for ${patient.name}. I can help you track your ${appointments.length} appointment(s), check medicine orders, or review care alerts. How can I assist you further?`;
  };

  // Bot Chat Messenger
  const sendMessage = () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput.trim();
    setMessages(prev => [...prev, { sender: "user", text: userMsg }]);
    setChatInput("");
    setIsSending(true);

    fetch("/api/ai/chat/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message: userMsg, patient_id: patient.patient_id })
    })
    .then(res => res.json())
    .then(resData => {
      if (resData.success && resData.data) {
        setMessages(prev => [...prev, {
          sender: "bot",
          text: resData.data.message
        }]);
      } else {
        throw new Error("Invalid API response");
      }
    })
    .catch(() => {
      const fallbackReply = generateAiFallbackResponse(userMsg);
      setMessages(prev => [...prev, { sender: "bot", text: fallbackReply }]);
    })
    .finally(() => setIsSending(false));
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-16">
      
      {/* Dashboard Top Header */}
      <header className="bg-white border-b border-slate-100 py-6 sticky top-20 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Healthcare Coordination Dashboard</h1>
            <p className="text-xs text-slate-500">{patient.name} • {patient.gender} • {patient.age} years • {patient.height} • {patient.weight} • {patient.bloodGroup}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 border border-emerald-100">
              <CheckCircle className="w-3.5 h-3.5 fill-current" />
              <span>Multi-Agent Engine Active</span>
            </span>
            <button 
              onClick={handleLogout}
              className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-100 px-4 py-1.5 rounded-full text-xs font-bold transition cursor-pointer"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">

        {/* 🌟 AI CLINICAL INTELLIGENCE SUITE BANNER */}
        <section className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white p-6 sm:p-8 rounded-3xl border border-indigo-900/40 shadow-xl space-y-5">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full text-xs font-extrabold border border-indigo-400/30">
                <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                <span>Next-Gen AI Healthcare Engine</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white">AI Diagnostic & Clinical Safety Center</h2>
              <p className="text-xs sm:text-sm text-indigo-200/80 max-w-2xl">
                Real-time clinical triage, multi-drug contraindication safety analysis, biomarker lab interpretation, and ASCVD longevity risk scoring.
              </p>
            </div>

            <button
              onClick={() => navigate("/ai-assistant")}
              className="bg-primary-600 hover:bg-primary-500 text-white text-xs sm:text-sm font-bold px-5 py-3 rounded-2xl transition-all shadow-md flex items-center gap-2 cursor-pointer shrink-0"
            >
              <Bot className="w-4 h-4" />
              <span>Launch Full AI Assistant</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Launch Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <button
              onClick={() => navigate("/ai-assistant?tab=triage")}
              className="bg-white/10 hover:bg-white/15 border border-white/10 p-3.5 rounded-2xl text-left transition cursor-pointer group"
            >
              <Stethoscope className="w-5 h-5 text-indigo-400 mb-1.5 group-hover:scale-110 transition" />
              <span className="block font-extrabold text-xs text-white">Differential Triage</span>
              <span className="text-[10px] text-indigo-200 block">Symptom reasoning</span>
            </button>

            <button
              onClick={() => navigate("/ai-assistant?tab=drug-interactions")}
              className="bg-white/10 hover:bg-white/15 border border-white/10 p-3.5 rounded-2xl text-left transition cursor-pointer group"
            >
              <Pill className="w-5 h-5 text-rose-400 mb-1.5 group-hover:scale-110 transition" />
              <span className="block font-extrabold text-xs text-white">RxGuardian Safety</span>
              <span className="text-[10px] text-indigo-200 block">Drug-drug & foods</span>
            </button>

            <button
              onClick={() => navigate("/ai-assistant?tab=lab-interpreter")}
              className="bg-white/10 hover:bg-white/15 border border-white/10 p-3.5 rounded-2xl text-left transition cursor-pointer group"
            >
              <Activity className="w-5 h-5 text-teal-400 mb-1.5 group-hover:scale-110 transition" />
              <span className="block font-extrabold text-xs text-white">BioVision Labs</span>
              <span className="text-[10px] text-indigo-200 block">Biomarker evaluator</span>
            </button>

            <button
              onClick={() => navigate("/ai-assistant?tab=risk-calculator")}
              className="bg-white/10 hover:bg-white/15 border border-white/10 p-3.5 rounded-2xl text-left transition cursor-pointer group"
            >
              <Gauge className="w-5 h-5 text-amber-400 mb-1.5 group-hover:scale-110 transition" />
              <span className="block font-extrabold text-xs text-white">Longevity Risk</span>
              <span className="text-[10px] text-indigo-200 block">Heart age & ASCVD</span>
            </button>
          </div>
        </section>

        {/* METRICS COUNTERS CARD */}
        <section className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="font-bold text-slate-800 text-sm mb-4">Dashboard Coordination Counters</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-center">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <span className="block text-2xl font-extrabold text-blue-600">{counters.appointments}</span>
              <span className="mt-1 block text-[10px] font-bold text-slate-400 uppercase">Appointments</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <span className="block text-2xl font-extrabold text-amber-500">{counters.pending_referrals}</span>
              <span className="mt-1 block text-[10px] font-bold text-slate-400 uppercase">Pending Referrals</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <span className="block text-2xl font-extrabold text-cyan-600">{counters.investigations}</span>
              <span className="mt-1 block text-[10px] font-bold text-slate-400 uppercase">Investigations</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <span className="block text-2xl font-extrabold text-rose-600">{counters.overdue_followups}</span>
              <span className="mt-1 block text-[10px] font-bold text-slate-400 uppercase">Overdue Follow-ups</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <span className="block text-2xl font-extrabold text-indigo-600">{counters.missing_actions}</span>
              <span className="mt-1 block text-[10px] font-bold text-slate-400 uppercase">Missing Actions</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <span className="block text-2xl font-extrabold text-purple-600">{counters.pharmacy_orders}</span>
              <span className="mt-1 block text-[10px] font-bold text-slate-400 uppercase">Pharmacy Orders</span>
            </div>
          </div>
        </section>

        {/* GRID LAYOUT FOR CORE MODULES */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* LEFT 7 COLS: DATA ENTRIES & ACTIONS */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* 1. UPCOMING APPOINTMENTS */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
              <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                <h3 className="font-extrabold text-slate-800 text-md">Upcoming Appointments</h3>
                <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full uppercase">Appointment coordination</span>
              </div>

              {/* Appointment List Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 uppercase font-bold">
                      <th className="pb-3">Patient</th>
                      <th className="pb-3">Doctor</th>
                      <th className="pb-3">Department</th>
                      <th className="pb-3">Date / Time</th>
                      <th className="pb-3">Location</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map((appt) => (
                      <tr key={appt.id} className="border-b border-slate-5 hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 font-semibold text-slate-700">{appt.patient_name}</td>
                        <td className="py-3 font-semibold text-slate-800">{appt.specialist}</td>
                        <td className="py-3 text-slate-600">{appt.department}</td>
                        <td className="py-3 text-slate-600 font-medium">{appt.appointment_date} @ {appt.time}</td>
                        <td className="py-3 text-slate-550">{appt.location}</td>
                        <td className="py-3">
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                            appt.status === "Scheduled" ? "bg-blue-50 text-blue-600 border-blue-100" :
                            appt.status === "Completed" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                            appt.status === "Cancelled" ? "bg-rose-50 text-rose-600 border-rose-100" :
                            "bg-amber-50 text-amber-600 border-amber-100"
                          }`}>
                            {appt.status}
                          </span>
                        </td>
                        <td className="py-3 text-right space-x-1.5 whitespace-nowrap">
                          {appt.status !== "Cancelled" && appt.status !== "Completed" && (
                            <>
                              <button 
                                onClick={() => handleCompleteAppt(appt.id)}
                                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 p-1.5 rounded-lg transition"
                                title="Mark Completed"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                onClick={() => setRescheduleData({ id: appt.id, date: appt.appointment_date, time: appt.time })}
                                className="bg-amber-50 hover:bg-amber-100 text-amber-700 px-2 py-1 rounded-lg text-[10px] font-bold transition"
                              >
                                Reschedule
                              </button>
                              <button 
                                onClick={() => handleCancelAppt(appt.id)}
                                className="bg-rose-50 hover:bg-rose-100 text-rose-700 p-1.5 rounded-lg transition"
                                title="Cancel Appointment"
                              >
                                <Trash className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                    {appointments.length === 0 && (
                      <tr>
                        <td colSpan="7" className="text-center py-6 text-slate-400">No appointments scheduled.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Inline Reschedule Dialog */}
              {rescheduleData.id && (
                <form onSubmit={handleRescheduleAppt} className="bg-amber-50/50 p-4 rounded-2xl border border-amber-100 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-amber-800">Reschedule Appointment (ID: {rescheduleData.id})</span>
                    <button type="button" onClick={() => setRescheduleData({ id: null, date: "", time: "" })} className="text-slate-400 hover:text-slate-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input 
                      required
                      type="date" 
                      value={rescheduleData.date} 
                      onChange={(e) => setRescheduleData({ ...rescheduleData, date: e.target.value })}
                      className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-amber-500"
                    />
                    <input 
                      required
                      type="time" 
                      value={rescheduleData.time} 
                      onChange={(e) => setRescheduleData({ ...rescheduleData, time: e.target.value })}
                      className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-amber-500"
                    />
                  </div>
                  <button type="submit" className="w-full bg-amber-600 hover:bg-amber-700 text-white rounded-xl py-2 text-xs font-bold transition">
                    Save New Schedule
                  </button>
                </form>
              )}

              {/* Create Appointment Form */}
              <form onSubmit={handleScheduleAppt} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
                <span className="text-xs font-bold text-slate-700 block">Schedule a New Appointment</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <input 
                    required
                    placeholder="Doctor Name" 
                    value={newAppt.specialist}
                    onChange={(e) => setNewAppt({ ...newAppt, specialist: e.target.value })}
                    className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-primary-600"
                  />
                  <input 
                    required
                    placeholder="Department" 
                    value={newAppt.department}
                    onChange={(e) => setNewAppt({ ...newAppt, department: e.target.value })}
                    className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-primary-600"
                  />
                  <input 
                    required
                    type="date" 
                    value={newAppt.date}
                    onChange={(e) => setNewAppt({ ...newAppt, date: e.target.value })}
                    className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-primary-600"
                  />
                  <input 
                    required
                    type="time" 
                    value={newAppt.time}
                    onChange={(e) => setNewAppt({ ...newAppt, time: e.target.value })}
                    className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-primary-600"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-center">
                  <input 
                    required
                    placeholder="Location / Room" 
                    value={newAppt.location}
                    onChange={(e) => setNewAppt({ ...newAppt, location: e.target.value })}
                    className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-primary-600 sm:col-span-3"
                  />
                  <button type="submit" className="bg-primary-700 hover:bg-primary-800 text-white rounded-xl py-2 px-4 text-xs font-bold transition flex items-center justify-center gap-1">
                    <Plus className="w-3.5 h-3.5" /> Schedule
                  </button>
                </div>
              </form>
            </div>

            {/* 2. REFERRAL TRACKING */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
              <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                <h3 className="font-extrabold text-slate-800 text-md">Referral Tracking</h3>
                <span className="text-[10px] font-bold bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full uppercase">Specialist routing</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 uppercase font-bold">
                      <th className="pb-3">Referral ID</th>
                      <th className="pb-3">Referring Dept</th>
                      <th className="pb-3">Receiving Dept</th>
                      <th className="pb-3">Specialist</th>
                      <th className="pb-3">Referral Date</th>
                      <th className="pb-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {referrals.map((ref) => (
                      <tr key={ref.id} className="border-b border-slate-5 hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 font-semibold text-slate-700">{ref.referral_id}</td>
                        <td className="py-3 text-slate-600">{ref.referring_department}</td>
                        <td className="py-3 text-slate-800 font-bold">{ref.receiving_department}</td>
                        <td className="py-3 text-slate-600 font-semibold">{ref.specialist}</td>
                        <td className="py-3 text-slate-550">{ref.referral_date}</td>
                        <td className="py-3">
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                            ref.status === "Pending" ? "bg-amber-50 text-amber-600 border-amber-100 animate-pulse" :
                            ref.status === "Scheduled" ? "bg-blue-50 text-blue-600 border-blue-100" :
                            ref.status === "Completed" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                            "bg-rose-50 text-rose-600 border-rose-100"
                          }`}>
                            {ref.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {referrals.length === 0 && (
                      <tr>
                        <td colSpan="6" className="text-center py-6 text-slate-400">No referrals found in files.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Create Referral Form */}
              <form onSubmit={handleCreateReferral} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
                <span className="text-xs font-bold text-slate-700 block">Create specialist Referral</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <input 
                    required
                    placeholder="Referring Dept" 
                    value={newReferral.referring_department}
                    onChange={(e) => setNewReferral({ ...newReferral, referring_department: e.target.value })}
                    className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-primary-600"
                  />
                  <input 
                    required
                    placeholder="Receiving Dept" 
                    value={newReferral.receiving_department}
                    onChange={(e) => setNewReferral({ ...newReferral, receiving_department: e.target.value })}
                    className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-primary-600"
                  />
                  <input 
                    required
                    placeholder="Specialist Doctor" 
                    value={newReferral.specialist}
                    onChange={(e) => setNewReferral({ ...newReferral, specialist: e.target.value })}
                    className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-primary-600"
                  />
                  <input 
                    required
                    type="date" 
                    value={newReferral.date}
                    onChange={(e) => setNewReferral({ ...newReferral, date: e.target.value })}
                    className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-primary-600"
                  />
                </div>
                <button type="submit" className="w-full bg-primary-700 hover:bg-primary-800 text-white rounded-xl py-2 text-xs font-bold transition flex items-center justify-center gap-1">
                  <Plus className="w-3.5 h-3.5" /> Create Referral Record
                </button>
              </form>
            </div>

            {/* 3. INVESTIGATION & FOLLOW-UP MONITORING */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
              <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                <h3 className="font-extrabold text-slate-800 text-md">Investigation & Follow-Up</h3>
                <span className="text-[10px] font-bold bg-cyan-50 text-cyan-700 px-2 py-0.5 rounded-full uppercase">Lab & Diagnostics tracking</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Investigations List */}
                <div className="space-y-4">
                  <span className="text-xs font-bold text-slate-500 block uppercase tracking-wider">Diagnostic Investigations</span>
                  <div className="space-y-2">
                    {investigations.map((inv) => (
                      <div key={inv.id} className="p-3 border border-slate-100 rounded-xl flex justify-between items-center bg-slate-50/50">
                        <div>
                          <p className="font-bold text-xs text-slate-700">{inv.investigation_name}</p>
                          <p className="text-[10px] text-slate-400 font-medium">Ordered: {inv.ordered_date}</p>
                        </div>
                        <span className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase border ${
                          inv.status === "Completed" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                          "bg-cyan-50 text-cyan-600 border-cyan-100"
                        }`}>
                          {inv.status}
                        </span>
                      </div>
                    ))}
                    {investigations.length === 0 && <p className="text-xs text-slate-400 text-center py-4">No investigations ordered.</p>}
                  </div>

                  {/* Create Investigation Form */}
                  <form onSubmit={handleCreateInvestigation} className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-2">
                    <input 
                      required
                      placeholder="Test Name (e.g. ECG)" 
                      value={newInv.investigation_name}
                      onChange={(e) => setNewInv({ ...newInv, investigation_name: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-primary-600"
                    />
                    <div className="flex gap-2">
                      <input 
                        required
                        type="date" 
                        value={newInv.date}
                        onChange={(e) => setNewInv({ ...newInv, date: e.target.value })}
                        className="flex-grow bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-primary-600"
                      />
                      <button type="submit" className="bg-primary-700 hover:bg-primary-800 text-white rounded-lg px-3 py-1.5 text-xs font-bold transition">
                        Order
                      </button>
                    </div>
                  </form>
                </div>

                {/* Follow-Ups List */}
                <div className="space-y-4">
                  <span className="text-xs font-bold text-slate-500 block uppercase tracking-wider">Clinical Follow-Ups</span>
                  <div className="space-y-2">
                    {followups.map((f) => (
                      <div key={f.id} className="p-3 border border-slate-100 rounded-xl flex justify-between items-center bg-slate-50/50">
                        <div>
                          <p className="font-bold text-xs text-slate-700">{f.followup_action}</p>
                          <p className="text-[10px] text-slate-400 font-medium">Due: {f.due_date} ({f.assigned_department})</p>
                        </div>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                          f.status === "Completed" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                          f.status === "Overdue" || (f.due_date < "2026-08-21" && f.status === "Pending") ? "bg-rose-50 text-rose-600 border-rose-100" :
                          "bg-amber-50 text-amber-600 border-amber-100"
                        }`}>
                          {f.due_date < "2026-08-21" && f.status === "Pending" ? "Overdue" : f.status}
                        </span>
                      </div>
                    ))}
                    {followups.length === 0 && <p className="text-xs text-slate-400 text-center py-4">No follow-up records found.</p>}
                  </div>

                  {/* Create Follow-Up Form */}
                  <form onSubmit={handleCreateFollowUp} className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-2">
                    <input 
                      required
                      placeholder="Follow-Up Action (e.g. Review ECG)" 
                      value={newFollowUp.action}
                      onChange={(e) => setNewFollowUp({ ...newFollowUp, action: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-primary-600"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input 
                        required
                        type="date" 
                        value={newFollowUp.due_date}
                        onChange={(e) => setNewFollowUp({ ...newFollowUp, due_date: e.target.value })}
                        className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-primary-600"
                      />
                      <input 
                        required
                        placeholder="Department" 
                        value={newFollowUp.assigned_department}
                        onChange={(e) => setNewFollowUp({ ...newFollowUp, assigned_department: e.target.value })}
                        className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-primary-600"
                      />
                    </div>
                    <button type="submit" className="w-full bg-primary-700 hover:bg-primary-800 text-white rounded-lg py-1.5 text-xs font-bold transition">
                      Schedule Follow-Up
                    </button>
                  </form>
                </div>

              </div>
            </div>

            {/* 4. PHARMACY ORDERS */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
              <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                <h3 className="font-extrabold text-slate-800 text-md">Pharmacy Medication Orders</h3>
                <span className="text-[10px] font-bold bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full uppercase">Medication deliveries</span>
              </div>

              {/* Orders Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 uppercase font-bold">
                      <th className="pb-3">Order ID</th>
                      <th className="pb-3">Medicine Name</th>
                      <th className="pb-3">Price</th>
                      <th className="pb-3">Order Date</th>
                      <th className="pb-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr key={o.id} className="border-b border-slate-5 hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 font-semibold text-slate-700">{o.order_id}</td>
                        <td className="py-3 font-semibold text-slate-850">{o.medicine_name}</td>
                        <td className="py-3 text-slate-600">₹{o.price}</td>
                        <td className="py-3 text-slate-550">{o.order_date}</td>
                        <td className="py-3">
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                            o.status === "Delivered" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                            o.status === "Dispatched" ? "bg-blue-50 text-blue-600 border-blue-100" :
                            "bg-amber-50 text-amber-600 border-amber-100"
                          }`}>
                            {o.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {orders.length === 0 && (
                      <tr>
                        <td colSpan="5" className="text-center py-6 text-slate-400">No pharmacy orders found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Create Order Form */}
              <form onSubmit={handleCreateOrder} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
                <span className="text-xs font-bold text-slate-700 block">Place new Pharmacy Order</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <input 
                    required
                    placeholder="Medicine Name" 
                    value={newOrder.medicine_name}
                    onChange={(e) => setNewOrder({ ...newOrder, medicine_name: e.target.value })}
                    className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-primary-600"
                  />
                  <input 
                    required
                    type="number"
                    placeholder="Price (₹)" 
                    value={newOrder.price || ""}
                    onChange={(e) => setNewOrder({ ...newOrder, price: e.target.value })}
                    className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-primary-600"
                  />
                  <input 
                    required
                    type="date" 
                    value={newOrder.date}
                    onChange={(e) => setNewOrder({ ...newOrder, date: e.target.value })}
                    className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-primary-600"
                  />
                </div>
                <button type="submit" className="w-full bg-primary-700 hover:bg-primary-800 text-white rounded-xl py-2 text-xs font-bold transition flex items-center justify-center gap-1">
                  <Plus className="w-3.5 h-3.5" /> Order Medication
                </button>
              </form>
            </div>

          </div>

          {/* RIGHT 5 COLS: ALERTS, TIMELINE, AI GENERATOR */}
          <div className="lg:col-span-4 space-y-8">

            {/* 🎙️ AI VOICE INTAKE ASSISTANT */}
            <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-blue-950 text-white p-6 rounded-3xl border border-indigo-900/40 shadow-xl space-y-5 relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent pointer-events-none" />
              
              <div className="flex justify-between items-center border-b border-indigo-900/50 pb-3 relative z-10">
                <div className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-indigo-400" />
                  <h3 className="font-extrabold text-white text-sm">AI Voice Care Assistant</h3>
                </div>
                <span className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase border ${
                  isVoiceAssistantActive ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30 animate-pulse" : "bg-slate-800 text-slate-400 border-slate-700"
                }`}>
                  {isVoiceAssistantActive ? "Active" : "Offline"}
                </span>
              </div>

              {!isVoiceAssistantActive ? (
                <div className="text-center py-4 space-y-4 relative z-10">
                  <p className="text-xs text-indigo-200/80 leading-relaxed">
                    Talk directly to our care companion to describe your symptoms, get triaged, and schedule a specialist consultation instantly.
                  </p>
                  <button
                    onClick={activateVoiceAssistant}
                    className="w-full bg-primary-600 hover:bg-primary-500 text-white font-bold py-3 rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow-md shadow-primary-600/20 cursor-pointer"
                  >
                    <Mic className="w-4 h-4" />
                    <span>Start Voice Assistant</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4 relative z-10 animate-fadeIn">
                  
                  {/* Status Indicator & Waveform effect */}
                  <div className="flex items-center justify-between bg-white/5 border border-white/5 p-3 rounded-2xl">
                    <div className="flex items-center gap-2">
                      <div className="relative flex h-3 w-3 shrink-0">
                        {voiceIsListening && (
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                        )}
                        <span className={`relative inline-flex rounded-full h-3 w-3 ${voiceIsListening ? "bg-rose-500" : voiceIsSpeaking ? "bg-indigo-500 animate-pulse" : "bg-slate-500"}`}></span>
                      </div>
                      <span className="text-[11px] font-semibold text-indigo-200">{voiceStatus}</span>
                    </div>

                    <div className="flex gap-1.5">
                      <button
                        onClick={startVoiceIntake}
                        disabled={voiceIsListening || voiceIsSpeaking}
                        className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition disabled:opacity-40 disabled:cursor-not-allowed"
                        title="Speak again"
                      >
                        <Mic className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={deactivateVoiceAssistant}
                        className="px-2.5 py-1 rounded-lg bg-rose-600/30 hover:bg-rose-600/50 border border-rose-500/20 text-rose-300 text-[10px] font-bold transition cursor-pointer"
                      >
                        Stop
                      </button>
                    </div>
                  </div>

                  {/* Speech Bubble: User */}
                  {voiceTextUser && (
                    <div className="bg-white/5 border border-white/5 p-3 rounded-2xl space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">You Said:</span>
                      <p className="text-xs text-indigo-100 italic leading-relaxed">"{voiceTextUser}"</p>
                    </div>
                  )}

                  {/* Speech Bubble: AI */}
                  {voiceTextAi && (
                    <div className="bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-2xl space-y-2">
                      <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">Assistant:</span>
                      <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">{voiceTextAi}</p>
                    </div>
                  )}

                  {/* Triage details dropdown helper */}
                  {voiceTriageDetails && (
                    <div className="bg-slate-900 border border-indigo-950 p-3 rounded-2xl text-[10px] space-y-1.5 animate-fadeIn text-slate-300">
                      <div className="flex justify-between items-center text-indigo-300 font-bold uppercase tracking-wider">
                        <span>Clinical Triage Findings</span>
                        <span className="text-amber-300">{voiceTriageDetails.confidence_score} Conf.</span>
                      </div>
                      <p><strong className="text-white">Condition:</strong> {voiceTriageDetails.primary_condition}</p>
                      <p><strong className="text-white">Route:</strong> {voiceTriageDetails.specialist} - {voiceTriageDetails.recommended_doctor.name}</p>
                      <p><strong className="text-white">Urgency:</strong> {voiceTriageDetails.urgency_label}</p>
                    </div>
                  )}

                </div>
              )}
            </div>

            {/* Medication SMS reminder summary */}
            <div className="bg-white p-6 rounded-3xl border border-primary-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                <div className="flex items-center gap-2"><Bell className="h-4 w-4 text-primary-700" /><h3 className="font-extrabold text-slate-800 text-sm">Medicine SMS reminders</h3></div>
                <span className="text-[10px] font-bold bg-primary-50 text-primary-700 px-2 py-0.5 rounded-full uppercase">IST</span>
              </div>
              {medicationReminders.length ? (
                <div className="space-y-2.5">
                  {medicationReminders.filter((item) => item.is_active).slice(0, 3).map((reminder) => (
                    <div key={reminder.id} className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
                      <div className="rounded-xl bg-white p-2 text-primary-700"><Clock className="h-4 w-4" /></div>
                      <div className="min-w-0"><p className="truncate text-xs font-bold text-slate-800">{reminder.prescription_details?.medicine_details?.name || "Medicine reminder"}</p><p className="text-[10px] font-medium text-slate-500">{reminder.period.toLowerCase()} · {reminder.scheduled_time?.slice(0, 5)}</p></div>
                    </div>
                  ))}
                </div>
              ) : <p className="rounded-2xl bg-slate-50 p-3 text-xs leading-5 text-slate-500">No medicine reminders are active. Set a time and receive a “Take your medicine” SMS.</p>}
              <button onClick={() => navigate("/medicines")} className="w-full rounded-xl bg-primary-700 py-2.5 text-xs font-bold text-white transition hover:bg-primary-800">{medicationReminders.length ? "Manage reminders" : "Set medicine reminder"}</button>
            </div>
            
            {/* 4. OVERDUE ACTIONS / ALERTS */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                <h3 className="font-extrabold text-slate-800 text-sm">Overdue Actions & Alerts</h3>
                <span className="text-[10px] font-bold bg-rose-50 text-rose-700 px-2 py-0.5 rounded-full uppercase">Detection Engine</span>
              </div>
              <div className="space-y-3">
                {alerts.map((al, idx) => (
                  <div key={idx} className={`p-3 rounded-2xl border flex gap-3 ${
                    al.color === "Red" ? "bg-rose-50/50 border-rose-100 text-rose-800" :
                    al.color === "Orange" ? "bg-amber-50/50 border-amber-100 text-amber-800" :
                    al.color === "Green" ? "bg-emerald-50/50 border-emerald-100 text-emerald-800" :
                    "bg-blue-50/50 border-blue-100 text-blue-800"
                  }`}>
                    <AlertTriangle className="w-5 h-5 shrink-0" />
                    <div className="text-left text-xs">
                      <p className="font-bold">{al.title}</p>
                      <p className="text-[10px] font-medium mt-1 leading-normal opacity-90">{al.description}</p>
                    </div>
                  </div>
                ))}
                {alerts.length === 0 && (
                  <div className="text-center py-6 text-slate-400 text-xs flex flex-col items-center gap-2">
                    <CheckCircle className="w-8 h-8 text-emerald-500" />
                    <p>No outstanding care alerts. Patient compliance clean.</p>
                  </div>
                )}
              </div>
            </div>

            {/* 5. PATIENT JOURNEY TIMELINE */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                <h3 className="font-extrabold text-slate-800 text-sm">Patient Journey Timeline</h3>
                <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full uppercase">Chronological</span>
              </div>
              
              <div className="relative border-l border-slate-100 pl-4 ml-2 space-y-6 max-h-72 overflow-y-auto py-2">
                {timeline.map((ev, idx) => (
                  <div key={idx} className="relative text-left text-xs">
                    {/* Circle icon */}
                    <span className="absolute -left-[22px] top-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-indigo-600 shadow-sm" />
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{ev.date}</p>
                    <p className="font-bold text-slate-800 mt-0.5">{ev.title}</p>
                    <p className="text-[9px] font-semibold text-indigo-500 mt-0.5">Type: {ev.type}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 6. AI COORDINATION SUMMARY */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                <h3 className="font-extrabold text-slate-800 text-sm">AI Coordination Summary</h3>
                <span className="text-[10px] font-bold bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full uppercase">Grounded context</span>
              </div>
              
              {aiSummary ? (
                <div className="bg-purple-50/50 border border-purple-100 p-4 rounded-2xl text-left text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
                  {aiSummary}
                </div>
              ) : (
                <p className="text-xs text-slate-400 text-center py-4">No summary generated yet. Click compile summary below.</p>
              )}

              <button
                disabled={isGeneratingSummary}
                onClick={handleGenerateSummary}
                className="w-full bg-purple-700 hover:bg-purple-800 text-white rounded-xl py-3 text-xs font-bold transition flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isGeneratingSummary ? "Compiling grounded summary..." : "Generate AI Coordination Summary"}</span>
              </button>
            </div>

          </div>

        </section>

      </main>

      {/* FLOATING CHAT ASSISTANT BUBBLE */}
      <button 
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="fixed bottom-6 right-6 z-50 rounded-full flex h-14 w-14 items-center justify-center bg-primary-700 hover:bg-primary-800 text-white shadow-2xl cursor-pointer transition-transform hover:scale-105"
      >
        {isChatOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </button>

      {/* FLOATING CHAT DRAWER */}
      {isChatOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[500px] z-50 rounded-2xl border border-slate-100 bg-white shadow-2xl flex flex-col overflow-hidden animate-fadeIn">
          {/* Header */}
          <div className="bg-primary-700 p-4 text-white flex justify-between items-center shrink-0">
            <div>
              <h3 className="font-bold text-sm">Clinical AI Coordinator</h3>
              <p className="text-[10px] text-primary-200">Prototype Health Space</p>
            </div>
            <button onClick={() => setIsChatOpen(false)} className="text-white/80 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages list */}
          <div className="flex-grow p-4 overflow-y-auto space-y-4 bg-slate-50/50">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-xs ${
                  m.sender === "user" 
                    ? "bg-primary-600 text-white rounded-tr-none" 
                    : "bg-white text-slate-700 border border-slate-100 rounded-tl-none"
                }`}>
                  <p className="whitespace-pre-wrap">{m.text}</p>
                </div>
              </div>
            ))}
            {isSending && (
              <div className="flex items-center gap-2 text-slate-400 text-[10px] font-semibold pl-2">
                <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce" />
                <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                <span>AI Agent coordinating...</span>
              </div>
            )}
          </div>

          {/* Footer Input */}
          <form 
            onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
            className="p-3 border-t border-slate-100 bg-white flex gap-2 shrink-0 items-center"
          >
            <input
              required
              disabled={isSending}
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask about appointments, tests, orders..."
              className="flex-grow rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2 text-xs outline-none transition focus:border-primary-600 focus:bg-white"
            />
            <button 
              disabled={isSending}
              type="submit"
              className="h-9 w-9 rounded-xl bg-primary-700 hover:bg-primary-800 text-white flex items-center justify-center transition disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

    </div>
  );
}
