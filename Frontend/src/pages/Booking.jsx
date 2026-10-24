import "./Booking.css"
import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  Clock3,
  Mail,
  MapPin,
  Minus,
  Phone,
  Plus,
  ShieldCheck,
  Star,
  User,
  Users,
} from "lucide-react";

import tours from "../data/tours";
import "./Booking.css";

const Booking = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const tour = tours.find((item) => String(item.id) === String(id));

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    mobile: "",
    travelDate: "",
    adults: 1,
    children: 0,
    infants: 0,
    terms: false,
  });

  const [errors, setErrors] = useState({});

  if (!tour) {
    return (
      <div className="booking-not-found">
        <h2>Tour Not Found</h2>

        <p>
          The tour you are trying to book does not exist.
        </p>

        <Link to="/tours" className="booking-back-button">
          <ArrowLeft size={17} />
          Back to Tours
        </Link>
      </div>
    );
  }

  /* =========================================
     PRICE CALCULATION
  ========================================= */

  const adultPrice = tour.price;
  const childPrice = Math.round(tour.price * 0.6);
  const infantPrice = 0;

  const adultTotal =
    formData.adults * adultPrice;

  const childTotal =
    formData.children * childPrice;

  const infantTotal =
    formData.infants * infantPrice;

  const totalPrice =
    adultTotal +
    childTotal +
    infantTotal;


  /* =========================================
     FORM INPUT
  ========================================= */

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));
  };


  /* =========================================
     TRAVELLER COUNTER
  ========================================= */

  const updateTraveller = (type, action) => {
    setFormData((previous) => {

      let current = previous[type];

      if (action === "increase") {
        current += 1;
      }

      if (action === "decrease") {
        current -= 1;
      }

      if (type === "adults") {
        current = Math.max(1, current);
      } else {
        current = Math.max(0, current);
      }

      return {
        ...previous,
        [type]: current,
      };
    });
  };


  /* =========================================
     VALIDATION
  ========================================= */

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName =
        "Full name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email =
        "Email is required";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        formData.email
      )
    ) {
      newErrors.email =
        "Enter a valid email address";
    }

    if (!formData.mobile.trim()) {
      newErrors.mobile =
        "Mobile number is required";
    } else if (
      !/^[6-9]\d{9}$/.test(
        formData.mobile
      )
    ) {
      newErrors.mobile =
        "Enter a valid 10-digit mobile number";
    }

    if (!formData.travelDate) {
      newErrors.travelDate =
        "Travel date is required";
    }

    if (!formData.terms) {
      newErrors.terms =
        "Please accept the terms and conditions";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };


  /* =========================================
     CONTINUE TO PAYMENT
  ========================================= */

  const handleSubmit = (event) => {
    event.preventDefault();

    const isValid = validateForm();

    if (!isValid) {
      return;
    }

    navigate(`/payment/${tour.id}`, {
      state: {
        tour,
        booking: formData,
        totalPrice,
      },
    });
  };


  return (
    <div className="booking-page">

      <div className="booking-container">


        {/* =====================================
            BACK
        ===================================== */}

        <Link
          to={`/tours/${tour.id}`}
          className="booking-back-link"
        >
          <ArrowLeft size={17} />
          Back to Tour Details
        </Link>


        {/* =====================================
            PAGE HEADER
        ===================================== */}

        <div className="booking-header">

          <div>
            <span className="booking-label">
              SECURE BOOKING
            </span>

            <h1>
              Book Your Tour
            </h1>

            <p>
              Enter your details to continue
              with your booking.
            </p>
          </div>

          <div className="booking-security">

            <ShieldCheck size={19} />

            <span>
              Safe & Secure
            </span>

          </div>

        </div>


        {/* =====================================
            MAIN LAYOUT
        ===================================== */}

        <div className="booking-layout">


          {/* ===================================
              LEFT FORM
          =================================== */}

          <form
            className="booking-form"
            onSubmit={handleSubmit}
          >


            {/* ================================
                CONTACT DETAILS
            ================================= */}

            <section className="booking-section">

              <div className="booking-section-heading">

                <div className="booking-heading-icon">
                  <User size={19} />
                </div>

                <div>
                  <h2>
                    Traveller Details
                  </h2>

                  <p>
                    Enter the primary traveller's
                    contact information.
                  </p>
                </div>

              </div>


              <div className="form-grid">


                {/* FULL NAME */}

                <div className="form-group full-width">

                  <label>
                    Full Name
                    <span>*</span>
                  </label>

                  <div
                    className={`input-wrapper ${
                      errors.fullName
                        ? "input-error"
                        : ""
                    }`}
                  >

                    <User size={17} />

                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                    />

                  </div>

                  {errors.fullName && (
                    <small className="error-text">
                      {errors.fullName}
                    </small>
                  )}

                </div>


                {/* EMAIL */}

                <div className="form-group">

                  <label>
                    Email Address
                    <span>*</span>
                  </label>

                  <div
                    className={`input-wrapper ${
                      errors.email
                        ? "input-error"
                        : ""
                    }`}
                  >

                    <Mail size={17} />

                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="example@email.com"
                    />

                  </div>

                  {errors.email && (
                    <small className="error-text">
                      {errors.email}
                    </small>
                  )}

                </div>


                {/* MOBILE */}

                <div className="form-group">

                  <label>
                    Mobile Number
                    <span>*</span>
                  </label>

                  <div
                    className={`input-wrapper ${
                      errors.mobile
                        ? "input-error"
                        : ""
                    }`}
                  >

                    <Phone size={17} />

                    <span className="country-code">
                      +91
                    </span>

                    <input
                      type="tel"
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleChange}
                      maxLength="10"
                      placeholder="10-digit mobile number"
                    />

                  </div>

                  {errors.mobile && (
                    <small className="error-text">
                      {errors.mobile}
                    </small>
                  )}

                </div>


                {/* TRAVEL DATE */}

                <div className="form-group full-width">

                  <label>
                    Travel Date
                    <span>*</span>
                  </label>

                  <div
                    className={`input-wrapper ${
                      errors.travelDate
                        ? "input-error"
                        : ""
                    }`}
                  >

                    <CalendarDays size={17} />

                    <input
                      type="date"
                      name="travelDate"
                      value={formData.travelDate}
                      onChange={handleChange}
                      min={
                        new Date()
                          .toISOString()
                          .split("T")[0]
                      }
                    />

                  </div>

                  {errors.travelDate && (
                    <small className="error-text">
                      {errors.travelDate}
                    </small>
                  )}

                </div>

              </div>

            </section>


            {/* =================================
                TRAVELLERS
            ================================= */}

            <section className="booking-section">

              <div className="booking-section-heading">

                <div className="booking-heading-icon">
                  <Users size={19} />
                </div>

                <div>
                  <h2>
                    Travellers
                  </h2>

                  <p>
                    Select the number of travellers.
                  </p>
                </div>

              </div>


              <div className="traveller-list">


                {/* ADULT */}

                <div className="traveller-row">

                  <div className="traveller-info">

                    <strong>
                      Adults
                    </strong>

                    <span>
                      12+ years
                    </span>

                  </div>


                  <div className="counter">

                    <button
                      type="button"
                      onClick={() =>
                        updateTraveller(
                          "adults",
                          "decrease"
                        )
                      }
                      disabled={
                        formData.adults <= 1
                      }
                    >
                      <Minus size={15} />
                    </button>

                    <strong>
                      {formData.adults}
                    </strong>

                    <button
                      type="button"
                      onClick={() =>
                        updateTraveller(
                          "adults",
                          "increase"
                        )
                      }
                    >
                      <Plus size={15} />
                    </button>

                  </div>

                </div>


                {/* CHILDREN */}

                <div className="traveller-row">

                  <div className="traveller-info">

                    <strong>
                      Children
                    </strong>

                    <span>
                      2–11 years
                    </span>

                  </div>


                  <div className="counter">

                    <button
                      type="button"
                      onClick={() =>
                        updateTraveller(
                          "children",
                          "decrease"
                        )
                      }
                      disabled={
                        formData.children <= 0
                      }
                    >
                      <Minus size={15} />
                    </button>

                    <strong>
                      {formData.children}
                    </strong>

                    <button
                      type="button"
                      onClick={() =>
                        updateTraveller(
                          "children",
                          "increase"
                        )
                      }
                    >
                      <Plus size={15} />
                    </button>

                  </div>

                </div>


                {/* INFANTS */}

                <div className="traveller-row">

                  <div className="traveller-info">

                    <strong>
                      Infants
                    </strong>

                    <span>
                      Below 2 years
                    </span>

                  </div>


                  <div className="counter">

                    <button
                      type="button"
                      onClick={() =>
                        updateTraveller(
                          "infants",
                          "decrease"
                        )
                      }
                      disabled={
                        formData.infants <= 0
                      }
                    >
                      <Minus size={15} />
                    </button>

                    <strong>
                      {formData.infants}
                    </strong>

                    <button
                      type="button"
                      onClick={() =>
                        updateTraveller(
                          "infants",
                          "increase"
                        )
                      }
                    >
                      <Plus size={15} />
                    </button>

                  </div>

                </div>

              </div>

            </section>


            {/* =================================
                TERMS
            ================================= */}

            <section className="booking-section terms-section">

              <label className="terms-checkbox">

                <input
                  type="checkbox"
                  name="terms"
                  checked={formData.terms}
                  onChange={handleChange}
                />

                <span className="custom-checkbox">
                  {formData.terms && (
                    <Check size={13} />
                  )}
                </span>

                <span className="terms-text">
                  I agree to the{" "}
                  <Link to="/terms">
                    Terms & Conditions
                  </Link>{" "}
                  and{" "}
                  <Link to="/privacy">
                    Privacy Policy
                  </Link>.
                </span>

              </label>

              {errors.terms && (
                <small className="error-text terms-error">
                  {errors.terms}
                </small>
              )}

            </section>


            {/* =================================
                MOBILE CONTINUE BUTTON
            ================================= */}

            <button
              type="submit"
              className="mobile-continue-button"
            >
              Continue to Payment
            </button>

          </form>


          {/* ===================================
              RIGHT SUMMARY
          =================================== */}

          <aside className="booking-summary">


            {/* TOUR CARD */}

            <div className="summary-tour-card">

              <div className="summary-image">

                <img
                  src={tour.image}
                  alt={tour.name}
                />

              </div>


              <div className="summary-tour-content">

                <h3>
                  {tour.name}
                </h3>


                <div className="summary-location">

                  <MapPin size={14} />

                  {tour.destination},{" "}
                  {tour.country}

                </div>


                <div className="summary-rating">

                  <span>
                    <Star
                      size={13}
                      fill="currentColor"
                    />
                    {tour.rating}
                  </span>

                  <small>
                    {tour.reviews} Reviews
                  </small>

                </div>

              </div>

            </div>


            {/* TRIP INFO */}

            <div className="summary-info">

              <div>

                <Clock3 size={17} />

                <span>
                  Duration
                </span>

                <strong>
                  {tour.duration}
                </strong>

              </div>


              <div>

                <CalendarDays size={17} />

                <span>
                  Travel Date
                </span>

                <strong>
                  {formData.travelDate
                    ? new Date(
                        formData.travelDate
                      ).toLocaleDateString(
                        "en-IN",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        }
                      )
                    : "Select date"}
                </strong>

              </div>


              <div>

                <Users size={17} />

                <span>
                  Travellers
                </span>

                <strong>
                  {formData.adults +
                    formData.children +
                    formData.infants}
                </strong>

              </div>

            </div>


            {/* PRICE */}

            <div className="price-breakdown">

              <h3>
                Price Summary
              </h3>


              <div className="price-row">

                <span>
                  Adults × {formData.adults}
                </span>

                <strong>
                  ₹
                  {adultTotal.toLocaleString(
                    "en-IN"
                  )}
                </strong>

              </div>


              <div className="price-row">

                <span>
                  Children × {formData.children}
                </span>

                <strong>
                  ₹
                  {childTotal.toLocaleString(
                    "en-IN"
                  )}
                </strong>

              </div>


              <div className="price-row">

                <span>
                  Infants × {formData.infants}
                </span>

                <strong>
                  ₹
                  {infantTotal.toLocaleString(
                    "en-IN"
                  )}
                </strong>

              </div>


              <div className="price-divider" />


              <div className="price-total">

                <span>
                  Total Amount
                </span>

                <strong>
                  ₹
                  {totalPrice.toLocaleString(
                    "en-IN"
                  )}
                </strong>

              </div>


              <span className="price-note">
                Taxes & charges included
              </span>

            </div>


            {/* DESKTOP BUTTON */}

            <button
              type="button"
              className="continue-button"
              onClick={handleSubmit}
            >
              Continue to Payment
            </button>


            {/* SECURITY */}

            <div className="summary-security">

              <ShieldCheck size={20} />

              <div>

                <strong>
                  Your booking is secure
                </strong>

                <span>
                  Your personal information is
                  protected.
                </span>

              </div>

            </div>

          </aside>

        </div>

      </div>

    </div>
  );
};

export default Booking;