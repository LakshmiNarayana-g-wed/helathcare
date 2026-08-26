import { useState } from "react";
import { 
  Search, Filter, ShoppingBag, Plus, Minus, Trash2, X, AlertCircle, 
  UploadCloud, FileText, CheckCircle2, ShieldAlert, CreditCard, MapPin, Truck, Bell, Clock
} from "lucide-react";
import { medicines } from "../data/medicines";
import { getCurrentUser } from "../utils/sessionUser";

export default function Medicines() {
  // Catalog states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStockStatus, setSelectedStockStatus] = useState("All");

  // Cart state
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);

  // Selected product details modal
  const [activeProduct, setActiveProduct] = useState(null);

  // Prescription validation workflow
  const [prescriptions, setPrescriptions] = useState({}); // { productId: { fileUploaded: boolean, fileName: string, verified: boolean } }
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [prescProduct, setPrescProduct] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Checkout states
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(1); // 1: Shipping, 2: Payment, 3: Success
  const [shippingAddress, setShippingAddress] = useState({ name: "", phone: "", street: "", city: "", zip: "" });
  const [paymentDetails, setPaymentDetails] = useState({ cardNumber: "•••• •••• •••• 4291", expiry: "12/28", cvv: "•••" });
  const [orderInvoice, setOrderInvoice] = useState(null);
  const [reminderStatus, setReminderStatus] = useState("");
  const [isSavingReminder, setIsSavingReminder] = useState(false);
  const [reminderForm, setReminderForm] = useState({ period: "MORNING", scheduled_time: "08:00", phone_number: String(getCurrentUser()?.phone || "").replace(/\D/g, "").replace(/^91/, "").slice(0, 10) });

  const reminderWindows = {
    MORNING: { label: "Morning", detail: "6:00 AM – 11:00 AM", min: "06:00", max: "11:00", time: "08:00" },
    AFTERNOON: { label: "Afternoon", detail: "12:00 PM – 3:00 PM", min: "12:00", max: "15:00", time: "13:00" },
    EVENING: { label: "Evening", detail: "7:00 PM – 11:00 PM", min: "19:00", max: "23:00", time: "20:00" },
  };

  const setReminderPeriod = (period) => {
    setReminderForm((current) => ({ ...current, period, scheduled_time: reminderWindows[period].time }));
  };

  const saveMedicationReminder = async (event) => {
    event.preventDefault();
    const indianNumber = reminderForm.phone_number.replace(/\D/g, '').replace(/^91/, '');
    if (!/^[6-9]\d{9}$/.test(indianNumber)) {
      setReminderStatus("Enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.");
      return;
    }
    const token = localStorage.getItem("healora.token");
    setIsSavingReminder(true);
    setReminderStatus("");
    try {
      const res = await fetch("/api/pharmacy/medication-reminders/", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...reminderForm, phone_number: indianNumber }),
      });
      const rawBody = await res.text();
      let data = {};
      try { data = rawBody ? JSON.parse(rawBody) : {}; } catch { /* Server returned an HTML/proxy error. */ }
      if (!res.ok) {
        const errorText = typeof data === "object" ? Object.values(data).flat().join(" ") : "";
        throw new Error(errorText || `Could not save reminder (server returned ${res.status}).`);
      }
      setReminderStatus(`Reminder saved. We’ll text +91${indianNumber} at ${reminderForm.scheduled_time}.`);
    } catch (error) {
      setReminderStatus(error.message || "Could not save reminder.");
    } finally {
      setIsSavingReminder(false);
    }
  };

  // Filter logic
  const filteredProducts = medicines.filter((prod) => {
    const matchesSearch = prod.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          prod.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Quick Category check
    const matchesCat = selectedCategory === "All" ? true : prod.category === selectedCategory;
    
    // Stock Status check
    const matchesStock = selectedStockStatus === "All" ? true : (
      selectedStockStatus === "In Stock" ? prod.stock > 0 :
      selectedStockStatus === "Out of Stock" ? prod.stock === 0 :
      selectedStockStatus === "Low Stock" ? (prod.stock > 0 && prod.stock <= 10) : true
    );

    return matchesSearch && matchesCat && matchesStock;
  });

  // Open product details
  const handleOpenDetails = (prod) => {
    setActiveProduct(prod);
  };

  // Add item to cart
  const handleAddToCart = (prod, quantity = 1) => {
    // 1. Check if prescription is required and not yet verified
    if (prod.prescriptionRequired && !prescriptions[prod.id]?.verified) {
      setPrescProduct(prod);
      setShowPrescriptionModal(true);
      return;
    }

    // 2. Check if product is in stock
    if (prod.stock === 0) {
      alert("This product is currently out of stock.");
      return;
    }

    // 3. Add to cart
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === prod.id);
      if (existing) {
        // limit quantity by stock
        const newQty = Math.min(existing.quantity + quantity, prod.stock);
        return prevCart.map((item) => item.id === prod.id ? { ...item, quantity: newQty } : item);
      }
      return [...prevCart, { ...prod, quantity }];
    });

    // Auto open cart
    setShowCart(true);
  };

  // Adjust cart quantities
  const updateCartQuantity = (id, change) => {
    setCart((prevCart) => 
      prevCart.map((item) => {
        if (item.id === id) {
          const newQty = item.quantity + change;
          if (newQty <= 0) return null; // mark for removal
          return { ...item, quantity: Math.min(newQty, item.stock) };
        }
        return item;
      }).filter(Boolean)
    );
  };

  // Remove from cart
  const handleRemoveFromCart = (id) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  // Cart values calculations
  const cartSubtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const cartTax = cartSubtotal * 0.05; // 5% clinical medical tax
  const shippingFee = cartSubtotal > 1500 || cartSubtotal === 0 ? 0 : 150; // free shipping above 1500
  const cartTotal = cartSubtotal + cartTax + shippingFee;

  // Handle prescription upload
  const simulatePrescriptionUpload = (e) => {
    e.preventDefault();
    setUploading(true);
    setUploadProgress(10);
    
    // Simulate upload timer
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setUploading(false);
            setPrescriptions((prevPresc) => ({
              ...prevPresc,
              [prescProduct.id]: { fileUploaded: true, fileName: "rx_doctor_approval_2026.pdf", verified: true }
            }));
            // Add verified product to cart
            handleAddToCart(prescProduct, 1);
            setShowPrescriptionModal(false);
          }, 800);
          return 100;
        }
        return prev + 30;
      });
    }, 300);
  };

  // Handle Checkout submission
  const processCheckout = (e) => {
    e.preventDefault();
    if (checkoutStep === 1) {
      setCheckoutStep(2);
    } else if (checkoutStep === 2) {
      // Confirm payment & generate receipt invoice
      const invoice = {
        orderId: "HLR-" + Math.floor(100000 + Math.random() * 900000),
        items: [...cart],
        subtotal: cartSubtotal,
        tax: cartTax,
        shipping: shippingFee,
        total: cartTotal,
        shippingAddress,
        date: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
      };
      setOrderInvoice(invoice);
      setCheckoutStep(3);
      setCart([]); // Clear cart after success
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-16">
      
      {/* Catalog Header Banner */}
      <section className="bg-gradient-to-r from-blue-900 to-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <h1 className="text-3xl sm:text-4xl font-extrabold">Healthcare Product Catalog</h1>
          <p className="text-primary-200 max-w-xl mx-auto text-sm sm:text-base">
            Securely purchase clinical medications, medical equipment, and first-aid kits directly to your doorstep.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <form onSubmit={saveMedicationReminder} className="rounded-3xl border border-primary-100 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-2 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-primary-50 p-3 text-primary-700"><Bell className="h-5 w-5" /></div>
              <div><h2 className="font-extrabold text-slate-900">Medicine SMS reminder</h2><p className="text-xs text-slate-500">Set an exact time and receive “Take your medicine” by SMS.</p></div>
            </div>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-primary-700"><Clock className="h-3.5 w-3.5" /> India time (IST)</span>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2.5 text-xs font-bold text-emerald-800">SMS message<br /><span className="font-medium text-emerald-700">“Take your medicine”</span></div>
            <div className="text-xs font-bold text-slate-600">Time window
              <div className="mt-1.5 flex gap-1 rounded-xl bg-slate-100 p-1">
                {Object.entries(reminderWindows).map(([key, item]) => <button key={key} type="button" onClick={() => setReminderPeriod(key)} className={`flex-1 rounded-lg px-2 py-2 text-[10px] font-bold transition ${reminderForm.period === key ? "bg-primary-700 text-white shadow-sm" : "text-slate-600 hover:bg-white"}`}>{item.label}</button>)}
              </div>
              <p className="mt-1 text-[10px] font-medium text-slate-400">{reminderWindows[reminderForm.period].detail}</p>
            </div>
            <label className="text-xs font-bold text-slate-600">Exact reminder time
              <input required type="time" min={reminderWindows[reminderForm.period].min} max={reminderWindows[reminderForm.period].max} value={reminderForm.scheduled_time} onChange={(e) => setReminderForm({ ...reminderForm, scheduled_time: e.target.value })} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 font-medium text-slate-700 outline-none focus:border-primary-500" />
            </label>
            <label className="text-xs font-bold text-slate-600">SMS phone number
              <div className="mt-1.5 flex rounded-xl border border-slate-200 bg-slate-50 focus-within:border-primary-500"><span className="border-r border-slate-200 px-3 py-2.5 text-xs font-bold text-slate-500">+91</span><input required type="tel" inputMode="numeric" maxLength="10" placeholder="9876543210" value={reminderForm.phone_number} onChange={(e) => setReminderForm({ ...reminderForm, phone_number: e.target.value.replace(/\D/g, '').replace(/^91/, '').slice(0, 10) })} className="min-w-0 flex-1 rounded-r-xl bg-transparent px-3 py-2.5 font-medium text-slate-700 outline-none" /></div>
            </label>
          </div>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><p aria-live="polite" className={`text-xs font-medium ${reminderStatus.startsWith("Reminder saved") ? "text-emerald-600" : "text-rose-600"}`}>{reminderStatus || "Your number must include the country code."}</p><button disabled={isSavingReminder} className="rounded-xl bg-primary-700 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-primary-800 disabled:opacity-60">{isSavingReminder ? "Saving…" : "Save SMS reminder"}</button></div>
        </form>
      </section>

      {/* Main Grid Catalog */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Floating Cart Button (Desktop & Mobile) */}
        <button 
          onClick={() => setShowCart(true)}
          className="fixed bottom-6 right-6 bg-primary-700 hover:bg-primary-800 text-white p-4 rounded-full shadow-2xl flex items-center gap-2 z-40 active:scale-95 transition-all border border-primary-600"
        >
          <ShoppingBag className="w-6 h-6" />
          {cart.length > 0 && (
            <span className="bg-rose-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shrink-0">
              {cart.reduce((sum, item) => sum + item.quantity, 0)}
            </span>
          )}
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT 3 COLS: FILTERS SIDEBAR */}
          <div className="lg:col-span-3 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 pb-3 border-b border-slate-100">
              <Filter className="w-4 h-4 text-primary-600" />
              <span>Catalog Filters</span>
            </h3>

            {/* Category Dropdown */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Category</label>
              <select 
                value={selectedCategory} 
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-700 font-medium focus:outline-none"
              >
                <option value="All">All Categories</option>
                <option value="Antibiotics">Antibiotics</option>
                <option value="Pain Relief">Pain Relief</option>
                <option value="Vitamins">Vitamins</option>
                <option value="Equipment">Medical Equipment</option>
                <option value="First Aid">First Aid</option>
              </select>
            </div>

            {/* Availability Dropdown */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Availability</label>
              <select 
                value={selectedStockStatus} 
                onChange={(e) => setSelectedStockStatus(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-700 font-medium focus:outline-none"
              >
                <option value="All">All Stock Status</option>
                <option value="In Stock">In Stock</option>
                <option value="Low Stock">Low Stock</option>
                <option value="Out of Stock">Out of Stock</option>
              </select>
            </div>
          </div>

          {/* RIGHT 9 COLS: PRODUCTS GRID */}
          <div className="lg:col-span-9 space-y-6">
            
            {/* Search and Top Filters Panel */}
            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
              
              {/* Search Bar */}
              <div className="relative w-full md:w-96">
                <input 
                  type="text" 
                  placeholder="Search medicines, equipment, bandages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 pl-10 pr-4 py-2.5 rounded-xl text-xs focus:outline-none focus:border-primary-500 focus:bg-white transition-all"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>

              {/* Quick Horizontal Buttons */}
              <div className="flex flex-wrap gap-2 w-full md:w-auto">
                {["All", "Antibiotics", "Pain Relief", "Equipment"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedCategory === cat
                        ? "bg-primary-700 text-white shadow-sm"
                        : "bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {filteredProducts.map((prod) => (
                <div 
                  key={prod.id}
                  className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow group"
                >
                  {/* Image with prescription tag */}
                  <div className="relative h-44 overflow-hidden bg-slate-100">
                    <img 
                      src={prod.image} 
                      alt={prod.name} 
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                    />
                    
                    {/* Prescription Required Badge */}
                    {prod.prescriptionRequired && (
                      <span className="absolute top-3 left-3 bg-amber-500/90 backdrop-blur-sm text-white text-[9px] font-bold px-2 py-1 rounded-md flex items-center gap-1">
                        <ShieldAlert className="w-3 h-3" />
                        <span>Rx Prescription Required</span>
                      </span>
                    )}

                    {/* Stock Status Badge */}
                    <span className={`absolute top-3 right-3 text-[9px] font-extrabold px-2.5 py-1 rounded-md shadow-sm border ${
                      prod.stock === 0
                        ? "bg-rose-50 text-rose-600 border-rose-100"
                        : prod.stock <= 10
                        ? "bg-amber-50 text-amber-600 border-amber-100"
                        : "bg-emerald-50 text-emerald-600 border-emerald-100"
                    }`}>
                      {prod.stock === 0 ? "Out of Stock" : prod.stock <= 10 ? "Low Stock" : "In Stock"}
                    </span>
                  </div>

                  {/* Body details */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-1.5">
                      <span className="text-[10px] bg-slate-50 border border-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded uppercase">
                        {prod.category}
                      </span>
                      <h4 className="font-bold text-slate-800 text-sm leading-snug line-clamp-1 group-hover:text-primary-700 transition-colors">
                        {prod.name}
                      </h4>
                    </div>

                    <div className="flex justify-between items-baseline pt-2">
                      <p className="font-extrabold text-slate-850 text-base">₹{prod.price}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <button
                        onClick={() => handleOpenDetails(prod)}
                        className="w-full text-center py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-[11px] transition-colors cursor-pointer"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => handleAddToCart(prod, 1)}
                        className="w-full bg-primary-700 hover:bg-primary-800 text-white font-bold py-2.5 rounded-xl text-[11px] transition-all shadow-sm hover:shadow cursor-pointer active:scale-95"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>

        </div>

      </main>

      {/* DETAIL MODAL DRAWER */}
      {activeProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] w-full max-w-xl overflow-hidden shadow-2xl animate-scaleIn">
            
            {/* Header image */}
            <div className="relative h-56 bg-slate-100">
              <img src={activeProduct.image} alt={activeProduct.name} className="w-full h-full object-cover" />
              <button 
                onClick={() => setActiveProduct(null)}
                className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto no-scrollbar">
              
              <div className="space-y-2">
                <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-1 rounded-md uppercase">
                  {activeProduct.category}
                </span>
                <h3 className="font-extrabold text-xl text-slate-900">{activeProduct.name}</h3>
                
                <div className="flex gap-4 items-center">
                  <p className="text-xl font-extrabold text-slate-800">₹{activeProduct.price}</p>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                    activeProduct.stock > 0 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                  }`}>
                    {activeProduct.stock > 0 ? `In Stock (${activeProduct.stock} available)` : "Out of Stock"}
                  </span>
                </div>
              </div>

              {activeProduct.prescriptionRequired && (
                <div className="bg-amber-50 border border-amber-200/50 p-4 rounded-2xl flex items-start gap-3">
                  <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-700 space-y-1">
                    <p className="font-bold">Prescription Required Medicine</p>
                    <p>You must upload an approved medical prescription file to unlock the check-out process for this drug.</p>
                  </div>
                </div>
              )}

              <div className="space-y-1 text-xs">
                <h4 className="font-bold text-slate-400 uppercase tracking-wider">Product Description</h4>
                <p className="text-slate-600 leading-relaxed">{activeProduct.description}</p>
              </div>

              <div className="space-y-1 text-xs">
                <h4 className="font-bold text-slate-400 uppercase tracking-wider">Manufacturer</h4>
                <p className="text-slate-800 font-semibold">{activeProduct.manufacturer}</p>
              </div>

              <div className="space-y-1 text-xs">
                <h4 className="font-bold text-slate-400 uppercase tracking-wider">Usage & Dosage Instructions</h4>
                <p className="text-slate-600 leading-relaxed">{activeProduct.usage}</p>
              </div>

            </div>

            {/* Footer buttons */}
            <div className="border-t border-slate-100 p-6 flex gap-4">
              <button 
                onClick={() => setActiveProduct(null)}
                className="flex-1 text-center py-3 rounded-2xl border border-slate-200 hover:bg-slate-50 font-bold text-xs text-slate-700 transition-colors"
              >
                Close Details
              </button>
              <button 
                onClick={() => {
                  handleAddToCart(activeProduct, 1);
                  setActiveProduct(null);
                }}
                className="flex-1 bg-primary-700 hover:bg-primary-800 text-white font-bold py-3 rounded-2xl text-xs transition-colors shadow-md"
              >
                Add to Shopping Cart
              </button>
            </div>

          </div>
        </div>
      )}

      {/* PRESCRIPTION UPLOAD MODAL */}
      {showPrescriptionModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] w-full max-w-sm overflow-hidden shadow-2xl p-6 space-y-6 animate-scaleIn">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-500" />
                <span>Upload Clinical Prescription</span>
              </h3>
              <button onClick={() => setShowPrescriptionModal(false)} className="p-1 rounded-full hover:bg-slate-100 text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-slate-500 space-y-2">
              <p>The drug <span className="font-bold text-slate-800">"{prescProduct?.name}"</span> is class-scheduled and requires clinical authorization.</p>
              <p>Please upload a valid medical prescription signed by your cardiologist or primary physician.</p>
            </div>

            <form onSubmit={simulatePrescriptionUpload} className="space-y-4">
              
              {/* Drag drop zone simulation */}
              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:bg-slate-50 transition-colors cursor-pointer relative">
                <input 
                  type="file" 
                  accept=".pdf,.png,.jpg" 
                  required
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={(e) => {
                    // Start simulated upload instantly
                    simulatePrescriptionUpload(e);
                  }}
                />
                <div className="space-y-2 flex flex-col items-center">
                  <UploadCloud className="w-10 h-10 text-slate-400" />
                  <p className="text-[11px] font-bold text-slate-600">Drag & drop files or click to upload</p>
                  <p className="text-[9px] text-slate-400">PDF, PNG, JPG up to 10MB formats accepted</p>
                </div>
              </div>

              {/* Progress bar */}
              {uploading && (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[9px] font-bold text-slate-500 uppercase">
                    <span>Verifying Prescription Authenticity...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-primary-600 h-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowPrescriptionModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 bg-primary-700 text-white font-bold py-2.5 rounded-xl text-xs hover:bg-primary-800 disabled:opacity-50"
                >
                  Upload File
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* SHOPPING CART DRAWER */}
      {showCart && (
        <div className="fixed inset-0 z-50 bg-black/60 flex justify-end">
          <div className="bg-white w-full max-w-md h-full flex flex-col justify-between shadow-2xl animate-slideLeft">
            
            {/* Header */}
            <div className="bg-slate-50 px-6 py-5 border-b border-slate-200/50 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-primary-600" />
                <h3 className="font-extrabold text-slate-900 text-base">Your Cart</h3>
                <span className="bg-primary-100 text-primary-700 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)} Items
                </span>
              </div>
              <button 
                onClick={() => setShowCart(false)}
                className="p-1.5 rounded-full hover:bg-slate-200 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items list */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
              {cart.length === 0 ? (
                <div className="text-center py-20 text-slate-400 space-y-3">
                  <ShoppingBag className="w-12 h-12 mx-auto text-slate-200" />
                  <p className="font-semibold text-sm">Your medical cart is empty.</p>
                  <button 
                    onClick={() => setShowCart(false)} 
                    className="text-primary-700 font-bold text-xs hover:underline"
                  >
                    Continue shopping
                  </button>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="flex gap-4 p-4 border border-slate-100 rounded-2xl hover:bg-slate-50/50">
                    <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-xl shrink-0 border border-slate-100" />
                    <div className="flex-1 flex flex-col justify-between space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-slate-800 text-xs line-clamp-1">{item.name}</h4>
                          <p className="text-[9px] text-slate-400 font-medium uppercase mt-0.5">{item.category}</p>
                        </div>
                        <button 
                          onClick={() => handleRemoveFromCart(item.id)}
                          className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2 border border-slate-200 rounded-lg p-0.5">
                          <button 
                            onClick={() => updateCartQuantity(item.id, -1)}
                            className="p-1 hover:bg-slate-100 text-slate-500 rounded"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold text-slate-800 w-4 text-center">{item.quantity}</span>
                          <button 
                            onClick={() => updateCartQuantity(item.id, 1)}
                            className="p-1 hover:bg-slate-100 text-slate-500 rounded"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <p className="font-bold text-slate-800 text-xs">₹{item.price * item.quantity}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Calculations and Actions */}
            <div className="border-t border-slate-200/50 p-6 bg-slate-50 space-y-5">
              
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-850">₹{cartSubtotal}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Tax (CGST/SGST 5%)</span>
                  <span className="font-semibold text-slate-850">₹{cartTax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Shipping Fee</span>
                  <span className="font-semibold text-slate-850">
                    {shippingFee === 0 ? "FREE" : `₹${shippingFee}`}
                  </span>
                </div>
                <div className="flex justify-between text-slate-900 font-extrabold text-sm border-t border-slate-200 pt-2.5">
                  <span>Estimated Total</span>
                  <span>₹{cartTotal.toFixed(2)}</span>
                </div>
              </div>

              <button
                disabled={cart.length === 0}
                onClick={() => {
                  setShowCart(false);
                  setShowCheckout(true);
                  setCheckoutStep(1);
                }}
                className="w-full bg-primary-700 hover:bg-primary-800 disabled:opacity-50 text-white font-bold py-3 rounded-2xl text-xs transition-colors shadow-md text-center"
              >
                Proceed to Checkout
              </button>
            </div>

          </div>
        </div>
      )}

      {/* CHECKOUT MODAL WINDOW */}
      {showCheckout && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] w-full max-w-lg overflow-hidden shadow-2xl animate-scaleIn">
            
            {/* Step header bar */}
            <div className="bg-slate-50 border-b border-slate-100 p-6 flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">Secure Checkout Checkout</h3>
                <p className="text-[10px] text-slate-400">Order ID verification & medical supply routing</p>
              </div>
              {checkoutStep < 3 && (
                <button onClick={() => setShowCheckout(false)} className="p-1 rounded-full hover:bg-slate-200 text-slate-500">
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Check steps bar */}
            {checkoutStep < 3 && (
              <div className="flex px-6 pt-4 text-xs font-semibold justify-center gap-10">
                <span className={`pb-2 border-b-2 flex items-center gap-1.5 ${
                  checkoutStep === 1 ? "border-primary-600 text-primary-700" : "border-transparent text-slate-400"
                }`}>
                  <Truck className="w-4 h-4" /> Shipping
                </span>
                <span className={`pb-2 border-b-2 flex items-center gap-1.5 ${
                  checkoutStep === 2 ? "border-primary-600 text-primary-700" : "border-transparent text-slate-400"
                }`}>
                  <CreditCard className="w-4 h-4" /> Billing / Pay
                </span>
              </div>
            )}

            {/* Form body */}
            <form onSubmit={processCheckout} className="p-6 space-y-6">
              
              {/* STEP 1: SHIPPING ADDRESS */}
              {checkoutStep === 1 && (
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-700">Delivery Address Details</h4>
                  
                  <div className="space-y-3">
                    <div className="space-y-1 text-xs">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Recipient Name</label>
                      <input 
                        type="text" 
                        value={shippingAddress.name}
                        onChange={(e) => setShippingAddress({...shippingAddress, name: e.target.value})}
                        required
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1 text-xs">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Contact Phone</label>
                        <input 
                          type="text" 
                          value={shippingAddress.phone}
                          onChange={(e) => setShippingAddress({...shippingAddress, phone: e.target.value})}
                          required
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1 text-xs">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">ZIP / Postal Code</label>
                        <input 
                          type="text" 
                          value={shippingAddress.zip}
                          onChange={(e) => setShippingAddress({...shippingAddress, zip: e.target.value})}
                          required
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1 text-xs">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Street Address</label>
                      <input 
                        type="text" 
                        value={shippingAddress.street}
                        onChange={(e) => setShippingAddress({...shippingAddress, street: e.target.value})}
                        required
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="w-full bg-primary-700 text-white font-bold py-3.5 rounded-2xl text-xs transition-colors mt-4"
                  >
                    Continue to Payment
                  </button>
                </div>
              )}

              {/* STEP 2: BILLING/PAYMENT */}
              {checkoutStep === 2 && (
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-700">Payment Gateway Authorization</h4>
                  
                  <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl space-y-1 text-xs">
                    <div className="flex justify-between text-slate-500">
                      <span>Total Amount Payable</span>
                      <span className="font-extrabold text-slate-900 text-sm">₹{cartTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-1 text-xs">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Card Number</label>
                      <div className="relative">
                        <input 
                          type="text" 
                          value={paymentDetails.cardNumber}
                          onChange={(e) => setPaymentDetails({...paymentDetails, cardNumber: e.target.value})}
                          required
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs focus:outline-none"
                        />
                        <CreditCard className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1 text-xs">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Expiration Date</label>
                        <input 
                          type="text" 
                          placeholder="MM/YY"
                          value={paymentDetails.expiry}
                          onChange={(e) => setPaymentDetails({...paymentDetails, expiry: e.target.value})}
                          required
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1 text-xs">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">CVV Security Code</label>
                        <input 
                          type="password" 
                          value={paymentDetails.cvv}
                          onChange={(e) => setPaymentDetails({...paymentDetails, cvv: e.target.value})}
                          required
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <button 
                      type="button" 
                      onClick={() => setCheckoutStep(1)}
                      className="flex-1 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs"
                    >
                      Back
                    </button>
                    <button 
                      type="submit" 
                      className="flex-1 bg-primary-700 text-white font-bold py-3 rounded-xl text-xs hover:bg-primary-800 shadow-md"
                    >
                      Pay and Confirm Order
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: ORDER SUCCESS INVOICE RECEIPT */}
              {checkoutStep === 3 && orderInvoice && (
                <div className="text-center space-y-6 py-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  
                  <div className="space-y-1">
                    <h3 className="font-extrabold text-xl text-slate-900">Order Confirmed!</h3>
                    <p className="text-xs text-slate-500">Your clinical supplies order is registered successfully.</p>
                  </div>

                  {/* Invoice card */}
                  <div className="bg-slate-50 border border-slate-200/50 rounded-2xl p-4 text-left space-y-3.5 text-xs">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                      <span className="text-[9px] font-bold text-slate-400 uppercase">Order ID</span>
                      <span className="font-bold text-slate-800">{orderInvoice.orderId}</span>
                    </div>

                    <div className="space-y-1.5 max-h-[100px] overflow-y-auto pr-1">
                      {orderInvoice.items.map((it) => (
                        <div key={it.id} className="flex justify-between text-slate-600 font-medium">
                          <span>{it.name} (x{it.quantity})</span>
                          <span>₹{it.price * it.quantity}</span>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-slate-200/50 pt-2 space-y-1 font-semibold text-slate-500">
                      <div className="flex justify-between text-[11px]">
                        <span>Subtotal</span>
                        <span>₹{orderInvoice.subtotal}</span>
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-900 font-bold border-t border-slate-100 pt-1.5">
                        <span>Total Paid (incl. Tax)</span>
                        <span>₹{orderInvoice.total.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="border-t border-slate-200/50 pt-3 text-[10px] text-slate-500 space-y-1">
                      <p className="font-bold text-slate-700 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-primary-600 shrink-0" />
                        <span>Delivery Address</span>
                      </p>
                      <p className="pl-4 font-semibold text-slate-800">{orderInvoice.shippingAddress.name}</p>
                      <p className="pl-4">{orderInvoice.shippingAddress.street}, {orderInvoice.shippingAddress.city} - {orderInvoice.shippingAddress.zip}</p>
                      <p className="pl-4">Phone: {orderInvoice.shippingAddress.phone}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowCheckout(false)}
                    className="w-full bg-primary-700 hover:bg-primary-800 text-white font-bold py-3.5 rounded-2xl text-xs transition-colors shadow-md"
                  >
                    Back to Catalog
                  </button>
                </div>
              )}

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
