import "./Tour.css";

import {
  Link,
  useSearchParams,
  useNavigate,
} from "react-router-dom";

import {
  ArrowLeft,
  Star,
  Clock,
  MapPin,
  ArrowRight,
} from "lucide-react";

import tours from "../data/tours";
import TravelContact from "../components/TravelContact";

function Tours() {
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  const destinationFilter =
    searchParams.get("destination");

  const filteredTours = destinationFilter
    ? tours.filter(
        (tour) =>
          tour.destination?.toLowerCase() ===
          destinationFilter.toLowerCase()
      )
    : tours;

  return (
    <main className="tours-page">

      {/* =========================================
          BACK BUTTON
      ========================================= */}
      <div className="tours-back-wrapper">
        <button
          type="button"
          className="tours-back-btn"
          onClick={() => navigate("/")}
        >
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>
      </div>

      {/* =========================================
          PAGE HEADER
      ========================================= */}
      <section className="tours-header">

        <div className="tours-header-container">

          <span className="tours-label">
            EXPLORE WITH MK TRAVELS
          </span>

          <h1>
            Popular Tour Packages
          </h1>

          <p>
            Discover amazing destinations, exciting
            experiences and carefully planned holiday
            packages.
          </p>

        </div>

      </section>

      {/* =========================================
          TOURS CONTENT
      ========================================= */}
      <section className="tours-section">

        <div className="tours-container">

          {/* FILTER RESULT */}
          <div className="tours-topbar">

            <div>

              <h2>
                {destinationFilter
                  ? `${destinationFilter} Tours`
                  : "All Tour Packages"}
              </h2>

              <p>
                {filteredTours.length} packages available
              </p>

            </div>

          </div>

          {/* =========================================
              TOUR GRID
          ========================================= */}

          {filteredTours.length > 0 ? (

            <div className="tours-grid">

              {filteredTours.map((tour) => (

                <article
                  key={tour.id}
                  className="tour-card"
                >

                  {/* =================================
                      IMAGE
                  ================================= */}

                  <Link
                    to={`/tours/${tour.id}`}
                    className="tour-image-link"
                  >

                    <div className="tour-card-image">
  <img
    src={tour.image}
    alt={tour.name}
  />

  <div className="tour-image-overlay" />

  {/* COUNTRY BADGE — HOME CARD STYLE */}
  <span className="tour-country">
    <MapPin size={11} />
    <span>{tour.country}</span>
  </span>

  {/* RATING BADGE — HOME CARD STYLE */}
  <span className="tour-rating">
    <Star
      size={13}
      fill="currentColor"
    />

    <strong>{tour.rating}</strong>

    {tour.reviews != null && (
      <span className="tour-rating-reviews">
        ({tour.reviews})
      </span>
    )}
  </span>
</div>
                    

                  </Link>


                  {/* =================================
                      CONTENT
                  ================================= */}

                  <div className="tour-card-content">

                    {/* LOCATION */}

                    <div className="tour-location">

                      <MapPin size={14} />

                      <span>
                        {tour.destination}
                      </span>

                    </div>


                    {/* TOUR NAME */}

                    <Link
                      to={`/tours/${tour.id}`}
                      className="tour-title-link"
                    >

                      <h3>
                        {tour.name}
                      </h3>

                    </Link>


                    {/* DESCRIPTION */}

                    <p className="tour-description">
                      {tour.description}
                    </p>


                    {/* DURATION */}

                    <div className="tour-duration">

                      <Clock size={14} />

                      <span>
                        {tour.duration}
                      </span>

                    </div>


                    {/* =================================
                        PRICE + VIEW TOUR
                    ================================= */}

                    <div className="tour-price-row">

                      <div className="tour-price-wrapper">

                        <span className="starting-from">
                          Starting from
                        </span>

                        <div className="tour-price">

                          <span className="tour-price-current">
                            ₹
                            {tour.price.toLocaleString(
                              "en-IN"
                            )}
                          </span>

                          {tour.oldPrice && (
                            <span className="tour-price-old">
                              ₹
                              {tour.oldPrice.toLocaleString(
                                "en-IN"
                              )}
                            </span>
                          )}

                        </div>

                      </div>


                      {/* VIEW TOUR */}

                      <Link
                        to={`/tours/${tour.id}`}
                        className="tour-view-button"
                      >

                        <span>
                          View Tour
                        </span>

                        <ArrowRight size={14} />

                      </Link>

                    </div>


                    {/* =================================
                        CALL + REQUEST CALLBACK
                    ================================= */}

                    <TravelContact
                      destinationName={
                        tour.destination || tour.name
                      }
                    />

                  </div>

                </article>

              ))}

            </div>

          ) : (

            /* =========================================
                NO RESULT
            ========================================= */

            <div className="no-tours">

              <h3>
                No tours found
              </h3>

              <p>
                We couldn't find any tours for
                "{destinationFilter}".
              </p>

              <Link
                to="/tours"
                className="view-all-tours"
              >
                View All Tours
              </Link>

            </div>

          )}

        </div>

      </section>

    </main>
  );
}

export default Tours;