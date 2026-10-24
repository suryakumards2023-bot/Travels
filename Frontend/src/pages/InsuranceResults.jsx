
import { useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  MapPin,
  CalendarDays,
  Users,
  Search,
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
} from "lucide-react";

import "./InsuranceResults.css";

const insurancePlans = [
  {
    id: 1,
    name: "Basic Travel Cover",
    price: 299,
    coverage: "₹5 Lakh",
    features: [
      "Medical Emergency",
      "Trip Cancellation",
      "Baggage Protection",
    ],
  },
  {
    id: 2,
    name: "Standard Travel Cover",
    price: 599,
    coverage: "₹15 Lakh",
    popular: true,
    features: [
      "Medical Emergency",
      "Trip Cancellation",
      "Baggage Protection",
      "Flight Delay",
    ],
  },
  {
    id: 3,
    name: "Premium Travel Cover",
    price: 999,
    coverage: "₹50 Lakh",
    features: [
      "Medical Emergency",
      "Trip Cancellation",
      "Baggage Protection",
      "Flight Delay",
      "Personal Accident",
    ],
  },
];

function InsuranceResults() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const type = searchParams.get("type") || "Domestic Travel";
  const destination = searchParams.get("destination") || "";
  const startDate = searchParams.get("date") || "";
  const endDate = searchParams.get("endDate") || "";
  const travellers = searchParams.get("travellers") || "1";

  const [selectedCoverages, setSelectedCoverages] = useState([]);
  const [selectedPrices, setSelectedPrices] = useState([]);
  const [sortBy, setSortBy] = useState("recommended");

  // Update query parameters without losing other search values.
  const updateSearchParam = (key, value) => {
    const nextParams = new URLSearchParams(searchParams);

    if (value) {
      nextParams.set(key, value);
    } else {
      nextParams.delete(key);
    }

    setSearchParams(nextParams);
  };

  // Search validation
  const handleSearch = () => {
    if (!destination.trim()) {
      alert("Please enter state / region");
      return;
    }

    if (!startDate || !endDate) {
      alert("Please select start and end date");
      return;
    }

    if (endDate < startDate) {
      alert("End date must be after start date");
      return;
    }

    if (endDate === startDate) {
      alert("End date must be after the start date");
      return;
    }

    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("type", type);
    nextParams.set("destination", destination.trim());
    nextParams.set("date", startDate);
    nextParams.set("endDate", endDate);
    nextParams.set("travellers", travellers);

    setSearchParams(nextParams);
  };

  // Modify search
  const handleModifySearch = () => {
    const params = new URLSearchParams({
      service: "insurance",
      type,
      destination,
      date: startDate,
      endDate,
      travellers,
    });

    navigate(`/?${params.toString()}`);
  };

  // Navigate to Insurance Booking with selected plan details
  const handleInsuranceBooking = (plan) => {
    const duration =
      startDate && endDate
        ? `${startDate} to ${endDate}`
        : "Travel Insurance";

    const params = new URLSearchParams({
      id: String(plan.id),
      insuranceId: String(plan.id),
      name: plan.name,
      planName: plan.name,
      price: String(plan.price),
      coverage: plan.coverage,
      duration,
      durationLabel: duration,
      description: plan.features.join(", "),
      plan: plan.name,
      type: "insurance",
      travelType: type,
      destination,
      date: startDate,
      travelDate: startDate,
      endDate,
      travellers: String(travellers),
    });

    navigate(`/insurance-booking?${params.toString()}`);
  };

  // Coverage filter
  const toggleCoverage = (coverage) => {
    setSelectedCoverages((previous) =>
      previous.includes(coverage)
        ? previous.filter((item) => item !== coverage)
        : [...previous, coverage]
    );
  };

  // Price filter
  const togglePrice = (priceRange) => {
    setSelectedPrices((previous) =>
      previous.includes(priceRange)
        ? previous.filter((item) => item !== priceRange)
        : [...previous, priceRange]
    );
  };

  // Filter and sort plans
  const filteredPlans = useMemo(() => {
    let plans = insurancePlans.filter((plan) => {
      const matchesCoverage =
        selectedCoverages.length === 0 ||
        selectedCoverages.every((coverage) =>
          plan.features.includes(coverage)
        );

      const matchesPrice =
        selectedPrices.length === 0 ||
        selectedPrices.some((range) => {
          if (range === "under500") return plan.price < 500;
          if (range === "500to1000")
            return plan.price >= 500 && plan.price <= 1000;
          if (range === "above1000") return plan.price > 1000;
          return true;
        });

      return matchesCoverage && matchesPrice;
    });

    if (sortBy === "priceLow") {
      plans = [...plans].sort((a, b) => a.price - b.price);
    } else if (sortBy === "priceHigh") {
      plans = [...plans].sort((a, b) => b.price - a.price);
    } else if (sortBy === "coverageHigh") {
      plans = [...plans].sort(
        (a, b) =>
          Number.parseInt(b.coverage.replace(/\D/g, ""), 10) -
          Number.parseInt(a.coverage.replace(/\D/g, ""), 10)
      );
    } else {
      plans = [...plans].sort(
        (a, b) => Number(Boolean(b.popular)) - Number(Boolean(a.popular))
      );
    }

    return plans;
  }, [selectedCoverages, selectedPrices, sortBy]);

  const formatDate = (date) => {
    if (!date) return "Select Date";

    return new Date(`${date}T00:00:00`).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const handleCardKeyDown = (event, plan) => {
    if (event.target !== event.currentTarget) return;

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleInsuranceBooking(plan);
    }
  };

  return (
    <div className="insurance-results-page">
      <div className="insurance-results-container">
        {/* Back button */}
        <button
          type="button"
          className="insurance-back-btn"
          onClick={() => navigate("/")}
        >
          <ArrowLeft size={17} />
          Back
        </button>

        {/* Search box */}
        <div className="insurance-search-box">
          <div className="insurance-search-field">
            <label>TRAVEL TYPE</label>

            <div className="insurance-field-value">
              <ShieldCheck size={17} />

              <select
                value={type}
                onChange={(event) =>
                  updateSearchParam("type", event.target.value)
                }
              >
                <option value="Domestic Travel">Domestic Travel</option>
                <option value="International Travel">
                  International Travel
                </option>
              </select>

              <ChevronDown size={15} />
            </div>
          </div>

          <div className="insurance-search-field insurance-destination-field">
            <label>STATE / REGION</label>

            <div className="insurance-field-value">
              <MapPin size={17} />

              <input
                type="text"
                value={destination}
                placeholder="e.g. Mumbai"
                onChange={(event) =>
                  updateSearchParam("destination", event.target.value)
                }
              />
            </div>
          </div>

          <div className="insurance-search-field">
            <label>START DATE</label>

            <div className="insurance-field-value">
              <CalendarDays size={17} />

              <input
                type="date"
                value={startDate}
                max={endDate || undefined}
                onChange={(event) =>
                  updateSearchParam("date", event.target.value)
                }
              />
            </div>
          </div>

          <div className="insurance-search-field">
            <label>END DATE</label>

            <div className="insurance-field-value">
              <CalendarDays size={17} />

              <input
                type="date"
                value={endDate}
                min={startDate || undefined}
                onChange={(event) =>
                  updateSearchParam("endDate", event.target.value)
                }
              />
            </div>
          </div>

          <div className="insurance-search-field">
            <label>NO. OF TRAVELLERS</label>

            <div className="insurance-field-value">
              <Users size={17} />

              <select
                value={travellers}
                onChange={(event) =>
                  updateSearchParam("travellers", event.target.value)
                }
              >
                {Array.from({ length: 10 }, (_, index) => {
                  const count = index + 1;

                  return (
                    <option key={count} value={String(count)}>
                      {String(count).padStart(2, "0")}{" "}
                      {count === 1 ? "Traveller" : "Travellers"}
                    </option>
                  );
                })}
              </select>

              <ChevronDown size={15} />
            </div>
          </div>

          <button
            type="button"
            className="insurance-search-main-btn"
            onClick={handleSearch}
          >
            <Search size={18} />
            SEARCH
          </button>
        </div>

        {/* Results heading */}
        <div className="insurance-result-top">
          <div>
            <h1>
              Travel Insurance for {destination || "Your Destination"}
            </h1>

            <p>
              {type} • {formatDate(startDate)} → {formatDate(endDate)} •{" "}
              {String(travellers).padStart(2, "0")} Traveller
              {travellers !== "1" ? "s" : ""}
            </p>
          </div>

          <button
            type="button"
            className="insurance-modify-btn"
            onClick={handleModifySearch}
          >
            Modify Search
          </button>
        </div>

        {/* Results layout */}
        <div className="insurance-results-layout">
          {/* Filters */}
          <aside className="insurance-filter-box">
            <div className="insurance-filter-heading">
              <h3>Filters</h3>

              <button
                type="button"
                onClick={() => {
                  setSelectedCoverages([]);
                  setSelectedPrices([]);
                }}
              >
                Clear all
              </button>
            </div>

            <div className="insurance-filter-section">
              <h4>Coverage</h4>

              {[
                "Medical Emergency",
                "Trip Cancellation",
                "Baggage Protection",
                "Flight Delay",
                "Personal Accident",
              ].map((coverage) => (
                <label key={coverage}>
                  <input
                    type="checkbox"
                    checked={selectedCoverages.includes(coverage)}
                    onChange={() => toggleCoverage(coverage)}
                  />
                  {coverage}
                </label>
              ))}
            </div>

            <hr />

            <div className="insurance-filter-section">
              <h4>Plan Price</h4>

              <label>
                <input
                  type="checkbox"
                  checked={selectedPrices.includes("under500")}
                  onChange={() => togglePrice("under500")}
                />
                Under ₹500
              </label>

              <label>
                <input
                  type="checkbox"
                  checked={selectedPrices.includes("500to1000")}
                  onChange={() => togglePrice("500to1000")}
                />
                ₹500 – ₹1,000
              </label>

              <label>
                <input
                  type="checkbox"
                  checked={selectedPrices.includes("above1000")}
                  onChange={() => togglePrice("above1000")}
                />
                Above ₹1,000
              </label>
            </div>
          </aside>

          {/* Insurance plans */}
          <main className="insurance-list">
            <div className="insurance-list-heading">
              <div>
                <strong>{filteredPlans.length} Plans Available</strong>
                <p>Choose the right cover for your trip</p>
              </div>

              <div className="insurance-sort-control">
                <label htmlFor="insurance-sort">Sort by:</label>

                <select
                  id="insurance-sort"
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value)}
                >
                  <option value="recommended">Recommended</option>
                  <option value="priceLow">Price: Low to High</option>
                  <option value="priceHigh">Price: High to Low</option>
                  <option value="coverageHigh">Coverage: High to Low</option>
                </select>

                <ChevronDown size={15} />
              </div>
            </div>

            <div className="insurance-plans">
              {filteredPlans.length > 0 ? (
                filteredPlans.map((plan) => (
                  <article
                    className={
                      plan.popular
                        ? "insurance-plan-card popular"
                        : "insurance-plan-card"
                    }
                    key={plan.id}
                    tabIndex={0}
                    aria-label={`Select ${plan.name}, ₹${plan.price} per traveller`}
                    onClick={() => handleInsuranceBooking(plan)}
                    onKeyDown={(event) => handleCardKeyDown(event, plan)}
                  >
                    {plan.popular && (
                      <div className="insurance-popular">
                        MOST POPULAR
                      </div>
                    )}

                    <div className="insurance-plan-icon">
                      <ShieldCheck size={26} />
                    </div>

                    <h2>{plan.name}</h2>

                    <p className="insurance-coverage">
                      Coverage up to <strong>{plan.coverage}</strong>
                    </p>

                    <div className="insurance-price">
                      ₹{plan.price}
                      <small>/ traveller</small>
                    </div>

                    <div className="insurance-features">
                      {plan.features.map((feature) => (
                        <div key={feature}>
                          <CheckCircle2 size={15} />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleInsuranceBooking(plan);
                      }}
                    >
                      SELECT PLAN
                    </button>
                  </article>
                ))
              ) : (
                <div className="insurance-no-results">
                  <ShieldCheck size={34} />
                  <h3>No plans found</h3>
                  <p>Try changing your coverage or price filters.</p>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCoverages([]);
                      setSelectedPrices([]);
                    }}
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default InsuranceResults;
