
import { useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Car,
  MapPin,
  CalendarDays,
  Clock,
  Users,
  ArrowLeft,
  ArrowRight,
  Plus,
  Search,
  Star,
  ChevronDown,
  Luggage,
  Snowflake,
} from "lucide-react";

import "./CabResults.css";

const cabList = [
  {
    id: 1,
    name: "Sedan",
    vehicle: "Dzire / Etios",
    seats: 4,
    rating: 4.7,
    price: 1499,
    image:
      "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=700&q=85",
    features: ["AC", "4 Seats", "Driver Included"],
  },
  {
    id: 2,
    name: "SUV",
    vehicle: "Ertiga / Innova",
    seats: 6,
    rating: 4.8,
    price: 2199,
    image:
      "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=700&q=85",
    features: ["AC", "6 Seats", "Driver Included"],
  },
  {
    id: 3,
    name: "Premium SUV",
    vehicle: "Innova Crysta",
    seats: 6,
    rating: 4.9,
    price: 2999,
    image:
      "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=700&q=85",
    features: ["AC", "6 Seats", "Premium"],
  },
  {
    id: 4,
    name: "Tempo Traveller",
    vehicle: "12 Seater",
    seats: 12,
    rating: 4.8,
    price: 4999,
    image:
      "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=700&q=85",
    features: ["AC", "12 Seats", "Group Travel"],
  },
];

function CabResults() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const type = searchParams.get("type") || "Outstation";
  const initialFrom = searchParams.get("from") || "";
  const initialTo = searchParams.get("to") || "";
  const initialDate = searchParams.get("date") || "";
  const initialTime = searchParams.get("time") || "10:00";
  const initialTravellers = searchParams.get("travellers") || "1";

  const [from, setFrom] = useState(initialFrom);
  const [to, setTo] = useState(initialTo);
  const [date, setDate] = useState(initialDate);
  const [time, setTime] = useState(initialTime);
  const [travellers, setTravellers] = useState(
    String(Math.min(12, Math.max(1, Number(initialTravellers) || 1)))
  );
  const [tripType, setTripType] = useState(type);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedPrices, setSelectedPrices] = useState([]);
  const [minimumRating, setMinimumRating] = useState(0);
  const [sortBy, setSortBy] = useState("recommended");

  const updateSearch = () => {
    const nextParams = new URLSearchParams({
      type: tripType,
      from: from.trim(),
      to: to.trim(),
      date,
      time,
      travellers,
    });

    setSearchParams(nextParams);
  };

  const handleSearch = () => {
    if (!from.trim()) {
      alert("Please enter pickup location");
      return;
    }

    if (tripType !== "Rental" && !to.trim()) {
      alert("Please enter destination");
      return;
    }

    updateSearch();
  };

  const handleModifySearch = () => {
    const nextParams = new URLSearchParams({
      service: "cab",
      type: tripType,
      from,
      to,
      date,
      time,
      travellers,
    });

    navigate(`/?${nextParams.toString()}`);
  };

  const handleSelectCab = (cab) => {
    const params = new URLSearchParams({
      id: String(cab.id),
      name: cab.name,
      vehicle: cab.vehicle,
      image: cab.image,
      seats: String(cab.seats),
      rating: String(cab.rating),
      price: String(cab.price),
      type: tripType,
      from,
      to,
      date,
      time,
      travellers,
    });

    navigate(`/cab-booking?${params.toString()}`);
  };

  const toggleFilter = (value, setter, currentValues) => {
    setter(
      currentValues.includes(value)
        ? currentValues.filter((item) => item !== value)
        : [...currentValues, value]
    );
  };

  const filteredCabs = useMemo(() => {
    let result = cabList.filter((cab) => {
      const matchesType =
        selectedTypes.length === 0 ||
        selectedTypes.some((filter) => {
          if (filter === "Premium") {
            return cab.name.toLowerCase().includes("premium");
          }

          return cab.name === filter;
        });

      const matchesPrice =
        selectedPrices.length === 0 ||
        selectedPrices.some((filter) => {
          if (filter === "under") return cab.price < 2000;
          if (filter === "middle") {
            return cab.price >= 2000 && cab.price <= 3000;
          }
          return cab.price > 3000;
        });

      return (
        matchesType &&
        matchesPrice &&
        cab.rating >= minimumRating
      );
    });

    if (sortBy === "price-low") {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      result = [...result].sort((a, b) => b.price - a.price);
    } else if (sortBy === "rating") {
      result = [...result].sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [selectedTypes, selectedPrices, minimumRating, sortBy]);

  return (
    <main className="cab-results-page">
      <div className="cab-results-container">
        <button
          type="button"
          className="cab-back-btn"
          onClick={() => navigate("/")}
        >
          <ArrowLeft size={17} />
          Back
        </button>

        {/* Search panel */}
        <section className="cab-search-box">
          <div className="cab-search-field">
            <label>TRIP TYPE</label>
            <div className="cab-field-value">
              <Car size={18} />
              <select
                value={tripType}
                onChange={(event) => setTripType(event.target.value)}
              >
                <option value="Outstation">Outstation</option>
                <option value="Airport">Airport</option>
                <option value="Rental">Rental</option>
              </select>
              <ChevronDown size={15} />
            </div>
          </div>

          <div className="cab-search-field">
            <label>PICKUP LOCATION</label>
            <div className="cab-field-value">
              <MapPin size={17} />
              <input
                value={from}
                placeholder="Enter pickup location"
                onChange={(event) => setFrom(event.target.value)}
              />
            </div>
          </div>

          <div className="cab-search-field">
            <label>DESTINATION</label>
            <div className="cab-field-value">
              <MapPin size={17} />
              <input
                value={to}
                placeholder={tripType === "Rental" ? "Optional" : "Enter destination"}
                onChange={(event) => setTo(event.target.value)}
              />
            </div>
          </div>

          <div className="cab-search-field">
            <label>PICKUP DATE</label>
            <div className="cab-field-value">
              <CalendarDays size={17} />
              <input
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
              />
            </div>
          </div>

          <div className="cab-search-field">
            <label>PICKUP TIME</label>
            <div className="cab-field-value">
              <Clock size={17} />
              <input
                type="time"
                value={time}
                onChange={(event) => setTime(event.target.value)}
              />
            </div>
          </div>

          <div className="cab-search-field">
            <label>TRAVELLERS</label>
            <div className="cab-field-value">
              <Users size={17} />
              <select
                value={travellers}
                onChange={(event) => setTravellers(event.target.value)}
              >
                {Array.from({ length: 12 }, (_, index) => (
                  <option key={index + 1} value={String(index + 1)}>
                    {index + 1} Traveller{index === 0 ? "" : "s"}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="button"
            className="cab-search-main-btn"
            onClick={handleSearch}
          >
            <Search size={18} />
            SEARCH CABS
          </button>
        </section>

        {/* Results heading */}
        <section className="cab-result-top">
          <div>
            <span className="cab-eyebrow">MK TRAVELS · CAB BOOKING</span>
            <h1>
              {from || "Your pickup"}
              {tripType === "Rental"
                ? " Rental Cabs"
                : ` to ${to || "your destination"}`}
            </h1>
            <p>
              {tripType} <span>•</span> {date || "Date not selected"}{" "}
              <span>•</span> {time || "10:00"} <span>•</span>{" "}
              {travellers} traveller{travellers === "1" ? "" : "s"}
            </p>
          </div>

          
        </section>

        {/* Cab results and filters */}
        <div className="cab-results-layout">
          <aside className="cab-filter-box">
            <div className="cab-filter-heading">
              <h3>Filters</h3>
              <button
                type="button"
                onClick={() => {
                  setSelectedTypes([]);
                  setSelectedPrices([]);
                  setMinimumRating(0);
                }}
              >
                Reset
              </button>
            </div>

            <div className="filter-section">
              <h4>Cab Type</h4>
              {["Sedan", "SUV", "Premium", "Tempo Traveller"].map((item) => (
                <label key={item}>
                  <input
                    type="checkbox"
                    checked={selectedTypes.includes(item)}
                    onChange={() =>
                      toggleFilter(item, setSelectedTypes, selectedTypes)
                    }
                  />
                  {item}
                </label>
              ))}
            </div>

            <hr />

            <div className="filter-section">
              <h4>Price per trip</h4>
              {[
                ["under", "Under ₹2,000"],
                ["middle", "₹2,000 – ₹3,000"],
                ["above", "Above ₹3,000"],
              ].map(([value, label]) => (
                <label key={value}>
                  <input
                    type="checkbox"
                    checked={selectedPrices.includes(value)}
                    onChange={() =>
                      toggleFilter(value, setSelectedPrices, selectedPrices)
                    }
                  />
                  {label}
                </label>
              ))}
            </div>

            <hr />

            <div className="filter-section">
              <h4>Minimum rating</h4>
              {[4, 3].map((rating) => (
                <label key={rating}>
                  <input
                    type="radio"
                    name="cab-rating"
                    checked={minimumRating === rating}
                    onChange={() => setMinimumRating(rating)}
                  />
                  {rating}★ & above
                </label>
              ))}
              <label>
                <input
                  type="radio"
                  name="cab-rating"
                  checked={minimumRating === 0}
                  onChange={() => setMinimumRating(0)}
                />
                All ratings
              </label>
            </div>
          </aside>

          <section className="cab-list">
            <div className="cab-list-heading">
              <div>
                <strong>{filteredCabs.length} Cabs Available</strong>
                <p>Choose a vehicle that suits your trip</p>
              </div>

              <label className="cab-sort-control">
                <span>Sort by</span>
                <select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value)}
                >
                  <option value="recommended">Recommended</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                </select>
                <ChevronDown size={15} />
              </label>
            </div>

            {filteredCabs.length === 0 && (
              <div className="cab-empty-state">
                <Car size={38} />
                <h3>No cabs match these filters</h3>
                <p>Try changing your filters to see more options.</p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTypes([]);
                    setSelectedPrices([]);
                    setMinimumRating(0);
                  }}
                >
                  Clear filters
                </button>
              </div>
            )}

            {filteredCabs.map((cab) => (
              <article className="cab-result-card" key={cab.id}>
                <button
                  type="button"
                  className="cab-result-photo-button"
                  onClick={() => handleSelectCab(cab)}
                  aria-label={`View booking for ${cab.name}`}
                  title={`Book ${cab.name}`}
                >
                  <img
                    className="cab-result-photo"
                    src={cab.image}
                    alt={`${cab.name} car`}
                    loading="lazy"
                    onError={(event) => {
                      event.currentTarget.onerror = null;
                      event.currentTarget.style.display = "none";
                      event.currentTarget.parentElement.classList.add(
                        "cab-photo-fallback"
                      );
                    }}
                  />
                  <span className="cab-photo-click-label">View cab</span>
                </button>

                <div className="cab-result-info">
                  <div className="cab-name-row">
                    <button
                      type="button"
                      className="cab-name-link"
                      onClick={() => handleSelectCab(cab)}
                    >
                      {cab.name}
                    </button>
                    <span className="cab-rating">
                      <Star size={12} fill="currentColor" />
                      {cab.rating.toFixed(1)}
                    </span>
                  </div>

                  <p className="cab-vehicle">{cab.vehicle}</p>

                  <div className="cab-route">
                    <MapPin size={14} />
                    <span>{from || "Pickup location"}</span>
                    {tripType !== "Rental" && (
                      <>
                        <ArrowRight size={14} />
                        <span>{to || "Destination"}</span>
                      </>
                    )}
                  </div>

                  <div className="cab-capacity">
                    <span><Users size={14} /> {cab.seats} seats</span>
                    <span><Snowflake size={14} /> AC</span>
                    <span><Luggage size={14} /> Luggage</span>
                  </div>

                  <div className="cab-features">
                    {cab.features.map((feature) => (
                      <span key={feature}>{feature}</span>
                    ))}
                  </div>
                </div>

                <div className="cab-price-box">
                  <span>Starting from</span>
                  <strong>₹{cab.price.toLocaleString("en-IN")}</strong>
                  <small>per trip</small>
                  <button
                    type="button"
                    onClick={() => handleSelectCab(cab)}
                  >
                    SELECT CAB <ArrowRight size={15} />
                  </button>
                </div>
              </article>
            ))}
          </section>
        </div>
      </div>
    </main>
  );
}

export default CabResults;
