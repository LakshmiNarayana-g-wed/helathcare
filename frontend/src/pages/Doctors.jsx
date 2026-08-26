import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, MapPin, Star, Calendar, Clock, Video, UserCheck, ShieldCheck, CheckCircle2, ChevronRight, X, User } from "lucide-react";
import { doctors } from "../data/doctors";
import { getCurrentUser } from "../utils/sessionUser";

export default function Doctors() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Search & Filter state variables
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [maxFee, setMaxFee] = useState(1500);
  const [selectedExperience, setSelectedExperience] = useState("");

  // Booking & Profile states
  const [activeDoctor, setActiveDoctor] = useState(doctors[0]);
  const [bookingDate, setBookingDate] = useState("2026-08-28");
  const [bookingTime, setBookingTime] = useState("");
  const [consultationType, setConsultationType] = useState("Online");
  const [patientName, setPatientName] = useState("");
  const [patientAge, setPatientAge] = useState("35");
  const [patientGender, setPatientGender] = useState("Male");
  const [patientIssue, setPatientIssue] = useState("");
  
  // Booking success confirmation state
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [bookingDetails, setBookingDetails] = useState(null);

  // Mobile modals
  const [showMobileProfile, setShowMobileProfile] = useState(false);
  const [showMobileBooking, setShowMobileBooking] = useState(false);

  // Auto populate patient name if logged in
  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.name) {
      setPatientName(currentUser.name);
    }
  }, []);

  // Handle pre-filled query parameters from Home search bar
  useEffect(() => {
    const specialtyParam = searchParams.get("specialty");
    const locationParam = searchParams.get("location");
    const docIdParam = searchParams.get("profile");

    if (specialtyParam) setSelectedSpecialty(specialtyParam);
    if (locationParam) setSelectedLocation(locationParam);
    if (docIdParam) {
      const doc = doctors.find(d => d.id === docIdParam);
      if (doc) setActiveDoctor(doc);
    }
  }, [searchParams]);

  // Filtered Doctors list
  const filteredDoctors = doctors.filter((doc) => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          doc.specialty.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          doc.hospital.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty = selectedSpecialty ? doc.specialty === selectedSpecialty : true;
    const matchesLocation = selectedLocation ? doc.hospital.includes(selectedLocation) : true;
    const matchesFee = doc.fee <= maxFee;
    const matchesExp = selectedExperience ? (
      selectedExperience === "15+" ? doc.experience >= 15 :
      selectedExperience === "10+" ? doc.experience >= 10 :
      selectedExperience === "5+" ? doc.experience >= 5 : true
    ) : true;

    return matchesSearch && matchesSpecialty && matchesLocation && matchesFee && matchesExp;
  });

  // Handle Select Doctor
  const handleSelectDoctor = (doc) => {
    setActiveDoctor(doc);
    setBookingTime(""); // reset selected time slot when switching doctors
    setBookingConfirmed(false);
  };

  // Submit Booking
  const handleConfirmBooking = (e) => {
    e.preventDefault();
    if (!bookingTime) {
      alert("Please select an available appointment time slot.");
      return;
    }
    const receipt = {
      id: "APT-" + Math.floor(100000 + Math.random() * 900000),
      doctorName: activeDoctor.name,
      specialty: activeDoctor.specialty,
      image: activeDoctor.image,
      hospital: activeDoctor.hospital,
      date: bookingDate,
      time: bookingTime,
      type: consultationType,
      fee: activeDoctor.fee,
      patient: {
        name: patientName || "Patient",
        age: patientAge,
        gender: patientGender,
        issue: patientIssue || "Regular Health Consultation"
      }
    };

    // Formatted record for Patient Dashboard sync
    const newAppointmentRecord = {
      id: receipt.id,
      patient_id: "AN01",
      patient_name: patientName || "Lakshmi",
      specialist: activeDoctor.name,
      department: activeDoctor.specialty,
      appointment_date: bookingDate,
      time: bookingTime,
      location: `${activeDoctor.hospital} (${consultationType})`,
      status: "Scheduled",
      fee: activeDoctor.fee,
      issue: patientIssue || "Regular Health Consultation"
    };

    // Persist to localStorage for Patient Dashboard
    try {
      const existing = JSON.parse(localStorage.getItem("healora_appointments") || "[]");
      const updated = [newAppointmentRecord, ...existing];
      localStorage.setItem("healora_appointments", JSON.stringify(updated));
      window.dispatchEvent(new Event("healora_appointment_booked"));
    } catch (err) {
      console.error("Error saving appointment locally:", err);
    }

    setBookingDetails(receipt);
    setBookingConfirmed(true);
    setShowMobileBooking(false);
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      
      {/* Search Header Banner */}
      <section className="bg-gradient-to-r from-blue-900 to-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <h1 className="text-3xl sm:text-4xl font-extrabold">Find the Right Doctor for You</h1>
          <p className="text-primary-200 max-w-xl mx-auto text-sm sm:text-base">
            Search top specialists, schedule consultations, and get in-person or video diagnostic sessions instantly.
          </p>
        </div>
      </section>

      {/* Main Filter & Dashboard split screen */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT 7 COLS: DOCTOR LIST & FILTERS */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Filters Box */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
              
              {/* Search Bar */}
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Search doctor name, specialty or hospital..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 pl-11 pr-4 py-3 rounded-2xl text-sm focus:outline-none focus:border-primary-500 focus:bg-white transition-all"
                />
                <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
              </div>

              {/* Filters grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                
                {/* Specialty */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Specialty</label>
                  <select 
                    value={selectedSpecialty}
                    onChange={(e) => setSelectedSpecialty(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none"
                  >
                    <option value="">All Specialties</option>
                    <option value="Cardiology">Cardiology</option>
                    <option value="Dermatology">Dermatology</option>
                    <option value="Orthopedics">Orthopedics</option>
                    <option value="Neurology">Neurology</option>
                    <option value="Physiotherapy">Physiotherapy</option>
                    <option value="Pediatrics">Pediatrics</option>
                    <option value="ENT">ENT</option>
                  </select>
                </div>

                {/* Location */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Location</label>
                  <select 
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none"
                  >
                    <option value="">All Clinics</option>
                    <option value="Medical Center">Healora Center</option>
                    <option value="Skin Clinic">Skin Clinic</option>
                    <option value="Ortho">Ortho & Trauma</option>
                    <option value="Neuro">Neuro Institute</option>
                    <option value="Royal Hospital">Royal Hospital</option>
                  </select>
                </div>

                {/* Experience */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Experience</label>
                  <select 
                    value={selectedExperience}
                    onChange={(e) => setSelectedExperience(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none"
                  >
                    <option value="">Any Experience</option>
                    <option value="5+">5+ Years</option>
                    <option value="10+">10+ Years</option>
                    <option value="15+">15+ Years</option>
                  </select>
                </div>

                {/* Consultation Fee slider */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <span>Max Fee</span>
                    <span className="text-primary-700">₹{maxFee}</span>
                  </div>
                  <input 
                    type="range" 
                    min="400" 
                    max="1500" 
                    step="100"
                    value={maxFee}
                    onChange={(e) => setMaxFee(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-primary-700"
                  />
                </div>

              </div>

            </div>

            {/* Doctors Grid/List */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-800 px-1">
                Available Doctors ({filteredDoctors.length})
              </h2>

              {filteredDoctors.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 text-slate-500">
                  <User className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                  <p className="font-semibold text-base">No doctors found matching filters.</p>
                  <button 
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedSpecialty("");
                      setSelectedLocation("");
                      setSelectedExperience("");
                      setMaxFee(1500);
                    }}
                    className="text-primary-700 text-sm font-bold mt-2 hover:underline"
                  >
                    Clear Filters
                  </button>
                </div>
              ) : (
                filteredDoctors.map((doc) => (
                  <div 
                    key={doc.id}
                    onClick={() => handleSelectDoctor(doc)}
                    className={`bg-white p-5 rounded-3xl border cursor-pointer hover:shadow-md transition-all flex flex-col sm:flex-row gap-5 ${
                      activeDoctor.id === doc.id 
                        ? "border-primary-600 ring-2 ring-primary-100" 
                        : "border-slate-100 hover:border-slate-200"
                    }`}
                  >
                    {/* Doctor Photo */}
                    <img 
                      src={doc.image} 
                      alt={doc.name} 
                      className="w-full sm:w-28 h-28 object-cover rounded-2xl shrink-0 border border-slate-100 shadow-sm"
                    />

                    {/* Doctor Details */}
                    <div className="flex-1 space-y-3">
                      <div className="flex flex-wrap justify-between items-start gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-slate-800 text-base">{doc.name}</h3>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              doc.availability.includes("Today") 
                                ? "bg-emerald-50 text-emerald-600 border border-emerald-100" 
                                : "bg-primary-50 text-primary-600 border border-primary-100"
                            }`}>
                              {doc.availability}
                            </span>
                          </div>
                          <p className="text-xs text-primary-700 font-semibold mt-0.5">{doc.specialty} • {doc.qualification}</p>
                        </div>
                        <div className="flex items-center gap-1 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-lg text-amber-600 font-bold text-xs shrink-0">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span>{doc.rating}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-y-2 gap-x-4 text-xs text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{doc.experience}+ Years Exp</span>
                        </div>
                        <div className="flex items-center gap-1.5 col-span-1 md:col-span-2">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{doc.hospital}</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-50 flex justify-between items-center">
                        <div>
                          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Consultation Fee</p>
                          <p className="font-bold text-slate-800 text-sm">₹{doc.fee}</p>
                        </div>
                        
                        <div className="flex gap-2">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectDoctor(doc);
                              setShowMobileProfile(true);
                            }}
                            className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors md:hidden cursor-pointer"
                          >
                            Profile
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectDoctor(doc);
                              setShowMobileBooking(true);
                              const panel = document.getElementById("booking-engine-panel");
                              if (panel) {
                                panel.scrollIntoView({ behavior: 'smooth' });
                              }
                            }}
                            className="bg-primary-700 hover:bg-primary-800 text-white px-4 py-2 rounded-xl font-bold text-xs transition-all shadow-sm hover:shadow cursor-pointer active:scale-95"
                          >
                            Book Consultation
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}

            </div>

          </div>

          {/* RIGHT 5 COLS: DYNAMIC PROFILE & APPOINTMENT ENGINE */}
          <div id="booking-engine-panel" className="lg:col-span-5 sticky top-24 hidden lg:block">
            {bookingConfirmed ? (
              <BookingSuccessCard details={bookingDetails} onReset={() => setBookingConfirmed(false)} />
            ) : (
              <div className="bg-white rounded-3xl border border-slate-100 shadow-lg overflow-hidden flex flex-col h-[calc(100vh-140px)]">
                {/* Doctor Bio Header */}
                <div className="bg-slate-900 text-white p-6 relative">
                  <div className="flex gap-5">
                    <img 
                      src={activeDoctor.image} 
                      alt={activeDoctor.name} 
                      className="w-20 h-20 object-cover rounded-2xl border-2 border-slate-800 shadow-md"
                    />
                    <div className="space-y-1 mt-1">
                      <h3 className="font-bold text-lg text-white">{activeDoctor.name}</h3>
                      <p className="text-xs text-primary-400 font-semibold">{activeDoctor.qualification}</p>
                      <p className="text-[11px] text-slate-300 font-medium">{activeDoctor.hospital}</p>
                    </div>
                  </div>
                </div>

                {/* Scrollable details */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
                  
                  {/* Bio Description */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">About Doctor</h4>
                    <p className="text-slate-600 text-xs leading-relaxed">{activeDoctor.about}</p>
                  </div>

                  {/* Areas of Expertise */}
                  <div className="space-y-2.5">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Expertise</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {activeDoctor.expertise.map((exp, i) => (
                        <span key={i} className="bg-primary-50 text-primary-700 text-[10px] font-bold px-2.5 py-1 rounded-lg">
                          {exp}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Languages */}
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Languages</h4>
                    <p className="text-slate-700 text-xs font-semibold">{activeDoctor.languages.join(", ")}</p>
                  </div>

                  {/* Pricing / Consult details */}
                  <div className="grid grid-cols-2 gap-4 border-t border-b border-slate-50 py-4">
                    <div>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Consultation Fee</p>
                      <p className="font-extrabold text-slate-800 text-lg">₹{activeDoctor.fee}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Rating</p>
                      <div className="flex items-center gap-1 text-amber-500 font-extrabold mt-0.5">
                        <Star className="fill-current w-4 h-4" />
                        <span className="text-sm">{activeDoctor.rating}</span>
                        <span className="text-[10px] text-slate-400 font-medium">({activeDoctor.reviewsCount} reviews)</span>
                      </div>
                    </div>
                  </div>

                  {/* Interactive Booking Form */}
                  <form onSubmit={handleConfirmBooking} className="space-y-5">
                    <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-primary-600" />
                      <span>Book Appointment</span>
                    </h3>

                    {/* Consult Type */}
                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        type="button"
                        onClick={() => setConsultationType("Online")}
                        className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          consultationType === "Online"
                            ? "bg-primary-50 border-primary-600 text-primary-700 shadow-xs"
                            : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>Online Consultation</span>
                      </button>
                      <button 
                        type="button"
                        onClick={() => setConsultationType("In-person")}
                        className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          consultationType === "In-person"
                            ? "bg-primary-50 border-primary-600 text-primary-700 shadow-xs"
                            : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <MapPin className="w-3.5 h-3.5" />
                        <span>In-person Visit</span>
                      </button>
                    </div>

                    {/* Date Picker */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Appointment Date</label>
                      <input 
                        type="date"
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-800 px-3.5 py-2.5 rounded-xl text-xs font-medium focus:outline-none focus:border-primary-500"
                      />
                    </div>

                    {/* Time Slots */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Select Schedule (Morning)</label>
                      <div className="grid grid-cols-3 gap-2">
                        {activeDoctor.slots.morning.map((slot) => (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setBookingTime(slot)}
                            className={`py-2 text-[10px] font-bold rounded-lg border transition-all cursor-pointer ${
                              bookingTime === slot
                                ? "bg-primary-700 border-primary-700 text-white shadow-xs"
                                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                            }`}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>

                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block pt-2">Select Schedule (Evening)</label>
                      <div className="grid grid-cols-3 gap-2">
                        {activeDoctor.slots.evening.map((slot) => (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setBookingTime(slot)}
                            className={`py-2 text-[10px] font-bold rounded-lg border transition-all cursor-pointer ${
                              bookingTime === slot
                                ? "bg-primary-700 border-primary-700 text-white shadow-xs"
                                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                            }`}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Patient Information */}
                    <div className="space-y-3 pt-3 border-t border-slate-50">
                      <h4 className="text-xs font-bold text-slate-700">Patient Details</h4>
                      <div className="space-y-2">
                        <input 
                          type="text"
                          placeholder="Patient Full Name"
                          value={patientName}
                          onChange={(e) => setPatientName(e.target.value)}
                          required
                          className="w-full bg-slate-50 border border-slate-200 text-slate-800 px-3.5 py-2.5 rounded-xl text-xs focus:outline-none focus:border-primary-500"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input 
                            type="number"
                            placeholder="Age"
                            value={patientAge}
                            onChange={(e) => setPatientAge(e.target.value)}
                            required
                            className="bg-slate-50 border border-slate-200 text-slate-800 px-3.5 py-2.5 rounded-xl text-xs focus:outline-none focus:border-primary-500"
                          />
                          <select 
                            value={patientGender}
                            onChange={(e) => setPatientGender(e.target.value)}
                            className="bg-slate-50 border border-slate-200 text-slate-800 px-3.5 py-2.5 rounded-xl text-xs focus:outline-none focus:border-primary-500"
                          >
                            <option>Male</option>
                            <option>Female</option>
                            <option>Other</option>
                          </select>
                        </div>
                        <textarea 
                          placeholder="Describe symptoms or current issue (optional)..."
                          value={patientIssue}
                          onChange={(e) => setPatientIssue(e.target.value)}
                          rows="2"
                          className="w-full bg-slate-50 border border-slate-200 text-slate-800 p-3 rounded-xl text-xs focus:outline-none focus:border-primary-500"
                        />
                      </div>
                    </div>

                    {/* Submit Confirmation */}
                    <button
                      type="submit"
                      className="w-full bg-primary-700 hover:bg-primary-800 text-white font-bold py-3.5 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-md shadow-primary-700/20 cursor-pointer active:scale-98"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>Confirm Appointment</span>
                    </button>

                  </form>

                </div>
              </div>
            )}
          </div>

        </div>
      </main>

      {/* MOBILE MODAL: DOCTOR PROFILE DRAWER */}
      {showMobileProfile && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-end justify-center lg:hidden">
          <div className="bg-white w-full rounded-t-[32px] max-h-[85vh] overflow-y-auto p-6 space-y-6">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Doctor Profile</span>
              <button onClick={() => setShowMobileProfile(false)} className="p-1 rounded-full hover:bg-slate-100 text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex gap-4">
              <img src={activeDoctor.image} alt={activeDoctor.name} className="w-16 h-16 object-cover rounded-xl" />
              <div>
                <h3 className="font-bold text-slate-800 text-base">{activeDoctor.name}</h3>
                <p className="text-xs text-primary-700 font-semibold">{activeDoctor.specialty} • {activeDoctor.qualification}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">{activeDoctor.hospital}</p>
              </div>
            </div>

            <p className="text-slate-600 text-xs leading-relaxed">{activeDoctor.about}</p>
            
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Expertise</h4>
              <div className="flex flex-wrap gap-1.5">
                {activeDoctor.expertise.map((exp, i) => (
                  <span key={i} className="bg-primary-50 text-primary-700 text-[10px] font-bold px-2 py-1 rounded-md">
                    {exp}
                  </span>
                ))}
              </div>
            </div>

            <button 
              onClick={() => {
                setShowMobileProfile(false);
                setShowMobileBooking(true);
              }}
              className="w-full bg-primary-700 hover:bg-primary-800 text-white font-bold py-3.5 rounded-2xl text-sm transition-all"
            >
              Book Appointment Now
            </button>
          </div>
        </div>
      )}

      {/* MOBILE MODAL: APPOINTMENT SCHEDULER */}
      {showMobileBooking && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-end justify-center lg:hidden">
          <div className="bg-white w-full rounded-t-[32px] max-h-[90vh] overflow-y-auto p-6 space-y-6">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Schedule Consultation</span>
              <button onClick={() => setShowMobileBooking(false)} className="p-1 rounded-full hover:bg-slate-100 text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleConfirmBooking} className="space-y-4">
              <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl">
                <img src={activeDoctor.image} alt={activeDoctor.name} className="w-10 h-10 object-cover rounded-lg" />
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">{activeDoctor.name}</h4>
                  <p className="text-[10px] text-slate-500">₹{activeDoctor.fee} Consultation Fee</p>
                </div>
              </div>

              {/* Consultation type */}
              <div className="grid grid-cols-2 gap-3">
                <button 
                  type="button"
                  onClick={() => setConsultationType("Online")}
                  className={`py-2 rounded-xl text-[11px] font-bold border transition-colors ${
                    consultationType === "Online" ? "bg-primary-50 border-primary-600 text-primary-700" : "border-slate-200 text-slate-600"
                  }`}
                >
                  Online (Video)
                </button>
                <button 
                  type="button"
                  onClick={() => setConsultationType("In-person")}
                  className={`py-2 rounded-xl text-[11px] font-bold border transition-colors ${
                    consultationType === "In-person" ? "bg-primary-50 border-primary-600 text-primary-700" : "border-slate-200 text-slate-600"
                  }`}
                >
                  In-person Visit
                </button>
              </div>

              {/* Date */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Appointment Date</label>
                <input 
                  type="date"
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 px-3.5 py-2.5 rounded-xl text-xs"
                />
              </div>

              {/* Slots */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Select Slot</label>
                <div className="flex flex-wrap gap-2 max-h-[120px] overflow-y-auto p-1 border border-slate-100 rounded-xl">
                  {[...activeDoctor.slots.morning, ...activeDoctor.slots.evening].map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setBookingTime(slot)}
                      className={`px-3 py-1.5 text-[10px] font-bold rounded-lg border transition-all ${
                        bookingTime === slot ? "bg-primary-700 border-primary-700 text-white" : "border-slate-200 text-slate-600"
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              {/* Patient details */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <input 
                  type="text"
                  placeholder="Patient Name"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 px-3.5 py-2 rounded-xl text-xs"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input 
                    type="number"
                    placeholder="Age"
                    value={patientAge}
                    onChange={(e) => setPatientAge(e.target.value)}
                    required
                    className="bg-slate-50 border border-slate-200 text-slate-800 px-3.5 py-2 rounded-xl text-xs"
                  />
                  <select 
                    value={patientGender}
                    onChange={(e) => setPatientGender(e.target.value)}
                    className="bg-slate-50 border border-slate-200 text-slate-800 px-3.5 py-2 rounded-xl text-xs"
                  >
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-primary-700 text-white font-bold py-3.5 rounded-2xl text-xs transition-colors shadow-md"
              >
                Confirm Appointment
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MOBILE SUCCESS POPUP */}
      {bookingConfirmed && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 lg:hidden">
          <div className="w-full max-w-sm">
            <BookingSuccessCard details={bookingDetails} onReset={() => setBookingConfirmed(false)} />
          </div>
        </div>
      )}

    </div>
  );
}

// Subcomponent: Appointment Booking Success Receipt
function BookingSuccessCard({ details, onReset }) {
  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden p-6 text-center space-y-6 animate-scaleIn">
      <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
        <CheckCircle2 className="w-10 h-10" />
      </div>

      <div className="space-y-1">
        <h3 className="font-extrabold text-xl text-slate-900">Appointment Scheduled</h3>
        <p className="text-xs text-slate-500">Your digital booking confirmation invoice is generated below.</p>
      </div>

      {/* Ticket Details */}
      <div className="bg-slate-50 border border-dashed border-slate-200 p-4 rounded-2xl text-left space-y-3.5">
        <div className="flex justify-between items-center border-b border-slate-200/50 pb-2.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Booking ID</span>
          <span className="text-xs font-bold text-slate-800">{details.id}</span>
        </div>

        <div className="flex gap-3">
          <img src={details.image} alt={details.doctorName} className="w-10 h-10 object-cover rounded-lg border border-slate-200" />
          <div>
            <h4 className="font-bold text-slate-800 text-xs">{details.doctorName}</h4>
            <p className="text-[9px] text-slate-500 font-semibold uppercase">{details.specialty}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs border-t border-b border-slate-200/50 py-3">
          <div>
            <p className="text-[9px] text-slate-400 font-bold uppercase">Date & Time</p>
            <p className="font-bold text-slate-800 mt-0.5">{details.date}</p>
            <p className="text-[10px] text-slate-500 font-medium">{details.time}</p>
          </div>
          <div>
            <p className="text-[9px] text-slate-400 font-bold uppercase">Consultation Type</p>
            <p className="font-bold text-slate-800 mt-0.5">{details.type}</p>
            <p className="text-[10px] text-slate-500 font-medium">₹{details.fee} Paid</p>
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-[9px] text-slate-400 font-bold uppercase">Patient Profile</p>
          <p className="font-semibold text-slate-700 text-[11px]">
            {details.patient.name} ({details.patient.age}Y, {details.patient.gender})
          </p>
          <p className="text-[10px] text-slate-500 italic mt-0.5">
            "{details.patient.issue}"
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <button 
          onClick={onReset}
          className="w-full bg-primary-700 hover:bg-primary-800 text-white font-bold py-3 rounded-2xl text-xs transition-colors shadow-md"
        >
          Book Another Appointment
        </button>
        <p className="text-[10px] text-slate-400 font-medium flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Secured clinical appointment reservation system</span>
        </p>
      </div>
    </div>
  );
}
