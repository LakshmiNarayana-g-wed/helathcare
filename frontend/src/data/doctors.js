export const doctors = [
  {
    id: "doc-1",
    name: "Dr. Rahamatulla",
    specialty: "Cardiology",
    qualification: "MD - Cardiology, FACC",
    experience: 15,
    hospital: "Healora Medical Center",
    rating: 4.9,
    reviewsCount: 340,
    fee: 800,
    availability: "Available",
    image: "/dr-rahamatulla.jpeg",
    about: "Dr. Rahamatulla is a cardiologist experienced in treating complex cardiovascular conditions. He focuses on interventional cardiology, heart failure management, and preventive heart care.",
    expertise: ["Interventional Cardiology", "Hypertension Management", "Echocardiography", "Heart Failure"],
    languages: ["English"],
    slots: {
      morning: ["09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM"],
      evening: ["04:00 PM", "04:30 PM", "05:00 PM", "05:30 PM", "06:00 PM"]
    },
    reviews: [
      { id: 1, patientName: "Priya S.", rating: 5, comment: "Excellent care. He saved my father's life during a critical coronary procedure.", date: "15 Aug 2026" },
      { id: 2, patientName: "Robert L.", rating: 4.8, comment: "Very professional and patient. Explains complex reports in simple terms.", date: "10 Aug 2026" }
    ]
  },
  {
    id: "doc-2",
    name: "Dr. Sudarshan",
    specialty: "Dermatology",
    qualification: "MD - Dermatology, Venereology",
    experience: 10,
    hospital: "Healora Skin Clinic",
    rating: 4.8,
    reviewsCount: 215,
    fee: 700,
    availability: "Available Today",
    image: "/dr-sudarshan.jpeg",
    about: "Dr. Sudarshan is dedicated to helping patients achieve healthy skin. He provides clinical and cosmetic dermatology care, including acne treatment, skin screenings, and anti-aging procedures.",
    expertise: ["Acne & Scar Treatments", "Eczema & Psoriasis", "Laser Rejuvenation", "Skin Biopsies"],
    languages: ["English"],
    slots: {
      morning: ["10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM"],
      evening: ["03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM"]
    },
    reviews: [
      { id: 1, patientName: "Julia R.", rating: 4.9, comment: "My acne is completely gone! Dr. Sudarshan has a very gentle approach.", date: "12 Aug 2026" }
    ]
  },
  {
    id: "doc-3",
    name: "Dr. Narayan",
    specialty: "Orthopedics",
    qualification: "MS - Orthopedics, Joint Replacement Specialist",
    experience: 12,
    hospital: "Healora Ortho & Trauma",
    rating: 4.7,
    reviewsCount: 190,
    fee: 900,
    availability: "Available Tomorrow",
    image: "/dr-narayan.jpeg",
    about: "Dr. Narayan is an orthopedic specialist who focuses on joint replacement surgery, arthroscopy, and sports medicine. He is committed to helping patients restore mobility and live with less pain.",
    expertise: ["Knee & Hip Replacement", "Sports Injuries", "Fracture Management", "Arthroscopy"],
    languages: ["English"],
    slots: {
      morning: ["09:00 AM", "09:30 AM", "10:30 AM", "11:00 AM"],
      evening: ["02:00 PM", "02:30 PM", "03:30 PM", "04:00 PM"]
    },
    reviews: [
      { id: 1, patientName: "Michael R.", rating: 4.8, comment: "Outstanding knee replacement surgery. I am walking without pain after 3 months.", date: "05 Aug 2026" }
    ]
  },
  {
    id: "doc-4",
    name: "Dr. Sai",
    specialty: "Neurology",
    qualification: "DM - Neurology, Stroke Expert",
    experience: 18,
    hospital: "Healora Neuro Institute",
    rating: 4.9,
    reviewsCount: 420,
    fee: 1200,
    availability: "Available Today",
    image: "/dr-sai.jpeg",
    about: "Dr. Sai is a neurologist with experience in neurodegenerative disorders, stroke management, and epilepsy treatment. He is dedicated to providing thoughtful, personalized neurological care.",
    expertise: ["Stroke Rehabilitation", "Epilepsy & Seizures", "Migraine Care", "Alzheimer's Disease"],
    languages: ["English"],
    slots: {
      morning: ["08:30 AM", "09:00 AM", "09:30 AM", "10:30 AM"],
      evening: ["04:30 PM", "05:00 PM", "05:30 PM", "06:00 PM"]
    },
    reviews: [
      { id: 1, patientName: "Carlos G.", rating: 5, comment: "Highly skilled. His treatment plan for my chronic migraine has worked wonders.", date: "18 Aug 2026" }
    ]
  },
  {
    id: "doc-5",
    name: "Dr. Khushal",
    specialty: "Physiotherapy",
    qualification: "MPT - Sports & Neurological Physiotherapy",
    experience: 6,
    hospital: "Royal Hospital Center",
    rating: 4.9,
    reviewsCount: 110,
    fee: 1000,
    availability: "Available",
    image: "/dr-khushal.jpeg",
    about: "Dr. Khushal specializes in sports rehabilitation, post-surgery physical therapy, and neurological rehabilitation. He designs personalized recovery plans to help patients rebuild strength and flexibility.",
    expertise: ["Post-Surgical Rehab", "Sports Injury Recovery", "Spine Care", "Neuromuscular Therapy"],
    languages: ["English"],
    slots: {
      morning: ["09:30 AM", "10:00 AM", "10:30 AM", "11:30 AM"],
      evening: ["03:30 PM", "04:00 PM", "04:30 PM", "05:00 PM"]
    },
    reviews: [
      { id: 1, patientName: "Ahmad Y.", rating: 5, comment: "Excellent therapist! Recovered from my ligament tear much faster than expected.", date: "19 Aug 2026" }
    ]
  },
  {
    id: "doc-6",
    name: "Dr. Rohith",
    specialty: "Pediatrics",
    qualification: "MD - Pediatrics, Child Health Specialist",
    experience: 10,
    hospital: "Healora Kids Clinic",
    rating: 4.9,
    reviewsCount: 155,
    fee: 600,
    availability: "Available",
    image: "/dr-rohith.jpeg",
    about: "Dr. Rohith is a friendly pediatrician who helps children feel comfortable during consultations. He provides care in neonatology, pediatric nutrition, and immunizations.",
    expertise: ["Neonatal Intensive Care", "Child Nutrition", "Immunizations", "Pediatric Asthma"],
    languages: ["English"],
    slots: {
      morning: ["09:00 AM", "10:00 AM", "11:00 AM"],
      evening: ["04:00 PM", "05:00 PM", "06:00 PM"]
    },
    reviews: [
      { id: 1, patientName: "John M.", rating: 4.8, comment: "He was very gentle with my 2-year old daughter. Highly recommended.", date: "14 Aug 2026" }
    ]
  },
  {
    id: "doc-7",
    name: "Dr. Naveen",
    specialty: "Emergency Care",
    qualification: "MBBS, MD - Emergency Medicine",
    experience: 12,
    hospital: "Healora ER Department",
    rating: 4.8,
    reviewsCount: 280,
    fee: 500,
    availability: "On Duty",
    image: "/dr-naveen.jpeg",
    about: "Dr. Naveen is an emergency medicine specialist who treats trauma, critical illnesses, and acute clinical conditions. He provides precise care in high-pressure emergency situations.",
    expertise: ["Acute Care", "Trauma Management", "Resuscitation", "Critical Care Medicine"],
    languages: ["English"],
    slots: {
      morning: ["08:00 AM", "09:00 AM", "10:00 AM"],
      evening: ["02:00 PM", "03:00 PM", "04:00 PM"]
    },
    reviews: [
      { id: 1, patientName: "David C.", rating: 4.8, comment: "Super fast response during a sudden asthma attack. Incredibly thankful.", date: "02 Aug 2026" }
    ]
  },
  {
    id: "doc-8",
    name: "Dr. Natasha Lim",
    specialty: "ENT",
    qualification: "MBBS, DLO - Ear, Nose, Throat specialist",
    experience: 8,
    hospital: "Healora ENT Center",
    rating: 4.7,
    reviewsCount: 160,
    fee: 500,
    availability: "Available Today",
    image: "https://images.unsplash.com/photo-1614608682850-e0d6ed316d47?auto=format&fit=crop&w=600&q=80",
    about: "Dr. Natasha Lim focuses on diseases of the ear, nose, throat, head and neck. She specializes in allergy treatments, sinus surgeries, and pediatric ENT problems.",
    expertise: ["Sinus Surgery", "Allergy Treatment", "Hearing Assessment", "Tonsillectomy"],
    languages: ["English", "Mandarin"],
    slots: {
      morning: ["09:30 AM", "10:30 AM", "11:30 AM"],
      evening: ["03:00 PM", "04:00 PM", "05:00 PM"]
    },
    reviews: [
      { id: 1, patientName: "Carlos G.", rating: 4.8, comment: "Resolved my chronic sinusitis problem within two weeks. Very knowledgeable.", date: "11 Aug 2026" }
    ]
  }
];
