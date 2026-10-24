import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Briefcase,
  Bus,
  CalendarDays,
  Car,
  Clock,
  Hotel,
  MapPin,
  Palmtree,
  Search,
  ShieldCheck,
  Users,
} from "lucide-react";

import destinations from "../data/destinations";
import TravelContact from "../components/TravelContact";

function Home() {
  const navigate = useNavigate();

  // =========================================
  // ACTIVE HOME SERVICE
  // =========================================
  const [activeService, setActiveService] = useState(null);

  // =========================================
  // BUS
  // =========================================
  const today = new Date().toISOString().split("T")[0];

  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrow = tomorrowDate.toISOString().split("T")[0];

  const [busFrom, setBusFrom] = useState("");
  const [busTo, setBusTo] = useState("");
  const [busDate, setBusDate] = useState(today);

  // =========================================
  // CAB
  // =========================================
  const [cabType, setCabType] = useState("Outstation");
  const [cabFrom, setCabFrom] = useState("");
  const [cabTo, setCabTo] = useState("");
  const [cabDate, setCabDate] = useState(today);
  const [cabTime, setCabTime] = useState("10:00");
  const [cabTravellers, setCabTravellers] = useState("1");

  // =========================================
  // HOTEL
  // =========================================
  const [hotelDestination, setHotelDestination] = useState("");
  const [hotelCheckIn, setHotelCheckIn] = useState(today);
  const [hotelCheckOut, setHotelCheckOut] = useState(tomorrow);
  const [hotelGuests, setHotelGuests] = useState("2 Adults, 1 Room");

  // =========================================
  // HOLIDAY PACKAGE
  // =========================================
  const [tourDestination, setTourDestination] = useState("");
  const [tourDate, setTourDate] = useState(today);
  const [tourTravellers, setTourTravellers] = useState("2");

  // =========================================
  // INSURANCE
  // =========================================
  const [insuranceType, setInsuranceType] = useState("Domestic Travel");
  const [insuranceTravellers, setInsuranceTravellers] = useState("1");
  const [insuranceDate, setInsuranceDate] = useState(today);
  const [insuranceDestination, setInsuranceDestination] = useState("");

  // =========================================
  // SERVICES
  // =========================================
  const travelServices = [
    {
      id: "bus",
      title: "Bus",
      icon: Bus,
      iconClass: "bus-icon",
    },
    {
      id: "cab",
      title: "Cabs",
      icon: Car,
      iconClass: "cab-icon",
    },
    {
      id: "hotel",
      title: "Hotels",
      icon: Hotel,
      iconClass: "hotel-icon",
    },
    {
      id: "tour",
      title: "Holiday Packages",
      icon: Palmtree,
      iconClass: "holiday-icon",
    },
    {
      id: "insurance",
      title: "Travel Insurance",
      icon: ShieldCheck,
      iconClass: "insurance-icon",
    },
  ];

  // =========================================
  // SERVICE CLICK
  // =========================================
  const handleServiceClick = (service) => {
    setActiveService(service);
  };

  // =========================================
  // BUS SEARCH
  // =========================================
  const handleBusSearch = () => {
    if (!busFrom || !busTo || !busDate) {
      alert("Please enter From, To and Travel Date");
      return;
    }

    navigate(
      `/bus-result?type=bus&from=${encodeURIComponent(
        busFrom
      )}&to=${encodeURIComponent(busTo)}&date=${encodeURIComponent(busDate)}`
    );
  };

  // =========================================
  // CAB SEARCH
  // =========================================
  const handleCabSearch = () => {
    if (!cabFrom) {
      alert("Please enter pickup location");
      return;
    }

    if (cabType !== "Rental" && !cabTo) {
      alert("Please enter destination");
      return;
    }

    navigate(
      `/cab-results?type=${encodeURIComponent(
        cabType
      )}&from=${encodeURIComponent(cabFrom)}&to=${encodeURIComponent(
        cabTo
      )}&date=${encodeURIComponent(
        cabDate
      )}&time=${encodeURIComponent(cabTime)}&travellers=${encodeURIComponent(
        cabTravellers
      )}`
    );
  };

  // =========================================
  // HOTEL SEARCH
  // =========================================
  const handleHotelSearch = () => {
    if (!hotelDestination) {
      alert("Please enter destination");
      return;
    }

    if (hotelCheckOut <= hotelCheckIn) {
      alert("Check-out date must be after check-in date");
      return;
    }

    navigate(
      `/hotel-results?destination=${encodeURIComponent(
        hotelDestination
      )}&checkIn=${encodeURIComponent(
        hotelCheckIn
      )}&checkOut=${encodeURIComponent(
        hotelCheckOut
      )}&guests=${encodeURIComponent(hotelGuests)}`
    );
  };

  // =========================================
  // TOUR SEARCH
  // =========================================
  const handleTourSearch = () => {
    if (!tourDestination) {
      alert("Please enter destination");
      return;
    }

    navigate(
      `/tours?destination=${encodeURIComponent(
        tourDestination
      )}&date=${encodeURIComponent(
        tourDate
      )}&travellers=${encodeURIComponent(tourTravellers)}`
    );
  };

  // =========================================
  // INSURANCE SEARCH
  // =========================================
  const handleInsuranceSearch = () => {
    if (!insuranceDestination) {
      alert("Please enter destination");
      return;
    }

    navigate(
      `/insurance-results?type=${encodeURIComponent(
        insuranceType
      )}&destination=${encodeURIComponent(
        insuranceDestination
      )}&date=${encodeURIComponent(
        insuranceDate
      )}&travellers=${encodeURIComponent(insuranceTravellers)}`
    );
  };

  return (
    <main className="home-page">
      {/* =========================================
          TRAVEL SERVICES
      ========================================= */}
      <section className="travel-services-container">
        <div className="travel-services">
          {travelServices.map((service) => {
            const Icon = service.icon;

            return (
              <button
                key={service.id}
                type="button"
                className={
                  activeService?.id === service.id
                    ? "travel-service-card active"
                    : "travel-service-card"
                }
                onClick={() => handleServiceClick(service)}
              >
                <div
                  className={`travel-service-icon ${service.iconClass}`}
                >
                  <Icon size={30} strokeWidth={1.8} />
                </div>
                <h3>{service.title}</h3>
              </button>
            );
          })}
        </div>
      </section>

      {/* =========================================
          BUS FORM
      ========================================= */}
      {activeService?.id === "bus" && (
        <section className="home-service-form">
          <div className="home-service-card">
            <div className="home-service-title">
              <Bus size={27} />
              <div>
                <h2>Bus Ticket Booking</h2>
                <p>Search buses for your journey</p>
              </div>
            </div>

            <div className="home-form-fields">
              <div className="home-form-field">
                <label>FROM</label>
                <div className="home-form-input">
                  <MapPin size={18} />
                  <input
                    type="text"
                    placeholder="Enter city"
                    value={busFrom}
                    onChange={(e) => setBusFrom(e.target.value)}
                  />
                </div>
                <small>India</small>
              </div>

              <div className="home-form-field">
                <label>TO</label>
                <div className="home-form-input">
                  <MapPin size={18} />
                  <input
                    type="text"
                    placeholder="Enter city"
                    value={busTo}
                    onChange={(e) => setBusTo(e.target.value)}
                  />
                </div>
                <small>India</small>
              </div>

              <div className="home-form-field">
                <label>TRAVEL DATE</label>
                <div className="home-form-input">
                  <CalendarDays size={18} />
                  <input
                    type="date"
                    min={today}
                    value={busDate}
                    onChange={(e) => setBusDate(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="button"
                className="home-search-btn"
                onClick={handleBusSearch}
              >
                <Search size={19} />
                SEARCH BUSES
              </button>
            </div>
          </div>
        </section>
      )}

      {/* =========================================
          CAB FORM
      ========================================= */}
      {activeService?.id === "cab" && (
        <section className="home-service-form">
          <div className="home-service-card">
            <div className="home-service-title">
              <Car size={27} />
              <div>
                <h2>Book Cabs</h2>
                <p>Choose a comfortable ride</p>
              </div>
            </div>

            {/* CAB TABS */}
            <div className="home-service-tabs">
              {["Outstation", "Airport", "Rental"].map((type) => (
                <button
                  key={type}
                  type="button"
                  className={
                    cabType === type
                      ? "home-service-tab active"
                      : "home-service-tab"
                  }
                  onClick={() => setCabType(type)}
                >
                  {type}
                </button>
              ))}
            </div>

            <div className="home-form-fields">
              <div className="home-form-field">
                <label>FROM</label>
                <div className="home-form-input">
                  <MapPin size={18} />
                  <input
                    type="text"
                    placeholder="Pickup location"
                    value={cabFrom}
                    onChange={(e) => setCabFrom(e.target.value)}
                  />
                </div>
              </div>

              {cabType !== "Rental" && (
                <div className="home-form-field">
                  <label>TO</label>
                  <div className="home-form-input">
                    <MapPin size={18} />
                    <input
                      type="text"
                      placeholder={
                        cabType === "Airport"
                          ? "Airport / City"
                          : "Destination"
                      }
                      value={cabTo}
                      onChange={(e) => setCabTo(e.target.value)}
                    />
                  </div>
                </div>
              )}

              <div className="home-form-field">
                <label>DATE</label>
                <div className="home-form-input">
                  <CalendarDays size={18} />
                  <input
                    type="date"
                    min={today}
                    value={cabDate}
                    onChange={(e) => setCabDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="home-form-field">
                <label>PICKUP TIME</label>
                <div className="home-form-input">
                  <Clock size={18} />
                  <input
                    type="time"
                    value={cabTime}
                    onChange={(e) => setCabTime(e.target.value)}
                  />
                </div>
              </div>

              <div className="home-form-field">
                <label>TRAVELLERS</label>
                <div className="home-form-input">
                  <Users size={18} />
                  <select
                    value={cabTravellers}
                    onChange={(e) => setCabTravellers(e.target.value)}
                  >
                    <option value="1">1 Traveller</option>
                    <option value="2">2 Travellers</option>
                    <option value="3">3 Travellers</option>
                    <option value="4">4 Travellers</option>
                    <option value="5">5 Travellers</option>
                    <option value="6">6+ Travellers</option>
                  </select>
                </div>
              </div>

              <button
                type="button"
                className="home-search-btn"
                onClick={handleCabSearch}
              >
                <Search size={19} />
                SEARCH CABS
              </button>
            </div>
          </div>
        </section>
      )}

      {/* =========================================
          HOTEL FORM
      ========================================= */}
      {activeService?.id === "hotel" && (
        <section className="home-service-form">
          <div className="home-service-card">
            <div className="home-service-title">
              <Hotel size={27} />
              <div>
                <h2>Hotels & Stays</h2>
                <p>Find your perfect stay</p>
              </div>
            </div>

            <div className="home-form-fields">
              <div className="home-form-field">
                <label>CITY, AREA OR HOTEL</label>
                <div className="home-form-input">
                  <MapPin size={18} />
                  <input
                    type="text"
                    placeholder="Where do you want to stay?"
                    value={hotelDestination}
                    onChange={(e) => setHotelDestination(e.target.value)}
                  />
                </div>
              </div>

              <div className="home-form-field">
                <label>CHECK-IN</label>
                <div className="home-form-input">
                  <CalendarDays size={18} />
                  <input
                    type="date"
                    min={today}
                    value={hotelCheckIn}
                    onChange={(e) => setHotelCheckIn(e.target.value)}
                  />
                </div>
              </div>

              <div className="home-form-field">
                <label>CHECK-OUT</label>
                <div className="home-form-input">
                  <CalendarDays size={18} />
                  <input
                    type="date"
                    min={hotelCheckIn}
                    value={hotelCheckOut}
                    onChange={(e) => setHotelCheckOut(e.target.value)}
                  />
                </div>
              </div>

              <div className="home-form-field">
                <label>GUESTS & ROOMS</label>
                <div className="home-form-input">
                  <Users size={18} />
                  <select
                    value={hotelGuests}
                    onChange={(e) => setHotelGuests(e.target.value)}
                  >
                    <option>1 Adult, 1 Room</option>
                    <option>2 Adults, 1 Room</option>
                    <option>2 Adults, 2 Rooms</option>
                    <option>3 Adults, 1 Room</option>
                    <option>4 Adults, 2 Rooms</option>
                    <option>2 Adults, 1 Child, 1 Room</option>
                  </select>
                </div>
              </div>

              <button
                type="button"
                className="home-search-btn"
                onClick={handleHotelSearch}
              >
                <Search size={19} />
                SEARCH HOTELS
              </button>
            </div>
          </div>
        </section>
      )}

      {/* =========================================
          HOLIDAY PACKAGE FORM
      ========================================= */}
      {activeService?.id === "tour" && (
        <section className="home-service-form">
          <div className="home-service-card">
            <div className="home-service-title">
              <Palmtree size={27} />
              <div>
                <h2>Holiday Packages</h2>
                <p>Plan your next holiday</p>
              </div>
            </div>

            <div className="home-form-fields">
              <div className="home-form-field">
                <label>DESTINATION</label>
                <div className="home-form-input">
                  <MapPin size={18} />
                  <input
                    type="text"
                    placeholder="Where do you want to go?"
                    value={tourDestination}
                    onChange={(e) => setTourDestination(e.target.value)}
                  />
                </div>
              </div>

              <div className="home-form-field">
                <label>TRAVEL DATE</label>
                <div className="home-form-input">
                  <CalendarDays size={18} />
                  <input
                    type="date"
                    min={today}
                    value={tourDate}
                    onChange={(e) => setTourDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="home-form-field">
                <label>TRAVELLERS</label>
                <div className="home-form-input">
                  <Users size={18} />
                  <select
                    value={tourTravellers}
                    onChange={(e) => setTourTravellers(e.target.value)}
                  >
                    <option value="1">1 Traveller</option>
                    <option value="2">2 Travellers</option>
                    <option value="3">3 Travellers</option>
                    <option value="4">4 Travellers</option>
                    <option value="5">5 Travellers</option>
                    <option value="6">6+ Travellers</option>
                  </select>
                </div>
              </div>

              <button
                type="button"
                className="home-search-btn"
                onClick={handleTourSearch}
              >
                <Search size={19} />
                SEARCH PACKAGES
              </button>
            </div>
          </div>
        </section>
      )}

      {/* =========================================
          TRAVEL INSURANCE FORM
      ========================================= */}
      {activeService?.id === "insurance" && (
        <section className="home-service-form">
          <div className="home-service-card">
            <div className="home-service-title">
              <ShieldCheck size={27} />
              <div>
                <h2>Travel Insurance</h2>
                <p>Protect your journey</p>
              </div>
            </div>

            <div className="home-form-fields">
              <div className="home-form-field">
                <label>TRIP TYPE</label>
                <div className="home-form-input">
                  <Briefcase size={18} />
                  <select
                    value={insuranceType}
                    onChange={(e) => setInsuranceType(e.target.value)}
                  >
                    <option>Domestic Travel</option>
                    <option>International Travel</option>
                    <option>Student Travel</option>
                    <option>Senior Citizen Travel</option>
                  </select>
                </div>
              </div>

              <div className="home-form-field">
                <label>DESTINATION</label>
                <div className="home-form-input">
                  <MapPin size={18} />
                  <input
                    type="text"
                    placeholder="Enter destination"
                    value={insuranceDestination}
                    onChange={(e) => setInsuranceDestination(e.target.value)}
                  />
                </div>
              </div>

              <div className="home-form-field">
                <label>TRAVEL DATE</label>
                <div className="home-form-input">
                  <CalendarDays size={18} />
                  <input
                    type="date"
                    min={today}
                    value={insuranceDate}
                    onChange={(e) => setInsuranceDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="home-form-field">
                <label>TRAVELLERS</label>
                <div className="home-form-input">
                  <Users size={18} />
                  <select
                    value={insuranceTravellers}
                    onChange={(e) => setInsuranceTravellers(e.target.value)}
                  >
                    <option value="1">1 Traveller</option>
                    <option value="2">2 Travellers</option>
                    <option value="3">3 Travellers</option>
                    <option value="4">4 Travellers</option>
                    <option value="5">5 Travellers</option>
                    <option value="6">6+ Travellers</option>
                  </select>
                </div>
              </div>

              <button
                type="button"
                className="home-search-btn"
                onClick={handleInsuranceSearch}
              >
                <Search size={19} />
                SEARCH INSURANCE
              </button>
            </div>
          </div>
        </section>
      )}

      {/* =========================================================
          POPULAR DESTINATIONS
      ========================================================= */}
      <section className="destinations-section">
        <div className="section-container">
          {/* SECTION HEADER */}
          <div className="section-header">
            <div className="section-header-left">
              <span className="section-label">EXPLORE THE WORLD</span>
              <h2>Popular Destinations</h2>
              <p className="section-subtitle">
                Discover amazing places and plan your perfect holiday with our
                handpicked travel packages.
              </p>
            </div>

            <div className="destinations-footer">
              <Link to="/tours" className="view-all-button">
                View All Destinations
                <ArrowRight size={17} />
              </Link>
            </div>
          </div>

          {/* DESTINATION CARDS */}
          <div className="destinations-grid">
            {destinations.map((destination) => (
              <article key={destination.id} className="destination-card">
                {/* DESTINATION IMAGE */}
                <Link
  to={`/tours/${destination.id}`}
  className="destination-main-link"
>
                  <div className="destination-image-wrapper">
                    <img
                      src={destination.image}
                      alt={`${destination.name} travel destination`}
                      className="destination-image"
                      loading="lazy"
                    />
                    <div className="destination-image-overlay" />

                    {/* COUNTRY */}
                    <span className="destination-country">
                      <MapPin size={11} />
                      {destination.country}
                    </span>

                    {/* RATING */}
                    {destination.rating && (
                      <span className="destination-rating">
                        <span className="rating-star">★</span>
                        {destination.rating}
                        {destination.reviews && (
                          <span className="rating-reviews">
                            ({destination.reviews})
                          </span>
                        )}
                      </span>
                    )}
                  </div>
                </Link>

                {/* CARD CONTENT */}
                <div className="destination-content">
                  <div className="destination-info">
                    {/* DESTINATION NAME */}
                    <Link
  to={`/tours/${destination.id}`}
  className="destination-title-link"
>
  <h3>{destination.name}</h3>
</Link>

                    {/* DESCRIPTION */}
                    <p className="destination-description">
                      {destination.description}
                    </p>

                    {/* DURATION */}
                    {destination.duration && (
                      <div className="destination-duration">
                        <Clock size={14} />
                        <span>{destination.duration}</span>
                      </div>
                    )}

                    {/* PRICE + VIEW TOUR */}
                    {destination.price && (
                      <div className="destination-price-row">
                        <div className="destination-price">
                          <span className="destination-price-current">
                            ₹{destination.price.toLocaleString("en-IN")}
                          </span>

                          {destination.oldPrice && (
                            <span className="destination-price-old">
                              ₹{destination.oldPrice.toLocaleString("en-IN")}
                            </span>
                          )}
                        </div>

                        <Link
  to={`/tours/${destination.id}`}
  className="destination-view-button"
>
  View Tour
  <ArrowRight size={14} />
</Link>
                      </div>
                    )}
                  </div>
                  <TravelContact destinationName={destination.name} />

                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

export default Home;