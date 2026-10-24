
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  ShieldCheck,
  CalendarDays,
  Users,
  User,
  Mail,
  Phone,
  CreditCard,
  CheckCircle2,
} from "lucide-react";
import "./InsuranceBooking.css";

function InsuranceBooking() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const plan = {
    id: params.get("id") || params.get("insuranceId") || "",
    name: params.get("name") || params.get("planName") || "",
    price: Number(params.get("price") || 0),
    coverage: params.get("coverage") || "",
    duration: params.get("duration") || params.get("durationLabel") || "",
    description: params.get("description") || "",
  };

  const [form, setForm] = useState({
    travelDate: params.get("date") || params.get("travelDate") || "",
    travellers: 1,
    fullName: "",
    mobile: "",
    email: "",
  });

  const [error, setError] = useState("");

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
    setError("");
  };

  const changeTravellers = (amount) => {
    setForm((previous) => ({
      ...previous,
      travellers: Math.max(1, Math.min(20, previous.travellers + amount)),
    }));
  };

  const totalPrice = plan.price * form.travellers;

  const handleSubmit = (event) => {
    event.preventDefault();
    setError("");

    if (!plan.id || !plan.name || plan.price <= 0) {
      setError(
        "Insurance plan details or price are missing. Please select a plan again."
      );
      return;
    }

    if (!form.travelDate) {
      setError("Please select your travel start date.");
      return;
    }

    if (!form.fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!/^[6-9]\d{9}$/.test(form.mobile)) {
      setError("Please enter a valid 10-digit Indian mobile number.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError("Please enter a valid email address.");
      return;
    }

    const paymentParams = new URLSearchParams({
      type: "insurance",
      insuranceId: String(plan.id),
      name: plan.name,
      price: String(totalPrice),
      plan: plan.name,
      coverage: plan.coverage,
      durationLabel: plan.duration,
      date: form.travelDate,
      travellers: String(form.travellers),
      fullName: form.fullName.trim(),
      mobile: form.mobile,
      email: form.email.trim(),
    });

    navigate(
      `/payment/${encodeURIComponent(plan.id)}?${paymentParams.toString()}`
    );
  };

  if (!plan.id || !plan.name || plan.price <= 0) {
    return (
      <div className="insurance-booking-page">
        <div className="insurance-booking-card">
          <ShieldCheck size={42} />
          <h2>Insurance Plan Not Found</h2>
          <p>
            Select a valid insurance plan from the insurance results page.
          </p>
          <button
            type="button"
            className="insurance-primary-btn"
            onClick={() => navigate("/insurance-results")}
          >
            Explore Insurance
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="insurance-booking-page">
      <div className="insurance-booking-container">
        <button
          type="button"
          className="insurance-back-btn"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={18} />
          Back to Insurance
        </button>

        <div className="insurance-booking-header">
          <span className="insurance-booking-label">
            TRAVEL PROTECTION
          </span>
          <h1>Complete Insurance Booking</h1>
          <p>Choose your travel date and provide the policyholder details.</p>
        </div>

        <div className="insurance-booking-layout">
          <form className="insurance-booking-form" onSubmit={handleSubmit}>
            <section className="insurance-booking-section">
              <h2>
                <ShieldCheck size={22} />
                Selected Insurance Plan
              </h2>

              <div className="insurance-plan-card">
                <div className="insurance-plan-icon">
                  <ShieldCheck size={30} />
                </div>

                <div className="insurance-plan-content">
                  <h3>{plan.name}</h3>
                  {plan.description && <p>{plan.description}</p>}

                  {plan.coverage && (
                    <p>
                      <strong>Coverage:</strong> {plan.coverage}
                    </p>
                  )}

                  {plan.duration && (
                    <p>
                      <strong>Duration:</strong> {plan.duration}
                    </p>
                  )}

                  <p className="insurance-per-person-price">
                    ₹{plan.price.toLocaleString("en-IN")} per traveller
                  </p>
                </div>
              </div>
            </section>

            <section className="insurance-booking-section">
              <h2>
                <CalendarDays size={22} />
                Travel Details
              </h2>

              <div className="insurance-field">
                <label htmlFor="travelDate">Travel Start Date</label>
                <input
                  id="travelDate"
                  name="travelDate"
                  type="date"
                  value={form.travelDate}
                  onChange={updateField}
                  required
                />
              </div>

              <div className="insurance-traveller-row">
                <div>
                  <strong>Number of Travellers</strong>
                  <p>Choose how many people need coverage.</p>
                </div>

                <div className="insurance-counter">
                  <button
                    type="button"
                    aria-label="Remove traveller"
                    onClick={() => changeTravellers(-1)}
                  >
                    −
                  </button>

                  <strong>{form.travellers}</strong>

                  <button
                    type="button"
                    aria-label="Add traveller"
                    onClick={() => changeTravellers(1)}
                  >
                    +
                  </button>
                </div>
              </div>
            </section>

            <section className="insurance-booking-section">
              <h2>
                <User size={22} />
                Policyholder Details
              </h2>

              <div className="insurance-field">
                <label htmlFor="fullName">Full Name</label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={form.fullName}
                  onChange={updateField}
                  placeholder="Enter policyholder full name"
                  autoComplete="name"
                  required
                />
              </div>

              <div className="insurance-field-grid">
                <div className="insurance-field">
                  <label htmlFor="mobile">Mobile Number</label>
                  <input
                    id="mobile"
                    name="mobile"
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    value={form.mobile}
                    onChange={updateField}
                    placeholder="10-digit mobile"
                    autoComplete="tel-national"
                    required
                  />
                </div>

                <div className="insurance-field">
                  <label htmlFor="email">Email Address</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={updateField}
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>
            </section>

            <div className="insurance-important-note">
              <CheckCircle2 size={18} />
              <span>
                Check the plan details before continuing. This project currently
                demonstrates a booking flow; it does not issue a real insurance
                policy.
              </span>
            </div>

            {error && (
              <div className="insurance-booking-error" role="alert">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="insurance-primary-btn insurance-continue-btn"
            >
              <CreditCard size={19} />
              Continue to Payment
            </button>
          </form>

          <aside className="insurance-booking-summary">
            <div className="insurance-summary-icon">
              <ShieldCheck size={35} />
            </div>

            <h2>Premium Summary</h2>
            <p className="insurance-summary-name">{plan.name}</p>

            <div className="insurance-summary-line">
              <span>Price per traveller</span>
              <strong>₹{plan.price.toLocaleString("en-IN")}</strong>
            </div>

            <div className="insurance-summary-line">
              <span>Travellers</span>
              <strong>{form.travellers}</strong>
            </div>

            <div className="insurance-summary-line">
              <span>Start Date</span>
              <strong>
                {form.travelDate || "Not selected"}
              </strong>
            </div>

            <div className="insurance-summary-total">
              <span>Total Premium</span>
              <strong>
                ₹{totalPrice.toLocaleString("en-IN")}
              </strong>
            </div>

            <div className="insurance-summary-security">
              <ShieldCheck size={18} />
              <span>Review your details before proceeding to payment.</span>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default InsuranceBooking;