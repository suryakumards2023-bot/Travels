import "./TourDetails.css";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Star,
  MapPin,
  Clock3,
  Hotel,
  Bus,
  Utensils,
  CalendarDays,
  Check,
  X,
  Phone,
  Mail,
  ShieldCheck,
} from "lucide-react";

import tours from "../data/tours";
import "./TourDetails.css";

const TourDetails = () => {
  const { id } = useParams();

  const tour = tours.find((item) => String(item.id) === String(id));

  if (!tour) {
    return (
      <div className="tour-not-found">
        <h2>Tour Not Found</h2>
        <p>The tour you are looking for does not exist.</p>

        <Link to="/tours" className="back-tours-button">
          <ArrowLeft size={18} />
          Back to Tours
        </Link>
      </div>
    );
  }

  const itinerary = [
    {
      day: "Day 1",
      title: `Arrival in ${tour.destination}`,
      description:
        `Welcome to ${tour.destination}. On arrival, our representative will meet you and transfer you to the hotel. Check-in, relax and enjoy the evening at leisure.`,
    },
    {
      day: "Day 2",
      title: "Local Sightseeing",
      description:
        "After breakfast, proceed for a full-day sightseeing tour covering the major attractions and popular landmarks of the destination.",
    },
    {
      day: "Day 3",
      title: "Adventure & Exploration",
      description:
        "Enjoy an exciting day exploring beautiful locations, local attractions and memorable experiences. Evening is free for shopping and leisure.",
    },
    {
      day: "Day 4",
      title: "Leisure Day",
      description:
        "Enjoy a relaxed morning at the hotel. Spend the rest of the day exploring the destination on your own or choose optional activities.",
    },
    {
      day: "Day 5",
      title: "Departure",
      description:
        "After breakfast, check out from the hotel. Our representative will transfer you to the airport or railway station for your onward journey.",
    },
  ];

  const inclusions = [
    "Accommodation as per itinerary",
    "Daily breakfast",
    "Airport / railway station transfers",
    "Sightseeing as mentioned in itinerary",
    "Transportation during the tour",
    "Professional travel assistance",
  ];

  const exclusions = [
    "Flight or train tickets",
    "Personal expenses",
    "Travel insurance",
    "Adventure activity charges",
    "Lunch and dinner unless mentioned",
    "Anything not mentioned in inclusions",
  ];

  return (
    <div className="tour-details-page">

      {/* =========================
          BACK
      ========================= */}

      <div className="tour-details-container">

        <Link to="/tours" className="tour-back-link">
          <ArrowLeft size={18} />
          Back to Tours
        </Link>


        {/* =========================
            HERO
        ========================= */}

        <section className="tour-details-hero">

          <div className="tour-details-image">

            <img
              src={tour.image}
              alt={tour.name}
            />

            <span className="tour-country-badge">
              {tour.country}
            </span>

          </div>


          <div className="tour-details-summary">

            <div className="tour-rating-row">

              <span className="tour-rating">
                <Star size={14} fill="currentColor" />
                {tour.rating}
              </span>

              <span className="tour-reviews">
                {tour.reviews} Reviews
              </span>

            </div>


            <h1>{tour.name}</h1>


            <div className="tour-location">
              <MapPin size={17} />
              {tour.destination}, {tour.country}
            </div>


            <p className="tour-description">
              {tour.description}
            </p>


            <div className="tour-meta-grid">

              <div className="tour-meta-item">
                <Clock3 size={20} />
                <div>
                  <span>Duration</span>
                  <strong>{tour.duration}</strong>
                </div>
              </div>

              <div className="tour-meta-item">
                <Hotel size={20} />
                <div>
                  <span>Stay</span>
                  <strong>Hotel Included</strong>
                </div>
              </div>

              <div className="tour-meta-item">
                <Bus size={20} />
                <div>
                  <span>Transport</span>
                  <strong>Private Transfer</strong>
                </div>
              </div>

              <div className="tour-meta-item">
                <Utensils size={20} />
                <div>
                  <span>Meals</span>
                  <strong>Breakfast</strong>
                </div>
              </div>

            </div>

          </div>

        </section>


        {/* =========================
            MAIN CONTENT
        ========================= */}

        <div className="tour-details-layout">


          {/* LEFT CONTENT */}

          <div className="tour-details-main">


            {/* =========================
                TOUR OVERVIEW
            ========================= */}

            <section className="tour-detail-card">

              <div className="tour-section-title">
                <div className="tour-section-icon">
                  <CalendarDays size={20} />
                </div>

                <div>
                  <h2>Tour Overview</h2>
                  <p>Everything you need to know about this tour</p>
                </div>
              </div>


              <p className="overview-text">
                {tour.description} This carefully planned holiday
                package is designed to give you a comfortable,
                enjoyable and memorable travel experience. Explore
                the best attractions, enjoy comfortable accommodation
                and experience the local culture.
              </p>


              <div className="overview-highlights">

                <div>
                  <strong>Destination</strong>
                  <span>{tour.destination}</span>
                </div>

                <div>
                  <strong>Duration</strong>
                  <span>{tour.duration}</span>
                </div>

                <div>
                  <strong>Rating</strong>
                  <span>★ {tour.rating} / 5</span>
                </div>

                <div>
                  <strong>Package Type</strong>
                  <span>Family Holiday</span>
                </div>

              </div>

            </section>


            {/* =========================
                HOTEL / STAY
            ========================= */}

            <section className="tour-detail-card">

              <div className="tour-section-title">

                <div className="tour-section-icon">
                  <Hotel size={20} />
                </div>

                <div>
                  <h2>Hotel / Stay</h2>
                  <p>Comfortable accommodation during your trip</p>
                </div>

              </div>


              <div className="stay-card">

                <div className="stay-icon">
                  <Hotel size={25} />
                </div>

                <div className="stay-content">

                  <h3>Premium Hotel Accommodation</h3>

                  <div className="stay-rating">
                    <Star size={14} fill="currentColor" />
                    <Star size={14} fill="currentColor" />
                    <Star size={14} fill="currentColor" />
                    <Star size={14} fill="currentColor" />
                    <Star size={14} fill="currentColor" />
                  </div>

                  <p>
                    Comfortable rooms with modern facilities,
                    breakfast and convenient location.
                  </p>

                  <div className="stay-features">
                    <span>✓ AC Room</span>
                    <span>✓ Wi-Fi</span>
                    <span>✓ Breakfast</span>
                    <span>✓ Room Service</span>
                  </div>

                </div>

              </div>

            </section>


            {/* =========================
                TRANSPORT
            ========================= */}

            <section className="tour-detail-card">

              <div className="tour-section-title">

                <div className="tour-section-icon">
                  <Bus size={20} />
                </div>

                <div>
                  <h2>Transport</h2>
                  <p>Comfortable transportation throughout your trip</p>
                </div>

              </div>


              <div className="transport-grid">

                <div className="transport-item">

                  <Bus size={22} />

                  <div>
                    <strong>Airport / Railway Transfer</strong>
                    <span>Pickup and drop included</span>
                  </div>

                </div>


                <div className="transport-item">

                  <Bus size={22} />

                  <div>
                    <strong>Local Sightseeing</strong>
                    <span>Private vehicle included</span>
                  </div>

                </div>

              </div>

            </section>


            {/* =========================
                MEALS
            ========================= */}

            <section className="tour-detail-card">

              <div className="tour-section-title">

                <div className="tour-section-icon">
                  <Utensils size={20} />
                </div>

                <div>
                  <h2>Meals</h2>
                  <p>Meal plan included in your package</p>
                </div>

              </div>


              <div className="meal-grid">

                <div className="meal-item">
                  <div className="meal-icon">🍳</div>

                  <div>
                    <strong>Breakfast</strong>
                    <span>Daily breakfast included</span>
                  </div>
                </div>


                <div className="meal-item">
                  <div className="meal-icon">🍽️</div>

                  <div>
                    <strong>Lunch</strong>
                    <span>Not included</span>
                  </div>
                </div>


                <div className="meal-item">
                  <div className="meal-icon">🍛</div>

                  <div>
                    <strong>Dinner</strong>
                    <span>Not included</span>
                  </div>
                </div>

              </div>

            </section>


            {/* =========================
                ITINERARY
            ========================= */}

            <section className="tour-detail-card">

              <div className="tour-section-title">

                <div className="tour-section-icon">
                  <CalendarDays size={20} />
                </div>

                <div>
                  <h2>Day-wise Itinerary</h2>
                  <p>Your complete trip plan</p>
                </div>

              </div>


              <div className="itinerary">

                {itinerary.map((item, index) => (

                  <div
                    className="itinerary-item"
                    key={index}
                  >

                    <div className="itinerary-number">
                      {index + 1}
                    </div>


                    <div className="itinerary-content">

                      <span className="itinerary-day">
                        {item.day}
                      </span>

                      <h3>{item.title}</h3>

                      <p>{item.description}</p>

                    </div>

                  </div>

                ))}

              </div>

            </section>


            {/* =========================
                INCLUSIONS / EXCLUSIONS
            ========================= */}

            <section className="tour-detail-card">

              <div className="inclusion-columns">

                <div>

                  <div className="tour-section-title small">

                    <div className="tour-section-icon success">
                      <Check size={20} />
                    </div>

                    <h2>Inclusions</h2>

                  </div>

                  <ul className="inclusion-list">

                    {inclusions.map((item, index) => (
                      <li key={index}>
                        <Check size={16} />
                        {item}
                      </li>
                    ))}

                  </ul>

                </div>


                <div>

                  <div className="tour-section-title small">

                    <div className="tour-section-icon danger">
                      <X size={20} />
                    </div>

                    <h2>Exclusions</h2>

                  </div>

                  <ul className="inclusion-list exclusions">

                    {exclusions.map((item, index) => (
                      <li key={index}>
                        <X size={16} />
                        {item}
                      </li>
                    ))}

                  </ul>

                </div>

              </div>

            </section>

          </div>


          {/* =========================
              BOOKING SIDEBAR
          ========================= */}

          <aside className="tour-booking-card">

            <div className="booking-card-inner">

              <span className="booking-label">
                PACKAGE PRICE
              </span>

              <div className="booking-price">

                <strong>
                  ₹{tour.price.toLocaleString("en-IN")}
                </strong>

                <del>
                  ₹{tour.oldPrice.toLocaleString("en-IN")}
                </del>

              </div>


              <span className="booking-person">
                per person
              </span>


              <div className="booking-saving">
                Save ₹
                {(tour.oldPrice - tour.price).toLocaleString("en-IN")}
              </div>


              <Link
                to={`/booking/${tour.id}`}
                className="book-now-button"
              >
                Book Now
              </Link>


              <button className="enquiry-button">
                <Phone size={17} />
                Enquire Now
              </button>


              <div className="booking-assurance">

                <ShieldCheck size={18} />

                <div>
                  <strong>Secure Booking</strong>
                  <span>Safe & trusted travel booking</span>
                </div>

              </div>


              <div className="booking-contact">

                <div>
                  <Phone size={15} />
                  <span>+91 98765 43210</span>
                </div>

                <div>
                  <Mail size={15} />
                  <span>support@mktravels.com</span>
                </div>

              </div>

            </div>

          </aside>

        </div>

      </div>

    </div>
  );
};

export default TourDetails;