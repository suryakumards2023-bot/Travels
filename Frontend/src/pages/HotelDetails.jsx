import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Star,
  Wifi,
  Coffee,
  CarFront,
  Waves,
  ShieldCheck,
  Users,
  BedDouble,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  CalendarDays,
  Heart,
  Tv,
  Wind,
} from "lucide-react";
import "./HotelDetails.css";

const DEFAULT_IMAGES = [
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200",
  "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1200",
  "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200",
  "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=1200",
];

const formatPrice = (amount) =>
  Number(amount || 0).toLocaleString("en-IN");

function HotelDetails() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const hotelId = params.get("hotelId") || "hotel-stay";
  const hotelName =
    params.get("hotelName") || params.get("name") || "Premium Hotel";
  const location =
    params.get("location") || params.get("destination") || "India";
  const destination = params.get("destination") || location;
  const price = Number(params.get("price") || 2499);
  const oldPrice = Number(params.get("oldPrice") || price);
  const rating = params.get("rating") || "4.5";
  const reviews = params.get("reviews") || "500";
  const stars = Math.min(5, Math.max(1, Number(params.get("stars") || 4)));
  const checkIn = params.get("checkIn") || "";
  const checkOut = params.get("checkOut") || "";
  const guests = params.get("guests") || "2 Adults, 1 Room";

  const images = useMemo(() => {
    try {
      const value = JSON.parse(params.get("images") || "[]");
      return Array.isArray(value) && value.length > 0
        ? value
        : DEFAULT_IMAGES;
    } catch {
      return DEFAULT_IMAGES;
    }
  }, [params]);

  const features = useMemo(() => {
    try {
      const value = JSON.parse(params.get("features") || "[]");
      return Array.isArray(value) && value.length
        ? value
        : ["Free WiFi", "Breakfast", "Air conditioning", "Parking"];
    } catch {
      return ["Free WiFi", "Breakfast", "Air conditioning", "Parking"];
    }
  }, [params]);

  const description =
    params.get("description") ||
    `${hotelName} offers a comfortable stay with modern amenities and convenient access to ${destination}. Choose the room that best suits your trip.`;

  const [selectedImage, setSelectedImage] = useState(0);
  const [roomType, setRoomType] = useState("Deluxe Room");
  const [isFavorite, setIsFavorite] = useState(false);

  const rooms = [
    {
      name: "Standard Room",
      multiplier: 0.8,
      description: "Comfortable room for a relaxing stay",
      size: "220 sq.ft.",
      benefits: ["Free WiFi", "Private bathroom"],
    },
    {
      name: "Deluxe Room",
      multiplier: 1,
      description: "Extra comfort with upgraded facilities",
      size: "300 sq.ft.",
      benefits: ["Free WiFi", "Air conditioning", "Private bathroom"],
    },
    {
      name: "Premium Suite",
      multiplier: 1.5,
      description: "Spacious suite with premium comfort",
      size: "450 sq.ft.",
      benefits: ["Free WiFi", "Premium amenities", "Spacious room"],
    },
  ];

  const selectedRoom =
    rooms.find((room) => room.name === roomType) || rooms[1];

  const roomPrice = Math.round(price * selectedRoom.multiplier);

  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 1;

    const start = new Date(`${checkIn}T00:00:00`);
    const end = new Date(`${checkOut}T00:00:00`);
    const days = Math.ceil((end - start) / 86400000);

    return days > 0 ? days : 1;
  }, [checkIn, checkOut]);

  const estimatedTotal = roomPrice * nights;

  const getFeatureIcon = (feature) => {
    const text = feature.toLowerCase();

    if (text.includes("wifi")) return <Wifi />;
    if (text.includes("breakfast")) return <Coffee />;
    if (text.includes("parking")) return <CarFront />;
    if (text.includes("pool")) return <Waves />;
    if (text.includes("air")) return <Wind />;
    if (text.includes("tv")) return <Tv />;

    return <CheckCircle2 />;
  };

  const goToImage = (direction) => {
    setSelectedImage((current) => {
      const count = images.length;
      return (current + direction + count) % count;
    });
  };

  const handleBooking = () => {
    const bookingParams = new URLSearchParams({
      type: "hotel",
      hotelId,
      hotelName,
      name: hotelName,
      location,
      destination,
      price: String(roomPrice),
      oldPrice: String(oldPrice),
      rating: String(rating),
      reviews: String(reviews),
      stars: String(stars),
      checkIn,
      checkOut,
      guests,
      rooms: "1",
      roomType,
      nights: String(nights),
      images: JSON.stringify(images),
    });

    navigate(`/hotel-booking?${bookingParams.toString()}`);
  };

  return (
    <main className="hotel-details-page">
      <div className="hotel-details-container">
        <button
          type="button"
          className="hotel-details-back"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={18} />
          Back to hotels
        </button>

        <div className="hotel-details-breadcrumb">
          <button type="button" onClick={() => navigate("/")}>
            Home
          </button>
          <ChevronRight size={14} />
          <span>Hotels</span>
          <ChevronRight size={14} />
          <span>{destination}</span>
        </div>

        {/* Hotel heading */}
        <section className="hotel-details-heading">
          <div className="hotel-details-heading-main">
            <div className="hotel-details-star-row">
              {Array.from({ length: stars }).map((_, index) => (
                <Star
                  key={index}
                  size={15}
                  fill="currentColor"
                  strokeWidth={1.5}
                />
              ))}
              <span className="hotel-property-type">HOTEL</span>
            </div>

            <h1>{hotelName}</h1>

            <p className="hotel-details-address">
              <MapPin size={17} />
              {location}
              {destination && location !== destination
                ? `, ${destination}`
                : ""}
            </p>

            <div className="hotel-details-rating-row">
              <span className="hotel-details-rating-score">
                {rating} <Star size={12} fill="currentColor" />
              </span>
              <strong>Very good</strong>
              <span>{Number(reviews).toLocaleString("en-IN")} guest reviews</span>
            </div>
          </div>

          <div className="hotel-details-heading-actions">
            <button
              type="button"
              className={`hotel-details-favorite ${
                isFavorite ? "active" : ""
              }`}
              onClick={() => setIsFavorite((value) => !value)}
            >
              <Heart
                size={18}
                fill={isFavorite ? "currentColor" : "none"}
              />
              {isFavorite ? "Saved" : "Save"}
            </button>

            <div className="hotel-details-starting-price">
              <span>Starting from</span>
              <strong>₹{formatPrice(price)}</strong>
              <small>per room / night</small>
            </div>
          </div>
        </section>

        {/* Hotel photo gallery */}
        <section className="hotel-details-gallery">
          <div className="hotel-gallery-main">
            <img
              src={images[selectedImage]}
              alt={`${hotelName} property photo ${selectedImage + 1}`}
              onError={(event) => {
                event.currentTarget.src = DEFAULT_IMAGES[0];
              }}
            />

            <button
              type="button"
              className="hotel-gallery-arrow previous"
              aria-label="Previous photo"
              onClick={() => goToImage(-1)}
            >
              <ChevronLeft size={23} />
            </button>

            <button
              type="button"
              className="hotel-gallery-arrow next"
              aria-label="Next photo"
              onClick={() => goToImage(1)}
            >
              <ChevronRight size={23} />
            </button>

            <span className="hotel-gallery-count">
              {selectedImage + 1} / {images.length} Photos
            </span>
          </div>

          <div className="hotel-gallery-side">
            {images.slice(0, 4).map((image, index) => (
              <button
                type="button"
                key={`${image}-${index}`}
                className={`hotel-gallery-thumbnail ${
                  selectedImage === index ? "selected" : ""
                }`}
                onClick={() => setSelectedImage(index)}
                aria-label={`Show photo ${index + 1}`}
              >
                <img
                  src={image}
                  alt={`${hotelName} thumbnail ${index + 1}`}
                  onError={(event) => {
                    event.currentTarget.src = DEFAULT_IMAGES[index];
                  }}
                />
                {index === 3 && images.length > 4 && (
                  <span>+{images.length - 4} photos</span>
                )}
              </button>
            ))}
          </div>
        </section>

        {/* Stay information */}
        <section className="hotel-details-stay-strip">
          <div>
            <CalendarDays size={20} />
            <span>
              <small>CHECK-IN</small>
              <strong>{checkIn || "Select date"}</strong>
            </span>
          </div>

          <div className="hotel-stay-strip-divider" />

          <div>
            <CalendarDays size={20} />
            <span>
              <small>CHECK-OUT</small>
              <strong>{checkOut || "Select date"}</strong>
            </span>
          </div>

          <div className="hotel-stay-strip-divider" />

          <div>
            <Users size={20} />
            <span>
              <small>GUESTS & ROOMS</small>
              <strong>{guests}</strong>
            </span>
          </div>
        </section>

        {/* Main details and booking summary */}
        <div className="hotel-details-layout">
          <div className="hotel-details-main-column">
            <section className="hotel-details-panel">
              <div className="hotel-section-heading">
                <div>
                  <h2>About this property</h2>
                  <p>Everything you need for a comfortable stay</p>
                </div>
              </div>

              <p className="hotel-about-description">{description}</p>

              <div className="hotel-details-amenities">
                {features.map((feature) => (
                  <div className="hotel-amenity-item" key={feature}>
                    {getFeatureIcon(feature)}
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="hotel-details-panel">
              <div className="hotel-section-heading">
                <div>
                  <h2>Choose your room</h2>
                  <p>Select a room before continuing to booking</p>
                </div>
                <span className="hotel-room-count-label">
                  {rooms.length} room types
                </span>
              </div>

              <div className="hotel-room-list">
                {rooms.map((room) => {
                  const amount = Math.round(price * room.multiplier);
                  const selected = roomType === room.name;

                  return (
                    <button
                      type="button"
                      key={room.name}
                      className={`hotel-room-card ${
                        selected ? "selected" : ""
                      }`}
                      onClick={() => setRoomType(room.name)}
                    >
                      <span className="hotel-room-select-circle">
                        {selected && <span />}
                      </span>

                      <span className="hotel-room-bed-icon">
                        <BedDouble size={25} />
                      </span>

                      <span className="hotel-room-information">
                        <strong>{room.name}</strong>
                        <small>{room.description}</small>
                        <span className="hotel-room-size">{room.size}</span>

                        <span className="hotel-room-benefits">
                          {room.benefits.map((benefit) => (
                            <em key={benefit}>
                              <CheckCircle2 size={13} />
                              {benefit}
                            </em>
                          ))}
                        </span>
                      </span>

                      <span className="hotel-room-amount">
                        <strong>₹{formatPrice(amount)}</strong>
                        <small>per night</small>
                        <small>before taxes</small>
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="hotel-details-panel">
              <h2>Property information</h2>

              <div className="hotel-property-information">
                <div>
                  <ShieldCheck size={19} />
                  <span>
                    <strong>Guest safety</strong>
                    <small>Check property policies before booking.</small>
                  </span>
                </div>

                <div>
                  <Users size={19} />
                  <span>
                    <strong>Guest details</strong>
                    <small>Enter the primary guest information on the next page.</small>
                  </span>
                </div>

                <div>
                  <CalendarDays size={19} />
                  <span>
                    <strong>Stay dates</strong>
                    <small>Review check-in and check-out dates before payment.</small>
                  </span>
                </div>
              </div>
            </section>
          </div>

          {/* Booking price summary */}
          <aside className="hotel-details-booking-card">
            <div className="hotel-booking-card-top">
              <span>YOUR BOOKING</span>
              <ShieldCheck size={19} />
            </div>

            <h3>{hotelName}</h3>

            <p className="hotel-booking-card-location">
              <MapPin size={15} />
              {location}
            </p>

            <div className="hotel-booking-selected-room">
              <BedDouble size={18} />
              <span>{roomType}</span>
            </div>

            <div className="hotel-booking-date-grid">
              <div>
                <small>CHECK-IN</small>
                <strong>{checkIn || "Not selected"}</strong>
              </div>
              <div>
                <small>CHECK-OUT</small>
                <strong>{checkOut || "Not selected"}</strong>
              </div>
            </div>

            <div className="hotel-booking-guests">
              <Users size={16} />
              {guests}
            </div>

            <div className="hotel-booking-price-lines">
              <div>
                <span>Room price / night</span>
                <strong>₹{formatPrice(roomPrice)}</strong>
              </div>
              <div>
                <span>Duration</span>
                <strong>
                  {nights} night{nights !== 1 ? "s" : ""}
                </strong>
              </div>
              <div>
                <span>Room subtotal</span>
                <strong>₹{formatPrice(estimatedTotal)}</strong>
              </div>
            </div>

            <div className="hotel-booking-total">
              <span>Estimated room total</span>
              <strong>₹{formatPrice(estimatedTotal)}</strong>
              <small>Taxes and fees may apply.</small>
            </div>

            <button
              type="button"
              className="hotel-booking-continue"
              onClick={handleBooking}
            >
              Continue to booking
              <ChevronRight size={19} />
            </button>

            <p className="hotel-booking-secure-note">
              <ShieldCheck size={15} />
              Your selected room will be carried forward.
            </p>

            {oldPrice > price && (
              <div className="hotel-booking-savings">
                <CheckCircle2 size={16} />
                Listed price is ₹{formatPrice(oldPrice - price)} below the
                reference price per night.
              </div>
            )}
          </aside>
        </div>

        <p className="hotel-details-demo-note">
          Demo hotel listing: prices, ratings, reviews and room options are
          illustrative and are not live availability or confirmed offers.
        </p>
      </div>
    </main>
  );
}

export default HotelDetails;