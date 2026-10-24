
import "./CabBooking.css";

import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Car,
  CheckCircle2,
  Clock,
  CreditCard,
  Mail,
  MapPin,
  ShieldCheck,
  Star,
  Users,
  UserRound,
  Phone,
} from "lucide-react";

function CabBooking() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  // Trip type
  const tripType = params.get("tripType") || params.get("type") || "Outstation";
  const isRental = tripType.toLowerCase().includes("rental");

  // Local date: YYYY-MM-DD
  const today = new Date();

  const localToday = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");

  // Read date from the previous page using common parameter names
  const incomingDate =
    params.get("date") ||
    params.get("pickupDate") ||
    params.get("departDate") ||
    params.get("departureDate") ||
    "";

  // Use the incoming date if valid; otherwise use today
  const initialPickupDate =
    incomingDate && incomingDate >= localToday
      ? incomingDate
      : localToday;

  // Selected cab details
  const cab = {
    id: params.get("cabId") || params.get("id") || "cab",
    name: params.get("name") || "Sedan",
    vehicle: params.get("vehicle") || "Dzire / Etios",
    seats: Math.max(1, Number(params.get("seats") || 4)),
    rating: params.get("rating") || "4.7",
    price: Math.max(0, Number(params.get("price") || 1499)),
    image: params.get("image") || "",
  };

  // Booking form
  const [form, setForm] = useState(() => ({
    from: params.get("from") || params.get("pickup") || "",
    to: params.get("to") || params.get("destination") || "",
    date: initialPickupDate,
    time: params.get("time") || params.get("pickupTime") || "10:00",
    travellers: params.get("travellers") || "1",
    fullName: "",
    mobile: "",
    email: "",
  }));

  const [imageError, setImageError] = useState(false);

  const updateField = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const formatPrice = (price) =>
    `₹${Number(price).toLocaleString("en-IN")}`;

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!form.from.trim()) {
      alert("Please enter pickup location.");
      return;
    }

    if (!isRental && !form.to.trim()) {
      alert("Please enter destination.");
      return;
    }

    if (!form.date || form.date < localToday) {
      alert("Please select a valid pickup date.");
      return;
    }

    if (!form.time) {
      alert("Please select pickup time.");
      return;
    }

    if (!form.fullName.trim()) {
      alert("Please enter traveller name.");
      return;
    }

    if (!/^[6-9]\d{9}$/.test(form.mobile)) {
      alert("Please enter a valid 10-digit Indian mobile number.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      alert("Please enter a valid email address.");
      return;
    }

    const paymentParams = new URLSearchParams({
      type: "cab",
      cabId: String(cab.id),
      id: String(cab.id),
      name: cab.name,
      vehicle: cab.vehicle,
      seats: String(cab.seats),
      rating: String(cab.rating),
      price: String(cab.price),
      tripType,
      from: form.from.trim(),
      to: form.to.trim(),
      date: form.date,
      pickupDate: form.date,
      time: form.time,
      travellers: form.travellers,
      fullName: form.fullName.trim(),
      mobile: form.mobile,
      email: form.email.trim(),
    });

    if (cab.image) {
      paymentParams.set("image", cab.image);
    }

    navigate(
      `/payment/${encodeURIComponent(String(cab.id))}?${paymentParams.toString()}`
    );
  };

  return (
    <main className="cab-booking-page">
      <div className="cab-booking-container">
        <button
          type="button"
          className="cab-back-btn"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={17} />
          Back to Cabs
        </button>

        <header className="cab-booking-header">
          <div>
            <span className="cab-booking-eyebrow">CAB BOOKING</span>
            <h1>Complete Your Cab Booking</h1>
            <p>
              Confirm your trip details and traveller information to continue.
            </p>
          </div>

          <div className="cab-booking-secure">
            <ShieldCheck size={19} />
            <span>Secure Booking</span>
          </div>
        </header>

        <div className="cab-booking-layout">
          <form className="cab-booking-form" onSubmit={handleSubmit}>
            <section className="cab-booking-section">
              <div className="cab-section-heading">
                <div className="cab-section-icon">
                  <MapPin size={20} />
                </div>
                <div>
                  <h2>Trip Details</h2>
                  <p>Where and when would you like to travel?</p>
                </div>
              </div>

              <div className="cab-booking-fields">
                <label>
                  <span>Pickup Location *</span>
                  <div className="cab-input-wrap">
                    <MapPin size={17} />
                    <input
                      name="from"
                      value={form.from}
                      onChange={updateField}
                      placeholder="Enter pickup location"
                      autoComplete="street-address"
                      required
                    />
                  </div>
                </label>

                <label>
                  <span>Drop Location {isRental ? "(Optional)" : "*"}</span>
                  <div className="cab-input-wrap">
                    <MapPin size={17} />
                    <input
                      name="to"
                      value={form.to}
                      onChange={updateField}
                      placeholder={
                        isRental
                          ? "Enter destination if applicable"
                          : "Enter destination"
                      }
                      required={!isRental}
                    />
                  </div>
                </label>

                <label>
                  <span>Pickup Date *</span>
                  <div className="cab-input-wrap">
                    <CalendarDays size={17} />
                    <input
                      type="date"
                      name="date"
                      min={localToday}
                      value={form.date}
                      onChange={updateField}
                      required
                    />
                  </div>
                </label>

                <label>
                  <span>Pickup Time *</span>
                  <div className="cab-input-wrap">
                    <Clock size={17} />
                    <input
                      type="time"
                      name="time"
                      value={form.time}
                      onChange={updateField}
                      required
                    />
                  </div>
                </label>

                <label className="cab-booking-full-width">
                  <span>Number of Travellers *</span>
                  <div className="cab-input-wrap">
                    <Users size={17} />
                    <select
                      name="travellers"
                      value={form.travellers}
                      onChange={updateField}
                      required
                    >
                      {Array.from(
                        { length: cab.seats },
                        (_, index) => index + 1
                      ).map((count) => (
                        <option key={count} value={count}>
                          {count} {count === 1 ? "Traveller" : "Travellers"}
                        </option>
                      ))}
                    </select>
                  </div>
                  <small className="cab-field-hint">
                    Maximum capacity: {cab.seats} passengers.
                  </small>
                </label>
              </div>
            </section>

            <section className="cab-booking-section">
              <div className="cab-section-heading">
                <div className="cab-section-icon">
                  <UserRound size={20} />
                </div>
                <div>
                  <h2>Traveller Details</h2>
                  <p>Enter the details of the primary traveller.</p>
                </div>
              </div>

              <div className="cab-booking-fields">
                <label>
                  <span>Full Name *</span>
                  <div className="cab-input-wrap">
                    <UserRound size={17} />
                    <input
                      type="text"
                      name="fullName"
                      value={form.fullName}
                      onChange={updateField}
                      placeholder="Enter full name"
                      autoComplete="name"
                      required
                    />
                  </div>
                </label>

                <label>
                  <span>Mobile Number *</span>
                  <div className="cab-input-wrap">
                    <Phone size={17} />
                    <input
                      type="tel"
                      name="mobile"
                      value={form.mobile}
                      onChange={updateField}
                      placeholder="10-digit mobile number"
                      inputMode="numeric"
                      pattern="[6-9][0-9]{9}"
                      maxLength={10}
                      autoComplete="tel"
                      required
                    />
                  </div>
                </label>

                <label className="cab-booking-full-width">
                  <span>Email Address *</span>
                  <div className="cab-input-wrap">
                    <Mail size={17} />
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={updateField}
                      placeholder="Enter email address"
                      autoComplete="email"
                      required
                    />
                  </div>
                </label>
              </div>
            </section>

            <div className="cab-booking-form-note">
              <ShieldCheck size={18} />
              <p>
                Please review your trip and contact details before continuing
                to payment.
              </p>
            </div>

            <button type="submit" className="cab-continue-payment-btn">
              <CreditCard size={18} />
              Continue to Payment
              <ArrowRight size={17} />
            </button>
          </form>

          <aside className="cab-booking-summary">
            <div className="cab-summary-top">
              <div>
                <span className="cab-summary-eyebrow">YOUR SELECTION</span>
                <h2>Booking Summary</h2>
              </div>
              <span className="cab-summary-check">
                <CheckCircle2 size={20} />
              </span>
            </div>

            <div className="cab-summary-vehicle">
              <div className="cab-summary-image">
                {cab.image && !imageError ? (
                  <img
                    src={cab.image}
                    alt={cab.name}
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <Car size={39} />
                )}
              </div>

              <div className="cab-summary-vehicle-info">
                <h3>{cab.name}</h3>
                <p>{cab.vehicle}</p>
                <span className="cab-summary-rating">
                  <Star size={13} fill="currentColor" />
                  {cab.rating} Rating
                </span>
              </div>
            </div>

            <div className="cab-summary-capacity">
              <span><Users size={15} /> {cab.seats} Seats</span>
              <span><CheckCircle2 size={15} /> AC</span>
              <span><CheckCircle2 size={15} /> Driver Included</span>
            </div>

            <div className="cab-summary-divider" />

            <h3 className="cab-summary-trip-title">Your Trip Information</h3>

            <div className="cab-summary-feature">
              <MapPin size={17} />
              <div>
                <small>Pickup Location</small>
                <strong>{form.from || "Add pickup location"}</strong>
              </div>
            </div>

            <div className="cab-summary-feature">
              <MapPin size={17} />
              <div>
                <small>Drop Location</small>
                <strong>
                  {form.to || (isRental ? "Not specified" : "Add destination")}
                </strong>
              </div>
            </div>

            <div className="cab-summary-feature">
              <CalendarDays size={17} />
              <div>
                <small>Pickup Date</small>
                <strong>
                  {form.date
                    ? new Date(`${form.date}T00:00:00`).toLocaleDateString(
                        "en-IN",
                        { day: "2-digit", month: "short", year: "numeric" }
                      )
                    : "Select pickup date"}
                </strong>
              </div>
            </div>

            <div className="cab-summary-feature">
              <Clock size={17} />
              <div>
                <small>Pickup Time</small>
                <strong>{form.time || "Select pickup time"}</strong>
              </div>
            </div>

            <div className="cab-summary-feature">
              <Users size={17} />
              <div>
                <small>Travellers</small>
                <strong>
                  {form.travellers}{" "}
                  {Number(form.travellers) === 1 ? "Traveller" : "Travellers"}
                </strong>
              </div>
            </div>

            <div className="cab-summary-price">
              <div className="cab-summary-price-label">
                <span>Estimated Trip Fare</span>
                <span className="cab-summary-price-tag">Estimated</span>
              </div>
              <strong>{formatPrice(cab.price)}</strong>
              <small>
                Final fare may vary according to trip distance, duration, tolls
                and applicable charges.
              </small>
            </div>

            <div className="cab-summary-secure">
              <ShieldCheck size={16} />
              <span>Your booking details are ready for review.</span>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

export default CabBooking;
