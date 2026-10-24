import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft, MapPin, CalendarDays, Users, Search, Star,
  Wifi, Coffee, CarFront, Waves, SlidersHorizontal, ShieldCheck,
  Heart, ChevronDown, Hotel, RotateCcw
} from "lucide-react";
import "./HotelResults.css";

const hotels = [
  {
    id: "grand-palace",
    name: "The Grand Palace",
    location: "City Center",
    rating: 4.7,
    reviews: 1240,
    price: 2499,
    oldPrice: 3299,
    stars: 5,
    type: "Hotel",
    badge: "Popular choice",
    images: [
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=900",
      "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=900",
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=900",
      "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=900",
    ],
    features: ["Free WiFi", "Breakfast", "Air conditioning"],
    description: "A comfortable premium stay with modern rooms and convenient access to popular attractions.",
  },
  {
    id: "royal-comfort",
    name: "Royal Comfort Hotel",
    location: "Main Market",
    rating: 4.5,
    reviews: 876,
    price: 1899,
    oldPrice: 2499,
    stars: 4,
    type: "Hotel",
    badge: "Value for money",
    images: [
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=900",
      "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=900",
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=900",
      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=900",
    ],
    features: ["Free WiFi", "Parking", "Air conditioning"],
    description: "A practical and welcoming hotel close to shopping, dining and local transport.",
  },
  {
    id: "holiday-inn",
    name: "Holiday Inn Resort",
    location: "Near Tourist Area",
    rating: 4.8,
    reviews: 1560,
    price: 3299,
    oldPrice: 4199,
    stars: 5,
    type: "Resort",
    badge: "Top rated",
    images: [
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=900",
      "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=900",
      "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=900",
      "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=900",
    ],
    features: ["Swimming pool", "Breakfast", "Free WiFi"],
    description: "A relaxing resort-style property with leisure facilities and spacious guest rooms.",
  },
];

const formatPrice = (price) => Number(price || 0).toLocaleString("en-IN");

function HotelResults() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [destination, setDestination] = useState(searchParams.get("destination") || "");
  const [checkIn, setCheckIn] = useState(searchParams.get("checkIn") || "");
  const [checkOut, setCheckOut] = useState(searchParams.get("checkOut") || "");
  const [guests, setGuests] = useState(searchParams.get("guests") || "2 Adults, 1 Room");

  const [propertyTypes, setPropertyTypes] = useState([]);
  const [starRatings, setStarRatings] = useState([]);
  const [priceFilter, setPriceFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recommended");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [favorites, setFavorites] = useState([]);

  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 1;
    const start = new Date(`${checkIn}T00:00:00`);
    const end = new Date(`${checkOut}T00:00:00`);
    const difference = Math.ceil((end - start) / 86400000);
    return difference > 0 ? difference : 1;
  }, [checkIn, checkOut]);

  const handleSearch = (event) => {
    event.preventDefault();

    if (!destination.trim()) {
      window.alert("Please enter a destination.");
      return;
    }
    if (!checkIn || !checkOut) {
      window.alert("Please select check-in and check-out dates.");
      return;
    }
    if (checkOut <= checkIn) {
      window.alert("Check-out date must be after check-in date.");
      return;
    }

    setSearchParams({
      destination: destination.trim(),
      checkIn,
      checkOut,
      guests,
    });
  };

  const toggleArrayValue = (value, values, setter) => {
    setter(values.includes(value)
      ? values.filter((item) => item !== value)
      : [...values, value]);
  };

  const resetFilters = () => {
    setPropertyTypes([]);
    setStarRatings([]);
    setPriceFilter("all");
    setSortBy("recommended");
  };

  const filteredHotels = useMemo(() => {
    let result = hotels.filter((hotel) => {
      const matchesType = propertyTypes.length === 0 || propertyTypes.includes(hotel.type);
      const matchesStars = starRatings.length === 0 || starRatings.includes(hotel.stars);
      const matchesPrice =
        priceFilter === "all" ||
        (priceFilter === "under2000" && hotel.price < 2000) ||
        (priceFilter === "2000to3000" && hotel.price >= 2000 && hotel.price <= 3000) ||
        (priceFilter === "above3000" && hotel.price > 3000);

      return matchesType && matchesStars && matchesPrice;
    });

    if (sortBy === "priceLow") result = [...result].sort((a, b) => a.price - b.price);
    if (sortBy === "priceHigh") result = [...result].sort((a, b) => b.price - a.price);
    if (sortBy === "rating") result = [...result].sort((a, b) => b.rating - a.rating);

    return result;
  }, [propertyTypes, starRatings, priceFilter, sortBy]);

  const openHotel = (hotel) => {
    const params = new URLSearchParams({
      hotelId: hotel.id,
      hotelName: hotel.name,
      name: hotel.name,
      location: hotel.location,
      destination,
      price: String(hotel.price),
      oldPrice: String(hotel.oldPrice),
      rating: String(hotel.rating),
      reviews: String(hotel.reviews),
      stars: String(hotel.stars),
      type: hotel.type,
      checkIn,
      checkOut,
      guests,
      images: JSON.stringify(hotel.images),
      description: hotel.description,
      features: JSON.stringify(hotel.features),
    });

    navigate(`/hotel-details?${params.toString()}`);
  };

  const toggleFavorite = (id) => {
    setFavorites((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  };

  return (
    <main className="hotel-results-page">
      <div className="hotel-results-container">
        <button className="hotel-back-button" onClick={() => navigate(-1)} type="button">
          <ArrowLeft size={18} /> Back
        </button>

        <section className="hotel-search-panel">
          <div className="hotel-search-title">
            <span className="hotel-title-icon"><Hotel size={21} /></span>
            <div>
              <h1>Find your perfect stay</h1>
              <p>Compare stays, prices and amenities in one place.</p>
            </div>
          </div>

          <form className="hotel-search-form" onSubmit={handleSearch}>
            <label className="hotel-search-field hotel-destination-field">
              <MapPin size={19} />
              <span>
                <small>DESTINATION</small>
                <input
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="City, area or hotel"
                  aria-label="Destination"
                />
              </span>
            </label>

            <label className="hotel-search-field">
              <CalendarDays size={19} />
              <span>
                <small>CHECK-IN</small>
                <input
                  type="date"
                  value={checkIn}
                  min={new Date().toISOString().slice(0, 10)}
                  onChange={(e) => setCheckIn(e.target.value)}
                  aria-label="Check-in date"
                />
              </span>
            </label>

            <label className="hotel-search-field">
              <CalendarDays size={19} />
              <span>
                <small>CHECK-OUT</small>
                <input
                  type="date"
                  value={checkOut}
                  min={checkIn || new Date().toISOString().slice(0, 10)}
                  onChange={(e) => setCheckOut(e.target.value)}
                  aria-label="Check-out date"
                />
              </span>
            </label>

            <label className="hotel-search-field">
              <Users size={19} />
              <span>
                <small>GUESTS & ROOMS</small>
                <select value={guests} onChange={(e) => setGuests(e.target.value)}>
                  <option>1 Adult, 1 Room</option>
                  <option>2 Adults, 1 Room</option>
                  <option>3 Adults, 1 Room</option>
                  <option>2 Adults, 2 Rooms</option>
                  <option>4 Adults, 2 Rooms</option>
                  <option>Family, 1 Room</option>
                </select>
              </span>
              <ChevronDown size={14} />
            </label>

            <button className="hotel-search-submit" type="submit">
              <Search size={18} /> SEARCH
            </button>
          </form>
        </section>

        <div className="hotel-results-heading">
          <div>
            <div className="hotel-breadcrumb">Home <span>/</span> Hotels <span>/</span> Results</div>
            <h2>Hotels in {destination || "your destination"}</h2>
            <p>
              {checkIn || "Select check-in"} <span>→</span> {checkOut || "Select check-out"}
              <i /> {guests}
            </p>
          </div>
          <div className="hotel-trust-chip"><ShieldCheck size={17} /> Trusted stays</div>
        </div>

        <div className="hotel-results-layout">
          <aside className={`hotel-filter-sidebar ${mobileFiltersOpen ? "filters-open" : ""}`}>
            <div className="hotel-filter-heading">
              <div><SlidersHorizontal size={18} /><strong>Filters</strong></div>
              <button type="button" onClick={resetFilters}>Reset</button>
            </div>

            <div className="hotel-filter-section">
              <h3>Property type</h3>
              {["Hotel", "Resort"].map((type) => (
                <label className="hotel-filter-option" key={type}>
                  <input
                    type="checkbox"
                    checked={propertyTypes.includes(type)}
                    onChange={() => toggleArrayValue(type, propertyTypes, setPropertyTypes)}
                  />
                  <span>{type}</span>
                </label>
              ))}
            </div>

            <div className="hotel-filter-section">
              <h3>Star rating</h3>
              {[5, 4, 3].map((rating) => (
                <label className="hotel-filter-option" key={rating}>
                  <input
                    type="checkbox"
                    checked={starRatings.includes(rating)}
                    onChange={() => toggleArrayValue(rating, starRatings, setStarRatings)}
                  />
                  <span>{rating} star</span>
                </label>
              ))}
            </div>

            <div className="hotel-filter-section">
              <h3>Price per night</h3>
              {[
                ["all", "All prices"],
                ["under2000", "Under ₹2,000"],
                ["2000to3000", "₹2,000 – ₹3,000"],
                ["above3000", "Above ₹3,000"],
              ].map(([value, label]) => (
                <label className="hotel-filter-option" key={value}>
                  <input
                    type="radio"
                    name="hotel-price"
                    checked={priceFilter === value}
                    onChange={() => setPriceFilter(value)}
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>

            <div className="hotel-filter-note">
              <ShieldCheck size={18} />
              <span>Compare prices and choose a stay that suits your trip.</span>
            </div>

            <button
              type="button"
              className="hotel-filter-apply"
              onClick={() => setMobileFiltersOpen(false)}
            >
              Show {filteredHotels.length} stays
            </button>
          </aside>

          <section className="hotel-results-list">
            <div className="hotel-list-toolbar">
              <div>
                <h3>{filteredHotels.length} stays found</h3>
                <p>Prices shown per room, per night</p>
              </div>
              <div className="hotel-sort-control">
                <label htmlFor="hotel-sort">Sort by</label>
                <select id="hotel-sort" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="recommended">Recommended</option>
                  <option value="priceLow">Price: Low to high</option>
                  <option value="priceHigh">Price: High to low</option>
                  <option value="rating">Guest rating</option>
                </select>
              </div>
              <button
                type="button"
                className="hotel-mobile-filter-button"
                onClick={() => setMobileFiltersOpen((open) => !open)}
              >
                <SlidersHorizontal size={16} /> Filters
              </button>
            </div>

            {filteredHotels.length === 0 ? (
              <div className="hotel-empty-state">
                <Hotel size={38} />
                <h3>No stays match these filters</h3>
                <p>Try resetting the filters to see all available demo properties.</p>
                <button type="button" onClick={resetFilters}><RotateCcw size={16} /> Reset filters</button>
              </div>
            ) : filteredHotels.map((hotel) => (
              <article className="hotel-result-card" key={hotel.id}>
                <button
                  type="button"
                  className={`hotel-favorite-button ${favorites.includes(hotel.id) ? "is-favorite" : ""}`}
                  aria-label={favorites.includes(hotel.id) ? "Remove from favorites" : "Add to favorites"}
                  onClick={() => toggleFavorite(hotel.id)}
                >
                  <Heart size={18} fill={favorites.includes(hotel.id) ? "currentColor" : "none"} />
                </button>

                <button
                  type="button"
                  className="hotel-card-image-button"
                  onClick={() => openHotel(hotel)}
                  aria-label={`View ${hotel.name}`}
                >
                  <img src={hotel.images[0]} alt={hotel.name} className="hotel-card-image" />
                  <span className="hotel-photo-count">4 photos</span>
                  <span className="hotel-image-badge">{hotel.badge}</span>
                </button>

                <div className="hotel-card-info">
                  <div className="hotel-card-type">{hotel.type} <span>·</span> {"★".repeat(hotel.stars)}</div>
                  <button className="hotel-card-title" type="button" onClick={() => openHotel(hotel)}>
                    {hotel.name}
                  </button>
                  <p className="hotel-card-location"><MapPin size={14} /> {hotel.location}{destination ? `, ${destination}` : ""}</p>

                  <div className="hotel-rating-line">
                    <span className="hotel-rating-score"><Star size={13} fill="currentColor" /> {hotel.rating}</span>
                    <span className="hotel-review-count">Excellent · {hotel.reviews.toLocaleString("en-IN")} reviews</span>
                  </div>

                  <div className="hotel-amenities">
                    {hotel.features.map((feature) => (
                      <span key={feature}>
                        {feature.toLowerCase().includes("wifi") ? <Wifi size={14} /> :
                         feature.toLowerCase().includes("breakfast") ? <Coffee size={14} /> :
                         feature.toLowerCase().includes("parking") ? <CarFront size={14} /> :
                         feature.toLowerCase().includes("pool") ? <Waves size={14} /> : <ShieldCheck size={14} />}
                        {feature}
                      </span>
                    ))}
                  </div>

                  <p className="hotel-free-cancel"><ShieldCheck size={15} /> Comfortable stay · Check room details</p>
                  <button className="hotel-view-details-link" type="button" onClick={() => openHotel(hotel)}>
                    View hotel details <span>→</span>
                  </button>
                </div>

                <div className="hotel-card-price">
                  <span className="hotel-deal-label">Special deal</span>
                  <div className="hotel-old-price">₹{formatPrice(hotel.oldPrice)}</div>
                  <div className="hotel-current-price">₹{formatPrice(hotel.price)}</div>
                  <p>per night</p>
                  <div className="hotel-tax-note">+ taxes & fees may apply</div>
                  <div className="hotel-total-price">
                    <span>{nights} night{nights !== 1 ? "s" : ""} total</span>
                    <strong>₹{formatPrice(hotel.price * nights)}</strong>
                  </div>
                  <button className="hotel-view-room-button" type="button" onClick={() => openHotel(hotel)}>
                    VIEW ROOMS <span>→</span>
                  </button>
                </div>
              </article>
            ))}

            <p className="hotel-demo-disclaimer">
              Demo listings for website development. Prices, ratings and availability are illustrative, not live booking data.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}

export default HotelResults;