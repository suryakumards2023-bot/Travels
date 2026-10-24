import { useEffect, useMemo, useState } from "react";
import { useSearchParams,useNavigate  } from "react-router-dom";

import {
  Bus,
  CalendarDays,
  MapPin,
  ArrowLeft,
  ArrowLeftRight,
  Search as SearchIcon,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Snowflake,
  Armchair,
  Clock,
  Star,
  MapPinned,
  X,
} from "lucide-react";

import "./BusResult.css";


// ======================================================
// BUS OPERATORS
// ======================================================

const busList = [
  {
    id: 1,
    name: "UPSRTC",
    subtitle: "Uttar Pradesh",
    buses: 114,
    priceMin: 672,
    priceMax: 923,
    rating: 4.5,
    ac: true,
    seatType: "Seater",
    departure: "06:30 AM",
    arrival: "10:30 AM",
    duration: "4h 00m",
  },
  {
    id: 2,
    name: "IntrCity SmartBus",
    subtitle: "Premium Bus Service",
    buses: 48,
    priceMin: 799,
    priceMax: 1199,
    rating: 4.7,
    ac: true,
    seatType: "Sleeper",
    departure: "08:00 AM",
    arrival: "12:15 PM",
    duration: "4h 15m",
  },
  {
    id: 3,
    name: "Shivam Travels",
    subtitle: "Comfortable Travel",
    buses: 32,
    priceMin: 499,
    priceMax: 799,
    rating: 4.4,
    ac: true,
    seatType: "Seater",
    departure: "09:30 AM",
    arrival: "01:45 PM",
    duration: "4h 15m",
  },
  {
    id: 4,
    name: "Royal Roadways",
    subtitle: "Luxury Bus Service",
    buses: 27,
    priceMin: 699,
    priceMax: 1099,
    rating: 4.8,
    ac: true,
    seatType: "Sleeper",
    departure: "01:00 PM",
    arrival: "05:20 PM",
    duration: "4h 20m",
  },
  {
    id: 5,
    name: "City Express",
    subtitle: "Affordable Travel",
    buses: 41,
    priceMin: 349,
    priceMax: 599,
    rating: 4.2,
    ac: false,
    seatType: "Seater",
    departure: "03:30 PM",
    arrival: "07:45 PM",
    duration: "4h 15m",
  },
  {
    id: 6,
    name: "Highway Travels",
    subtitle: "Premium Sleeper",
    buses: 21,
    priceMin: 799,
    priceMax: 1299,
    rating: 4.9,
    ac: true,
    seatType: "Sleeper",
    departure: "07:00 PM",
    arrival: "11:10 PM",
    duration: "4h 10m",
  },
];


// ======================================================
// HELPER FUNCTIONS
// ======================================================

function formatDate(dateString) {
  if (!dateString) return "";

  const date = new Date(`${dateString}T00:00:00`);

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatShortDate(dateString) {
  if (!dateString) return "";

  const date = new Date(`${dateString}T00:00:00`);

  return {
    day: date.toLocaleDateString("en-IN", {
      day: "2-digit",
    }),
    month: date.toLocaleDateString("en-IN", {
      month: "short",
    }),
    weekday: date.toLocaleDateString("en-IN", {
      weekday: "short",
    }),
  };
}

function addDays(dateString, days) {
  const date = new Date(`${dateString}T00:00:00`);

  date.setDate(date.getDate() + days);

  return date.toISOString().split("T")[0];
}


// ======================================================
// COMPONENT
// ======================================================

function BusResult() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  
  const handleSelectBus = (bus) => {
    const bookingParams = new URLSearchParams({
      id: String(bus.id),
      name: bus.name,
      subtitle: bus.subtitle,
      price: String(bus.priceMin),
      rating: String(bus.rating),
      ac: String(bus.ac),
      seatType: bus.seatType,
      departure: bus.departure,
      arrival: bus.arrival,
      duration: bus.duration,
      from,
      to,
      date: selectedDate,
    });

    navigate(`/bus-booking?${bookingParams.toString()}`);
  };



  const urlType = searchParams.get("type");
  const urlFrom = searchParams.get("from") || "";
  const urlTo = searchParams.get("to") || "";
  const urlDate = searchParams.get("date") || "";

  const [from, setFrom] = useState(urlFrom);
  const [to, setTo] = useState(urlTo);
  const [travelDate, setTravelDate] = useState(urlDate);

  const [showResults, setShowResults] = useState(
    urlType === "bus" &&
      !!urlFrom &&
      !!urlTo &&
      !!urlDate
  );

  const [selectedDate, setSelectedDate] = useState(urlDate);

  const [selectedAC, setSelectedAC] = useState([]);
  const [selectedSeat, setSelectedSeat] = useState([]);
  const [selectedDeparture, setSelectedDeparture] = useState([]);

  const [sortBy, setSortBy] = useState("Relevance");

  const [pickupSearch, setPickupSearch] = useState("");

  const [showAllPickup, setShowAllPickup] = useState(false);


  // ====================================================
  // UPDATE FROM URL
  // ====================================================

  useEffect(() => {
    setFrom(urlFrom);
    setTo(urlTo);
    setTravelDate(urlDate);
    setSelectedDate(urlDate);

    setShowResults(
      urlType === "bus" &&
        !!urlFrom &&
        !!urlTo &&
        !!urlDate
    );
  }, [urlType, urlFrom, urlTo, urlDate]);


  // ====================================================
  // SWAP
  // ====================================================

  const handleSwap = () => {
    const oldFrom = from;

    setFrom(to);
    setTo(oldFrom);
  };


  // ====================================================
  // SEARCH
  // ====================================================

  const handleSearch = (e) => {
    e.preventDefault();

    if (!from || !to || !travelDate) {
      alert("Please enter From, To and Travel Date");
      return;
    }

    setSearchParams({
      type: "bus",
      from,
      to,
      date: travelDate,
    });

    setSelectedDate(travelDate);
    setShowResults(true);
  };


  // ====================================================
  // CHANGE SEARCH
  // ====================================================

  const handleChangeSearch = () => {
    setShowResults(false);
  };


  // ====================================================
  // DATE CHANGE
  // ====================================================

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setTravelDate(date);

    setSearchParams({
      type: "bus",
      from,
      to,
      date,
    });

    setShowResults(true);
  };


  // ====================================================
  // FILTER
  // ====================================================

  const toggleFilter = (value, selected, setSelected) => {
    if (selected.includes(value)) {
      setSelected(
        selected.filter((item) => item !== value)
      );
    } else {
      setSelected([...selected, value]);
    }
  };


  const clearFilters = () => {
    setSelectedAC([]);
    setSelectedSeat([]);
    setSelectedDeparture([]);
  };


  // ====================================================
  // FILTER BUS LIST
  // ====================================================

  const filteredBuses = useMemo(() => {
    let result = [...busList];

    if (selectedAC.length > 0) {
      result = result.filter((bus) => {
        if (
          selectedAC.includes("AC") &&
          selectedAC.includes("Non-AC")
        ) {
          return true;
        }

        if (selectedAC.includes("AC")) {
          return bus.ac;
        }

        if (selectedAC.includes("Non-AC")) {
          return !bus.ac;
        }

        return true;
      });
    }

    if (selectedSeat.length > 0) {
      result = result.filter((bus) => {
        if (
          selectedSeat.includes("Seater") &&
          selectedSeat.includes("Sleeper")
        ) {
          return true;
        }

        return selectedSeat.includes(bus.seatType);
      });
    }

    if (selectedDeparture.length > 0) {
      result = result.filter((bus) => {
        const hour = parseInt(
          bus.departure.split(":")[0]
        );

        const isPM =
          bus.departure.includes("PM");

        let hour24 = hour;

        if (isPM && hour !== 12) {
          hour24 += 12;
        }

        if (!isPM && hour === 12) {
          hour24 = 0;
        }

        return selectedDeparture.some((range) => {
          if (range === "Before 6 AM") {
            return hour24 < 6;
          }

          if (range === "6 AM - 12 PM") {
            return hour24 >= 6 && hour24 < 12;
          }

          if (range === "12 PM - 6 PM") {
            return hour24 >= 12 && hour24 < 18;
          }

          if (range === "After 6 PM") {
            return hour24 >= 18;
          }

          return true;
        });
      });
    }

    // SORT
    if (sortBy === "Rating") {
      result.sort(
        (a, b) => b.rating - a.rating
      );
    }

    if (sortBy === "Price") {
      result.sort(
        (a, b) => a.priceMin - b.priceMin
      );
    }

    if (sortBy === "Fastest") {
      result.sort((a, b) => {
        return (
          parseInt(a.duration) -
          parseInt(b.duration)
        );
      });
    }

    return result;
  }, [
    selectedAC,
    selectedSeat,
    selectedDeparture,
    sortBy,
  ]);


  // ====================================================
  // PICKUP POINTS
  // ====================================================

  const pickupPoints = [
    "Connaught Place",
    "Rajiv Chowk",
    "Kashmere Gate",
    "Anand Vihar",
    "ISBT",
    "Karol Bagh",
    "Noida Sector 15",
    "Akshardham",
  ];

  const filteredPickupPoints =
    pickupPoints.filter((point) =>
      point
        .toLowerCase()
        .includes(
          pickupSearch.toLowerCase()
        )
    );


  // ====================================================
  // DATE STRIP
  // ====================================================

  const dateStrip = selectedDate
  ? Array.from({ length: 8 }, (_, index) => {
      return addDays(selectedDate, index);
    })
  : [];

  // ====================================================
  // SEARCH FORM
  // ====================================================

  const SearchForm = () => (
    <div className="bus-top-search-card">

      <form onSubmit={handleSearch}>

        <div className="bus-top-search-fields">

          {/* FROM */}
          <div className="bus-top-field">

            <label>FROM</label>

            <div className="bus-top-input-wrapper">

              <MapPin size={15} />

              <input
                type="text"
                value={from}
                placeholder="Enter city"
                onChange={(e) =>
                  setFrom(e.target.value)
                }
              />

            </div>

          </div>


          {/* SWAP */}
          <button
            type="button"
            className="bus-top-swap"
            onClick={handleSwap}
          >
            <ArrowLeftRight size={19} />
          </button>


          {/* TO */}
          <div className="bus-top-field">

            <label>TO</label>

            <div className="bus-top-input-wrapper">

              <MapPin size={15} />

              <input
                type="text"
                value={to}
                placeholder="Enter city"
                onChange={(e) =>
                  setTo(e.target.value)
                }
              />

            </div>

          </div>


          {/* DEPART */}
          <div className="bus-top-field depart-field">

            <label>DEPART</label>

            <div className="bus-top-input-wrapper">

              <CalendarDays size={15} />

              <input
                type="date"
                value={travelDate}
                onChange={(e) =>
                  setTravelDate(e.target.value)
                }
              />

            </div>

          </div>


          {/* SEARCH */}
          <button
            type="submit"
            className="bus-top-search-btn"
          >
            <SearchIcon size={18} />
            SEARCH
          </button>

        </div>

      </form>

    </div>
  );


  // ====================================================
  // NO SEARCH DATA
  // ====================================================

  if (!showResults) {
    return (
      <div className="bus-booking-page">

        <div className="bus-search-only-container">

          <div className="bus-title">

            <Bus size={28} />

            <h1>
              Bus Ticket Booking
            </h1>

          </div>

          <SearchForm />

        </div>

      </div>
    );
  }


  // ====================================================
  // RESULTS PAGE
  // ====================================================

  return (
  <div className="bus-results-page">

    {/* ============================================
        BACK BUTTON
    ============================================ */}
    <button
      type="button"
      className="bus-back-btn"
      onClick={() => navigate("/")}
    >
      <ArrowLeft size={16} />
      Back
    </button>

    {/* ============================================
        TOP SEARCH
    ============================================ */}

      <SearchForm />


      {/* ============================================
          MAIN LAYOUT
      ============================================ */}

      <div className="bus-results-layout">


        {/* ==========================================
            LEFT FILTER
        ========================================== */}

        <aside className="bus-results-sidebar">

          <div className="filter-heading">

            <h2>Filters</h2>

            <button
              type="button"
              onClick={clearFilters}
            >
              CLEAR ALL
            </button>

          </div>


          {/* AC */}
          <div className="filter-section">

            <h3>AC</h3>

            <div className="filter-buttons">

              <button
                type="button"
                className={
                  selectedAC.includes("AC")
                    ? "filter-box active"
                    : "filter-box"
                }
                onClick={() =>
                  toggleFilter(
                    "AC",
                    selectedAC,
                    setSelectedAC
                  )
                }
              >
                <Snowflake size={16} />
                AC
              </button>

              <button
                type="button"
                className={
                  selectedAC.includes("Non-AC")
                    ? "filter-box active"
                    : "filter-box"
                }
                onClick={() =>
                  toggleFilter(
                    "Non-AC",
                    selectedAC,
                    setSelectedAC
                  )
                }
              >
                <Snowflake size={16} />
                Non-AC
              </button>

            </div>

          </div>


          {/* SEAT TYPE */}
          <div className="filter-section">

            <h3>Seat type</h3>

            <div className="filter-buttons">

              <button
                type="button"
                className={
                  selectedSeat.includes("Seater")
                    ? "filter-box active"
                    : "filter-box"
                }
                onClick={() =>
                  toggleFilter(
                    "Seater",
                    selectedSeat,
                    setSelectedSeat
                  )
                }
              >
                <Armchair size={16} />
                Seater
              </button>

              <button
                type="button"
                className={
                  selectedSeat.includes("Sleeper")
                    ? "filter-box active"
                    : "filter-box"
                }
                onClick={() =>
                  toggleFilter(
                    "Sleeper",
                    selectedSeat,
                    setSelectedSeat
                  )
                }
              >
                <Armchair size={16} />
                Sleeper
              </button>

            </div>

          </div>


          {/* SINGLE SEAT */}
          <div className="filter-section">

            <h3>
              Single Seater/Sleeper
            </h3>

            <label className="checkbox-filter">

              <input type="checkbox" />

              <span>
                <strong>
                  Single Seats
                </strong>

                <small>
                  Separate single window seats
                </small>
              </span>

            </label>

          </div>


          {/* DEPARTURE */}
          <div className="filter-section">

            <h3>Departure</h3>

            {[
              "Before 6 AM",
              "6 AM - 12 PM",
              "12 PM - 6 PM",
              "After 6 PM",
            ].map((range) => (

              <label
                className="checkbox-filter simple"
                key={range}
              >

                <input
                  type="checkbox"
                  checked={selectedDeparture.includes(
                    range
                  )}
                  onChange={() =>
                    toggleFilter(
                      range,
                      selectedDeparture,
                      setSelectedDeparture
                    )
                  }
                />

                <span>
                  {range}
                </span>

              </label>

            ))}

          </div>


          {/* PICKUP POINT */}
          <div className="filter-section pickup-section">

            <div className="pickup-heading">

              <h3>
                Pick up point - {from}
              </h3>

              <button
                type="button"
                onClick={() =>
                  setPickupSearch("")
                }
              >
                CLEAR
              </button>

            </div>


            <div className="pickup-search">

              <SearchIcon size={16} />

              <input
                type="text"
                placeholder="Search"
                value={pickupSearch}
                onChange={(e) =>
                  setPickupSearch(
                    e.target.value
                  )
                }
              />

              {pickupSearch && (
                <button
                  type="button"
                  onClick={() =>
                    setPickupSearch("")
                  }
                >
                  <X size={14} />
                </button>
              )}

            </div>


            <div className="pickup-list">

              {filteredPickupPoints
                .slice(
                  0,
                  showAllPickup
                    ? filteredPickupPoints.length
                    : 4
                )
                .map((point) => (

                  <label
                    key={point}
                    className="pickup-item"
                  >

                    <input type="checkbox" />

                    <span>
                      {point}
                    </span>

                  </label>

                ))}

            </div>


            {filteredPickupPoints.length > 4 && (

              <button
                type="button"
                className="show-more-btn"
                onClick={() =>
                  setShowAllPickup(
                    !showAllPickup
                  )
                }
              >
                {showAllPickup
                  ? "Show less"
                  : "Show more"}
              </button>

            )}

          </div>

        </aside>


        {/* ==========================================
            RIGHT CONTENT
        ========================================== */}

        <main className="bus-results-content">


          {/* TITLE */}
          <div className="results-title-row">

            <div>

              <h1>
                {from} to {to} Bus
              </h1>

              <p>
                Find the best buses for your journey
              </p>

            </div>

            <div className="bus-count">

              {filteredBuses.length} buses found

            </div>

          </div>


          {/* DATE STRIP */}
<div className="date-strip-card">

  <div className="date-strip">

    {dateStrip.map((date) => {

      const short =
        formatShortDate(date);

      const active =
        date === selectedDate;

      return (
        <button
          type="button"
          key={date}
          className={
            active
              ? "date-item active"
              : "date-item"
          }
          onClick={() =>
            handleDateChange(date)
          }
        >

          <strong>
            {short.day} {short.month}
          </strong>

          <span>
            {short.weekday}
          </span>

        </button>
      );

    })}

  </div>

  <button
    type="button"
    className="date-arrow"
    onClick={() => {

      const nextDate =
        addDays(selectedDate, 1);

      handleDateChange(nextDate);

    }}
  >
    <ChevronRight size={22} />
  </button>

</div>

          {/* SORT */}
          <div className="sort-card">

            <div>

              <strong>
                {filteredBuses.length} buses found
              </strong>

            </div>


            <div className="sort-options">

              <span>
                SORT BY
              </span>


              {[
                "Relevance",
                "Rating",
                "Price",
                "Fastest",
                "Departure",
              ].map((sort) => (

                <button
                  type="button"
                  key={sort}
                  className={
                    sortBy === sort
                      ? "sort-option active"
                      : "sort-option"
                  }
                  onClick={() =>
                    setSortBy(sort)
                  }
                >
                  {sort}

                  {sort === "Relevance" && (
                    <ChevronDown size={14} />
                  )}

                </button>

              ))}

            </div>

          </div>

          {/* BUS OPERATOR LIST */}
          <div className="operator-list">

            {filteredBuses.length === 0 ? (

              <div className="no-buses">

                <Bus size={45} />

                <h2>
                  No buses found
                </h2>

                <p>
                  Try changing your filters.
                </p>

                <button
                  type="button"
                  onClick={clearFilters}
                >
                  Clear Filters
                </button>

              </div>

            ) : (

              filteredBuses.map((bus) => (

                <div
                  className="operator-card"
                  key={bus.id}
                >

                  {/* OPERATOR TOP */}
                  <div className="operator-main">

                    <div className="operator-logo">

                      <Bus size={28} />

                    </div>


                    <div className="operator-info">

                      <h2>
                        {bus.name}
                      </h2>

                      <p>
                        {bus.subtitle}
                      </p>

                      <div className="operator-meta">

                        <span className="rating-badge">

                          <Star
                            size={13}
                            fill="currentColor"
                          />

                          {bus.rating}

                        </span>

                        <span>
                          {bus.buses} Buses
                        </span>

                        <span>
                          {bus.ac
                            ? "AC"
                            : "Non-AC"}
                        </span>

                        <span>
                          {bus.seatType}
                        </span>

                      </div>

                    </div>


                    <div className="operator-price">

                      <small>
                        Starting from
                      </small>

                      <strong>
                        ₹{bus.priceMin} - ₹
                        {bus.priceMax}
                      </strong>

                      <button
                        type="button"
                        onClick={() =>
                          handleSelectBus(bus)
                        }
                      >
                        View buses
                        <ChevronDown size={16} />
                      </button>

                    </div>

                  </div>


                  {/* EXPANDED DETAILS */}
                  <div className="operator-details">

                    <div className="operator-detail-item">

                      <Clock size={16} />

                      <span>
                        {bus.departure}
                      </span>

                    </div>


                    <div className="route-line">

                      <span></span>

                      <div></div>

                      <span></span>

                    </div>


                    <div className="operator-detail-item">

                      <MapPinned size={16} />

                      <span>
                        {bus.arrival}
                      </span>

                    </div>


                    <div className="duration-text">

                      {bus.duration}

                    </div>

                  </div>

                </div>

              ))

            )}

          </div>

        </main>

      </div>

    </div>
  );
}

export default BusResult;