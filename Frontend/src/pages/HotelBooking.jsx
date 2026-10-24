
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  Hotel,
  MapPin,
  Users,
  CreditCard,
  Minus,
  Plus,
  Star,
  ShieldCheck,
  CheckCircle2,
  BedDouble,
} from "lucide-react";
import "./HotelBooking.css";

const DEFAULT_HOTEL_IMAGE =
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=85";

function getHotelImages(params) {
  const rawImages = params.get("images");

  if (!rawImages) return [DEFAULT_HOTEL_IMAGE];

  try {
    const parsed = JSON.parse(rawImages);
    const images = Array.isArray(parsed) ? parsed : [parsed];

    const validImages = images.filter(
      (image) => typeof image === "string" && image.trim()
    );

    return validImages.length ? validImages : [DEFAULT_HOTEL_IMAGE];
  } catch {
    return [rawImages.startsWith("http") ? rawImages : DEFAULT_HOTEL_IMAGE];
  }
}

function HotelBooking() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const hotel = {
    id: params.get("id") || params.get("hotelId") || "",
    name:
      params.get("hotelName") ||
      params.get("name") ||
      "Hotel Reservation",
    location: params.get("location") || params.get("destination") || "",
    price: Number(params.get("price") || 0),
    rating: params.get("rating") || "",
    reviews: params.get("reviews") || "",
    roomType: params.get("roomType") || "Deluxe Room",
    images: getHotelImages(params),
  };

  
const getValidCount = (value, fallback, max) => {
  const number = Number(value);

  if (!Number.isFinite(number) || number < 1) {
    return fallback;
  }

  return Math.min(Math.floor(number), max);
};

const [form, setForm] = useState({
  checkIn: params.get("checkIn") || params.get("date") || "",
  checkOut: params.get("checkOut") || "",
  rooms: getValidCount(params.get("rooms"), 1, 10),
  guests: getValidCount(params.get("guests"), 2, 20),
  fullName: "",
  mobile: "",
  email: "",
});


  const [error, setError] = useState("");
  const [mainImage, setMainImage] = useState(hotel.images[0]);

  const updateField = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  };

  
const changeCount = (field, amount) => {
  setForm((previous) => {
    const current = Number(previous[field]);
    const safeCurrent = Number.isFinite(current) ? current : 1;
    const max = field === "rooms" ? 10 : 20;

    return {
      ...previous,
      [field]: Math.max(1, Math.min(max, safeCurrent + amount)),
    };
  });

  setError("");
};


  const getNights = () => {
    if (!form.checkIn || !form.checkOut) return 0;

    const start = new Date(`${form.checkIn}T00:00:00`);
    const end = new Date(`${form.checkOut}T00:00:00`);

    return Math.round((end - start) / (1000 * 60 * 60 * 24));
  };

  const nights = getNights();
  const totalPrice = hotel.price * Math.max(nights, 0) * form.rooms;
  const money = (amount) =>
    `₹${Number(amount).toLocaleString("en-IN")}`;

  const handleSubmit = (event) => {
    event.preventDefault();
    setError("");

    if (!hotel.id || !hotel.name || hotel.price <= 0) {
      setError(
        "Hotel details or price are missing. Please select a hotel from the results page."
      );
      return;
    }

    if (!form.checkIn || !form.checkOut) {
      setError("Please select both check-in and check-out dates.");
      return;
    }

    if (nights <= 0) {
      setError("Check-out date must be after check-in date.");
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

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    const paymentParams = new URLSearchParams({
      type: "hotel",
      hotelId: String(hotel.id),
      name: hotel.name,
      subtitle: hotel.location || "Hotel Reservation",
      location: hotel.location,
      price: String(totalPrice),
      roomPrice: String(hotel.price),
      roomType: hotel.roomType,
      rating: hotel.rating,
      checkIn: form.checkIn,
      checkOut: form.checkOut,
      nights: String(nights),
      rooms: String(form.rooms),
      guests: String(form.guests),
      fullName: form.fullName.trim(),
      mobile: form.mobile,
      email: form.email.trim(),
      images: JSON.stringify(hotel.images),
    });

    navigate(
      `/payment/${encodeURIComponent(hotel.id)}?${paymentParams.toString()}`
    );
  };

  if (!hotel.id || !hotel.name || hotel.price <= 0) {
    return (
      <main className="hotel-booking-page">
        <div className="hotel-booking-container">
          <div className="hotel-missing-card">
            <Hotel size={44} />
            <h2>Hotel Details Not Found</h2>
            <p>
              Please select a hotel from the hotel results page before
              continuing with your booking.
            </p>
            <button
              type="button"
              className="hotel-primary-btn"
              onClick={() => navigate("/hotel-results")}
            >
              Search Hotels
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="hotel-booking-page">
      <div className="hotel-booking-container">
        <button
          type="button"
          className="hotel-back-btn"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={18} />
          Back to Hotel
        </button>

        <header className="hotel-booking-heading">
          <div>
            <span className="hotel-eyebrow">MK TRAVELS · HOTEL BOOKING</span>
            <h1>Complete Your Booking</h1>
            <p>Review your hotel, confirm your stay and enter guest details.</p>
          </div>

          <div className="hotel-secure-label">
            <ShieldCheck size={18} />
            Secure checkout
          </div>
        </header>

        <div className="hotel-booking-layout">
          <form className="hotel-booking-form" onSubmit={handleSubmit}>
            {/* HOTEL PHOTO AND INFORMATION */}
            <section className="hotel-booking-section hotel-property-section">
              <div className="hotel-section-heading">
                <span className="hotel-section-icon">
                  <Hotel size={20} />
                </span>
                <div>
                  <h2>Your selected hotel</h2>
                  <p>Check the property details before booking.</p>
                </div>
              </div>

              <div className="hotel-property-content">
                <div className="hotel-property-gallery">
                  <img
                    className="hotel-property-image"
                    src={mainImage}
                    alt={hotel.name}
                    onError={(event) => {
                      event.currentTarget.onerror = null;
                      event.currentTarget.src = DEFAULT_HOTEL_IMAGE;
                    }}
                  />

                  {hotel.images.length > 1 && (
                    <div className="hotel-gallery-thumbnails">
                      {hotel.images.slice(0, 4).map((image, index) => (
                        <button
                          key={`${image}-${index}`}
                          type="button"
                          className={`hotel-gallery-thumb ${
                            mainImage === image ? "active" : ""
                          }`}
                          onClick={() => setMainImage(image)}
                          aria-label={`View hotel photo ${index + 1}`}
                        >
                          <img
                            src={image}
                            alt={`${hotel.name} view ${index + 1}`}
                            onError={(event) => {
                              event.currentTarget.style.visibility = "hidden";
                            }}
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="hotel-property-info">
                  <span className="hotel-property-tag">
                    <CheckCircle2 size={13} />
                    Selected property
                  </span>

                  <h3>{hotel.name}</h3>

                  {hotel.location && (
                    <p className="hotel-property-location">
                      <MapPin size={15} />
                      {hotel.location}
                    </p>
                  )}

                  {hotel.rating && (
                    <div className="hotel-property-rating">
                      <span>
                        <Star size={14} fill="currentColor" />
                        {hotel.rating}
                      </span>
                      {hotel.reviews && <small>{hotel.reviews} reviews</small>}
                    </div>
                  )}

                  <div className="hotel-room-label">
                    <BedDouble size={16} />
                    {hotel.roomType}
                  </div>

                  <div className="hotel-property-price">
                    {money(hotel.price)}
                    <span> / room / night</span>
                  </div>
                </div>
              </div>
            </section>

            {/* DATES, ROOMS AND GUESTS */}
            <section className="hotel-booking-section">
              <div className="hotel-section-heading">
                <span className="hotel-section-icon">
                  <CalendarDays size={20} />
                </span>
                <div>
                  <h2>Stay details</h2>
                  <p>Choose your dates and the number of travellers.</p>
                </div>
              </div>

              <div className="hotel-form-grid">
                <div className="hotel-field">
                  <label htmlFor="checkIn">Check-in</label>
                  <input
                    id="checkIn"
                    name="checkIn"
                    type="date"
                    value={form.checkIn}
                    onChange={(event) => {
                      const nextCheckIn = event.target.value;

                      setForm((previous) => ({
                        ...previous,
                        checkIn: nextCheckIn,
                        checkOut:
                          previous.checkOut &&
                          previous.checkOut <= nextCheckIn
                            ? ""
                            : previous.checkOut,
                      }));

                      setError("");
                    }}
                    required
                  />
                </div>

                <div className="hotel-field">
                  <label htmlFor="checkOut">Check-out</label>
                  <input
                    id="checkOut"
                    name="checkOut"
                    type="date"
                    min={form.checkIn || undefined}
                    value={form.checkOut}
                    onChange={updateField}
                    required
                  />
                </div>
              </div>

              <div className="hotel-stay-result">
                <CalendarDays size={17} />
                <span>
                  {nights > 0
                    ? `${nights} night${nights === 1 ? "" : "s"} selected`
                    : "Select your dates to calculate your stay"}
                </span>
              </div>

              <div className="hotel-counter-row">
                <div className="hotel-counter-description">
                  <span className="hotel-counter-icon">
                    <BedDouble size={19} />
                  </span>
                  <div>
                    <strong>Rooms</strong>
                    <p>Number of rooms</p>
                  </div>
                </div>

                <div className="hotel-counter">
                  <button
                    type="button"
                    aria-label="Remove room"
                    disabled={form.rooms <= 1}
                    onClick={() => changeCount("rooms", -1)}
                  >
                    <Minus size={15} />
                  </button>
                  <strong>{form.rooms}</strong>
                  <button
                    type="button"
                    aria-label="Add room"
                    disabled={form.rooms >= 10}
                    onClick={() => changeCount("rooms", 1)}
                  >
                    <Plus size={15} />
                  </button>
                </div>
              </div>

              <div className="hotel-counter-row">
                <div className="hotel-counter-description">
                  <span className="hotel-counter-icon">
                    <Users size={19} />
                  </span>
                  <div>
                    <strong>Guests</strong>
                    <p>Adults and children combined</p>
                  </div>
                </div>

                <div className="hotel-counter">
                  <button
                    type="button"
                    aria-label="Remove guest"
                    disabled={form.guests <= 1}
                    onClick={() => changeCount("guests", -1)}
                  >
                    <Minus size={15} />
                  </button>
                  <strong>{form.guests}</strong>
                  <button
                    type="button"
                    aria-label="Add guest"
                    disabled={form.guests >= 20}
                    onClick={() => changeCount("guests", 1)}
                  >
                    <Plus size={15} />
                  </button>
                </div>
              </div>
            </section>

            {/* GUEST FORM */}
            <section className="hotel-booking-section">
              <div className="hotel-section-heading">
                <span className="hotel-section-icon">
                  <Users size={20} />
                </span>
                <div>
                  <h2>Primary guest details</h2>
                  <p>Enter the contact information for this reservation.</p>
                </div>
              </div>

              <div className="hotel-field">
                <label htmlFor="fullName">Full name</label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={form.fullName}
                  onChange={updateField}
                  placeholder="Enter guest's full name"
                  autoComplete="name"
                  required
                />
              </div>

              <div className="hotel-form-grid">
                <div className="hotel-field">
                  <label htmlFor="mobile">Mobile number</label>
                  <input
                    id="mobile"
                    name="mobile"
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    value={form.mobile}
                    onChange={(event) => {
                      const value = event.target.value
                        .replace(/\D/g, "")
                        .slice(0, 10);

                      setForm((previous) => ({
                        ...previous,
                        mobile: value,
                      }));
                      setError("");
                    }}
                    placeholder="10-digit mobile number"
                    autoComplete="tel-national"
                    required
                  />
                </div>

                <div className="hotel-field">
                  <label htmlFor="email">Email address</label>
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

            {error && (
              <div className="hotel-booking-error" role="alert">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="hotel-primary-btn hotel-continue-btn"
            >
              Continue to Payment
              <CreditCard size={19} />
            </button>

            <p className="hotel-demo-note">
              <ShieldCheck size={15} />
              Demo checkout · Review the total before proceeding.
            </p>
          </form>

          {/* STICKY PRICE SUMMARY WITH SMALL HOTEL PHOTO */}
          <aside className="hotel-booking-summary">
            <div className="hotel-summary-photo-wrap">
              <img
                src={hotel.images[0]}
                alt={hotel.name}
                onError={(event) => {
                  event.currentTarget.onerror = null;
                  event.currentTarget.src = DEFAULT_HOTEL_IMAGE;
                }}
              />
              <span className="hotel-summary-photo-badge">
                <Hotel size={13} />
                Your hotel
              </span>
            </div>

            <div className="hotel-summary-content">
              <span className="hotel-summary-label">BOOKING SUMMARY</span>
              <h2>{hotel.name}</h2>

              {hotel.location && (
                <p className="hotel-summary-location">
                  <MapPin size={14} />
                  {hotel.location}
                </p>
              )}

              <div className="hotel-summary-room">
                <BedDouble size={16} />
                <span>{hotel.roomType}</span>
              </div>

              <div className="hotel-summary-line">
                <span>Room price / night</span>
                <strong>{money(hotel.price)}</strong>
              </div>

              <div className="hotel-summary-line">
                <span>Number of nights</span>
                <strong>{Math.max(nights, 0)}</strong>
              </div>

              <div className="hotel-summary-line">
                <span>Rooms</span>
                <strong>{form.rooms}</strong>
              </div>

              <div className="hotel-summary-line">
                <span>Guests</span>
                <strong>{form.guests}</strong>
              </div>

              <div className="hotel-summary-total">
                <div>
                  <span>Total price</span>
                  <small>
                    {nights > 0
                      ? `${nights} night${nights === 1 ? "" : "s"} × ${form.rooms} room${form.rooms === 1 ? "" : "s"}`
                      : "Select stay dates"}
                  </small>
                </div>
                <strong>{money(Math.max(totalPrice, 0))}</strong>
              </div>

              {nights <= 0 && (
                <p className="hotel-summary-hint">
                  Select valid check-in and check-out dates to calculate your
                  total.
                </p>
              )}

              <div className="hotel-summary-benefit">
                <ShieldCheck size={18} />
                <div>
                  <strong>Secure booking details</strong>
                  <span>Your details will be passed to the demo checkout.</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

export default HotelBooking;
