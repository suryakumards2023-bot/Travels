
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  Bus,
  MapPin,
  CalendarDays,
  Clock,
  Users,
  Star,
  CreditCard,
  Armchair,
  ShieldCheck,
} from "lucide-react";

import "./Search.css";

function BusBooking() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  // Selected bus details from BusResult.jsx
  const bus = {
    id: params.get("id") || "",
    name: params.get("name") || "Selected Bus",
    subtitle: params.get("subtitle") || "Bus Service",
    price: Number(params.get("price") || 0),
    rating: params.get("rating") || "4.5",
    ac: params.get("ac") === "true",
    seatType: params.get("seatType") || "Seater",
    departure: params.get("departure") || "",
    arrival: params.get("arrival") || "",
    duration: params.get("duration") || "",
    from: params.get("from") || "",
    to: params.get("to") || "",
    date: params.get("date") || "",
  };

  const [form, setForm] = useState({
    fullName: "",
    mobile: "",
    email: "",
    seats: "1",
  });

  const [errors, setErrors] = useState({});

  const updateField = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.fullName.trim()) {
      newErrors.fullName = "Please enter passenger name.";
    }

    if (!/^[6-9]\d{9}$/.test(form.mobile)) {
      newErrors.mobile = "Enter a valid 10-digit mobile number.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Enter a valid email address.";
    }

    if (!form.seats || Number(form.seats) < 1) {
      newErrors.seats = "Select at least one seat.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!bus.id || !bus.from || !bus.to || !bus.date || bus.price <= 0) {
      alert(
        "Bus details are missing. Please go back and select a bus again."
      );
      return;
    }

    const totalPrice = bus.price * Number(form.seats);

    const paymentParams = new URLSearchParams({
      type: "bus",
      busId: String(bus.id),
      name: bus.name,
      subtitle: bus.subtitle,
      price: String(totalPrice),
      basePrice: String(bus.price),
      rating: String(bus.rating),
      ac: String(bus.ac),
      seatType: bus.seatType,
      departure: bus.departure,
      arrival: bus.arrival,
      duration: bus.duration,
      from: bus.from,
      to: bus.to,
      date: bus.date,
      seats: form.seats,
      fullName: form.fullName.trim(),
      mobile: form.mobile,
      email: form.email.trim(),
    });

    navigate(
      `/payment/${encodeURIComponent(bus.id)}?${paymentParams.toString()}`
    );
  };

  const totalPrice = bus.price * Number(form.seats);

  // Prevent opening the form without selected bus details.
  if (!bus.id || !bus.from || !bus.to || !bus.date || bus.price <= 0) {
    return (
      <main className="bus-booking-page">
        <div className="bus-booking-container">
          <div className="bus-booking-not-found">
            <Bus size={48} />
            <h1>Bus Details Not Found</h1>
            <p>Please search your route and select a bus first.</p>
            <button
              type="button"
              className="bus-booking-primary-btn"
              onClick={() => navigate("/bus-result")}
            >
              Search Buses
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="bus-booking-page">
      <div className="bus-booking-container">
        <button
          type="button"
          className="bus-booking-back-btn"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={17} />
          Back to Buses
        </button>

        <header className="bus-booking-header">
          <span className="bus-booking-eyebrow">
            <ShieldCheck size={16} />
            Secure Booking
          </span>
          <h1>Complete Your Bus Booking</h1>
          <p>Enter passenger details to continue to payment.</p>
        </header>

        <div className="bus-booking-layout">
          <form
            className="bus-booking-form"
            onSubmit={handleSubmit}
            noValidate
          >
            <section className="bus-booking-section">
              <h2>
                <Users size={21} />
                Passenger Details
              </h2>

              <div className="bus-booking-fields">
                <label>
                  Full Name
                  <input
                    type="text"
                    name="fullName"
                    value={form.fullName}
                    onChange={updateField}
                    placeholder="Enter passenger's full name"
                    autoComplete="name"
                    maxLength={100}
                    required
                  />
                  {errors.fullName && (
                    <small className="bus-booking-error">
                      {errors.fullName}
                    </small>
                  )}
                </label>

                <label>
                  Mobile Number
                  <input
                    type="tel"
                    name="mobile"
                    value={form.mobile}
                    onChange={updateField}
                    placeholder="10-digit mobile number"
                    inputMode="numeric"
                    maxLength={10}
                    autoComplete="tel"
                    required
                  />
                  {errors.mobile && (
                    <small className="bus-booking-error">
                      {errors.mobile}
                    </small>
                  )}
                </label>

                <label className="bus-booking-full-width">
                  Email Address
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={updateField}
                    placeholder="Enter email address"
                    autoComplete="email"
                    maxLength={150}
                    required
                  />
                  {errors.email && (
                    <small className="bus-booking-error">
                      {errors.email}
                    </small>
                  )}
                </label>

                <label className="bus-booking-full-width">
                  Number of Seats
                  <select
                    name="seats"
                    value={form.seats}
                    onChange={updateField}
                  >
                    {[1, 2, 3, 4, 5, 6].map((count) => (
                      <option key={count} value={String(count)}>
                        {count} {count === 1 ? "Seat" : "Seats"}
                      </option>
                    ))}
                  </select>
                  {errors.seats && (
                    <small className="bus-booking-error">
                      {errors.seats}
                    </small>
                  )}
                </label>
              </div>
            </section>

            <div className="bus-booking-notice">
              <ShieldCheck size={19} />
              <p>
                Please check your journey details and passenger contact
                information before continuing.
              </p>
            </div>

            <button
              type="submit"
              className="bus-booking-primary-btn"
            >
              <CreditCard size={19} />
              Continue to Payment
            </button>
          </form>

          <aside className="bus-booking-summary">
            <h2>Selected Bus</h2>

            <div className="bus-booking-operator">
              <div className="bus-booking-icon">
                <Bus size={32} />
              </div>
              <div>
                <h3>{bus.name}</h3>
                <p>{bus.subtitle}</p>
              </div>
            </div>

            <div className="bus-booking-rating">
              <Star size={15} fill="currentColor" />
              {bus.rating} Rating
            </div>

            <div className="bus-booking-feature">
              <MapPin size={17} />
              <div>
                <small>Journey</small>
                <strong>{bus.from} → {bus.to}</strong>
              </div>
            </div>

            <div className="bus-booking-feature">
              <CalendarDays size={17} />
              <div>
                <small>Travel Date</small>
                <strong>{bus.date}</strong>
              </div>
            </div>

            <div className="bus-booking-feature">
              <Clock size={17} />
              <div>
                <small>Departure</small>
                <strong>{bus.departure || "Not specified"}</strong>
              </div>
            </div>

            <div className="bus-booking-feature">
              <Clock size={17} />
              <div>
                <small>Arrival · Duration</small>
                <strong>
                  {bus.arrival || "Not specified"}
                  {bus.duration ? ` · ${bus.duration}` : ""}
                </strong>
              </div>
            </div>

            <div className="bus-booking-feature">
              <Armchair size={17} />
              <div>
                <small>Bus Type</small>
                <strong>
                  {bus.ac ? "AC" : "Non-AC"} · {bus.seatType}
                </strong>
              </div>
            </div>

            <div className="bus-booking-feature">
              <Users size={17} />
              <div>
                <small>Passengers</small>
                <strong>
                  {form.seats} {Number(form.seats) === 1 ? "Seat" : "Seats"}
                </strong>
              </div>
            </div>

            <div className="bus-booking-price">
              <div>
                <span>Price per seat</span>
                <strong>
                  ₹{bus.price.toLocaleString("en-IN")}
                </strong>
              </div>
              <div>
                <span>Number of seats</span>
                <strong>{form.seats}</strong>
              </div>
              <div className="bus-booking-total">
                <span>Total Fare</span>
                <strong>
                  ₹{totalPrice.toLocaleString("en-IN")}
                </strong>
              </div>
              <small>
                Demo fare based on the selected bus. Final charges may vary.
              </small>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

export default BusBooking;