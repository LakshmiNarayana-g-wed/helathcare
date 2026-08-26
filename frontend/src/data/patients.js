export const patient = {
  id: "PROTOTYPE",
  name: "",
  gender: "Not specified",
  age: 24,
  height: "168 cm",
  weight: 62,
  bloodGroup: "B+",
  healthIssue: "Demo care summary",
  date: "Prototype",
  avatar: "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?auto=format&fit=crop&w=600&q=80",
  overallHealth: 81,
  healthStatusMessage: "Prototype health summary. This is not a medical assessment.",
  
  // Real-time vitals
  vitals: {
    bloodPressure: { value: "120/70", unit: "mmHg", status: "Normal", color: "text-emerald-500", bg: "bg-emerald-50" },
    heartRate: { value: "97", unit: "bpm", status: "Slightly High", color: "text-amber-500", bg: "bg-amber-50" },
    bloodGlucose: { value: "7.9", unit: "mmol/L", status: "High", color: "text-rose-500", bg: "bg-rose-50" },
    oxygenSaturation: { value: "96.5", unit: "%", status: "Normal", color: "text-emerald-500", bg: "bg-emerald-50" },
    bodyTemperature: { value: "98.6", unit: "°F", status: "Normal", color: "text-emerald-500", bg: "bg-emerald-50" },
    respiratoryRate: { value: "16", unit: "bpm", status: "Normal", color: "text-emerald-500", bg: "bg-emerald-50" },
    cholesterol: { value: "195", unit: "mg/dL", status: "Normal", color: "text-emerald-500", bg: "bg-emerald-50" },
    readmissionRate: { value: "1.2", unit: "%", status: "Low Risk", color: "text-emerald-500", bg: "bg-emerald-50" }
  },

  // Health Composition
  composition: [
    { name: "Glucose", value: "7.9 mmol/L", status: "High" },
    { name: "Cholesterol", value: "195 mg/dL", status: "Normal" },
    { name: "Haemoglobin", value: "9.6 mmol/L", status: "Normal" },
    { name: "Thrombocyte", value: "395 x10^9/L", status: "Normal" },
    { name: "Sodium", value: "140 mmol/L", status: "Normal" },
    { name: "Potassium", value: "4.2 mmol/L", status: "Normal" }
  ],

  // Organ interactive data
  organs: {
    brain: {
      name: "Brain",
      status: "Healthy",
      details: "Cognitive functions normal. Post-operative neurological evaluation shows excellent orientation and memory retention. Sleep patterns are stabilizing.",
      score: 95
    },
    lungs: {
      name: "Lungs",
      status: "Condition: Stable (96%)",
      details: "Bilateral lung expansion is clear. No pleural effusion. Normal oxygen saturation on room air.",
      score: 96
    },
    heart: {
      name: "Heart",
      status: "Recovering (CABG)",
      details: "Post-CABG (Coronary Artery Bypass Grafting) surgery healing is on schedule. Left ventricular ejection fraction is 52% (stable). Regular rhythm monitored.",
      score: 81
    },
    kidney: {
      name: "Kidney",
      status: "Condition: Healthy (90%)",
      details: "Urinary output is adequate. Serum creatinine: 0.9 mg/dL. Glomerular filtration rate (eGFR) is 88 mL/min (normal range).",
      score: 90
    },
    stomach: {
      name: "Digestive System",
      status: "Healthy",
      details: "Bowel sounds present and active. Tolerating soft diet well. No gastric distress or symptoms of nausea reported.",
      score: 92
    }
  },

  // Historical Charts Data
  charts: {
    bloodPressure: [
      { day: "Day 1", systolic: 130, diastolic: 85 },
      { day: "Day 2", systolic: 128, diastolic: 82 },
      { day: "Day 3", systolic: 126, diastolic: 80 },
      { day: "Day 4", systolic: 125, diastolic: 79 },
      { day: "Day 5", systolic: 124, diastolic: 78 },
      { day: "Day 6", systolic: 122, diastolic: 75 },
      { day: "Day 7", systolic: 120, diastolic: 70 },
      { day: "Day 8", systolic: 122, diastolic: 72 },
      { day: "Day 9", systolic: 123, diastolic: 74 },
      { day: "Day 10", systolic: 121, diastolic: 72 },
      { day: "Day 11", systolic: 119, diastolic: 71 },
      { day: "Day 12", systolic: 120, diastolic: 70 },
      { day: "Day 13", systolic: 118, diastolic: 69 },
      { day: "Day 14", systolic: 119, diastolic: 72 },
      { day: "Day 15", systolic: 120, diastolic: 70 }
    ],
    heartRate: [
      { day: "Day 1", rate: 102 },
      { day: "Day 2", rate: 99 },
      { day: "Day 3", rate: 95 },
      { day: "Day 4", rate: 98 },
      { day: "Day 5", rate: 96 },
      { day: "Day 6", rate: 92 },
      { day: "Day 7", rate: 90 },
      { day: "Day 8", rate: 92 },
      { day: "Day 9", rate: 94 },
      { day: "Day 10", rate: 95 },
      { day: "Day 11", rate: 91 },
      { day: "Day 12", rate: 89 },
      { day: "Day 13", rate: 87 },
      { day: "Day 14", rate: 93 },
      { day: "Day 15", rate: 97 }
    ],
    sleep: [
      { day: "Day 1", total: 6.2, deep: 1.5 },
      { day: "Day 2", total: 6.5, deep: 1.7 },
      { day: "Day 3", total: 6.8, deep: 1.8 },
      { day: "Day 4", total: 5.9, deep: 1.2 },
      { day: "Day 5", total: 7.0, deep: 2.1 },
      { day: "Day 6", total: 7.2, deep: 2.2 },
      { day: "Day 7", total: 6.9, deep: 2.0 },
      { day: "Day 8", total: 7.1, deep: 2.3 },
      { day: "Day 9", total: 6.8, deep: 1.9 },
      { day: "Day 10", total: 7.3, deep: 2.4 },
      { day: "Day 11", total: 7.5, deep: 2.5 },
      { day: "Day 12", total: 7.1, deep: 2.1 },
      { day: "Day 13", total: 6.7, deep: 1.8 },
      { day: "Day 14", total: 7.2, deep: 2.2 },
      { day: "Day 15", total: 7.4, deep: 2.6 }
    ],
    steps: [
      { day: "Mon", steps: 2100, target: 5000 },
      { day: "Tue", steps: 3200, target: 5000 },
      { day: "Wed", steps: 3500, target: 5000 },
      { day: "Thu", steps: 4100, target: 5000 },
      { day: "Fri", steps: 3800, target: 5000 },
      { day: "Sat", steps: 4600, target: 5000 },
      { day: "Sun", steps: 5200, target: 5000 }
    ]
  },

  // Medical History Records
  appointments: [
    { date: "Prototype date", time: "10:30 AM", doctor: "Demo care team", specialty: "General consultation", status: "Upcoming", type: "In-Person" },
    { date: "21 Jan 2026", time: "08:00 AM", doctor: "Dr. Carlos Mendez", specialty: "Orthopedics", status: "Completed", type: "In-Person" },
    { date: "Prototype date", time: "03:30 PM", doctor: "Demo care team", specialty: "General consultation", status: "Completed", type: "Online" }
  ],
  prescriptions: [
    { date: "Prototype date", medicine: "Demo prescription", dosage: "Example dosage", duration: "Example duration", doctor: "Demo care team", fileUrl: "#" }
  ],
  labReports: [
    { date: "Prototype date", name: "Demo lab report", result: "Fictional result", status: "Demo", doctor: "Demo care team", fileUrl: "#" }
  ],
  medicalHistory: [
    { condition: "Coronary Artery Disease (CAD)", diagnosedDate: "Oct 2025", status: "Post-Surgical Management" },
    { condition: "Mild Hypertension", diagnosedDate: "June 2022", status: "Controlled with medication" }
  ]
};
