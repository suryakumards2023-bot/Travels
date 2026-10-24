
import "./Payment.css";

import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  CalendarDays,
  CarFront,
  Bus,
  Hotel,
  Shield,
  ShieldCheck,
  MapPin,
  Users,
  User,
  Mail,
  Phone,
  TicketPercent,
  QrCode,
  LoaderCircle,
  Smartphone,
  ImagePlus,
} from "lucide-react";

import tours from "../data/tours";
import QRCode from "qrcode";


const API_BASE = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "").replace(/\/api$/, "");

const UPI_ID = "8051936436-2@axl";
const MAX_SCREENSHOT_SIZE = 5 * 1024 * 1024;

const Payment = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const params = new URLSearchParams(location.search);
  const type = (params.get("type") || "tour").toLowerCase();

  const isCabBooking = type === "cab";
  const isBusBooking = type === "bus";
  const isHotelBooking = type === "hotel";
  const isInsuranceBooking = type === "insurance";
  const isTourBooking = ![
    "cab",
    "bus",
    "hotel",
    "insurance",
  ].includes(type);

  const item = {
    id:
      params.get("cabId") ||
      params.get("busId") ||
      params.get("hotelId") ||
      params.get("insuranceId") ||
      id ||
      "",
    name:
      params.get("name") ||
      params.get("hotelName") ||
      params.get("planName") ||
      "",
    price: Number(params.get("price") || 0),
    from: params.get("from") || "",
    to: params.get("to") || "",
    date:
      params.get("date") ||
      params.get("travelDate") ||
      params.get("checkIn") ||
      "",
    time: params.get("time") || "",
    departure: params.get("departure") || "",
    vehicle: params.get("vehicle") || "Cab",
    subtitle: params.get("subtitle") || "",
    seatType: params.get("seatType") || "Seater",
    ac: params.get("ac") === "true",
    seats: Number(params.get("seats") || 1),
    travellers: Number(
      params.get("travellers") ||
        params.get("guests") ||
        params.get("members") ||
        params.get("seats") ||
        1
    ),
    checkIn: params.get("checkIn") || "",
    checkOut: params.get("checkOut") || "",
    rooms: Number(params.get("rooms") || 1),
    guests: Number(params.get("guests") || 1),
    plan: params.get("plan") || params.get("planName") || "",
    coverage: params.get("coverage") || "",
  };

  const tour = isTourBooking
    ? location.state?.tour ||
      tours.find((entry) => String(entry.id) === String(id))
    : null;

  const booking = {
    fullName:
      params.get("fullName") ||
      location.state?.booking?.fullName ||
      "",
    email:
      params.get("email") ||
      location.state?.booking?.email ||
      "",
    mobile:
      params.get("mobile") ||
      location.state?.booking?.mobile ||
      "",
    travelDate:
      item.date ||
      location.state?.booking?.travelDate ||
      "",
    adults: Number(
      params.get("travellers") ||
        params.get("seats") ||
        params.get("guests") ||
        location.state?.booking?.adults ||
        1
    ),
    children: Number(location.state?.booking?.children || 0),
    infants: Number(location.state?.booking?.infants || 0),
  };

  const initialTotal = Number(
    isTourBooking
      ? location.state?.totalPrice ?? tour?.price ?? 0
      : item.price
  );

  const bookingTitle = isCabBooking
    ? item.name || "Selected Cab"
    : isBusBooking
    ? item.name || "Selected Bus"
    : isHotelBooking
    ? item.name || "Selected Hotel"
    : isInsuranceBooking
    ? item.name || "Travel Insurance"
    : tour?.name || "Tour Package";

  const bookingSubtitle = isCabBooking
    ? item.vehicle
    : isBusBooking
    ? `${item.ac ? "AC" : "Non-AC"} ${item.seatType}`
    : isHotelBooking
    ? item.subtitle || "Hotel Reservation"
    : isInsuranceBooking
    ? item.plan || item.subtitle || "Insurance Plan"
    : tour?.destination || "";

  const [coupon, setCoupon] = useState("");
  const [upiQrDataUrl, setUpiQrDataUrl] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [paymentError, setPaymentError] = useState("");
  const [paymentScreenshot, setPaymentScreenshot] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [paymentRequest, setPaymentRequest] = useState(null);

  const discount = couponApplied ? Math.round(initialTotal * 0.1) : 0;
  const finalAmount = Math.max(0, initialTotal - discount);
  useEffect(() => {
  if (!Number.isFinite(finalAmount) || finalAmount <= 0) {
    setUpiQrDataUrl("");
    return;
  }

  const upiParams = new URLSearchParams({
    pa: UPI_ID,
    pn: "MK Travels",
    am: finalAmount.toFixed(2),
    cu: "INR",
    tn: `MK Travels - ${bookingTitle}`.slice(0, 80),
  });

  const upiUrl = `upi://pay?${upiParams.toString()}`;

  QRCode.toDataURL(upiUrl, {
    width: 260,
    margin: 2,
    errorCorrectionLevel: "M",
  })
    .then((dataUrl) => setUpiQrDataUrl(dataUrl))
    .catch((error) => {
      console.error("UPI QR generation failed:", error);
      setUpiQrDataUrl("");
    });
}, [finalAmount, bookingTitle]);

  useEffect(() => {
    return () => {
      if (screenshotPreview) {
        URL.revokeObjectURL(screenshotPreview);
      }
    };
  }, [screenshotPreview]);

  
const openUPIPayment = () => {
  setPaymentError("");

  if (!Number.isFinite(finalAmount) || finalAmount <= 0) {
    setPaymentError("Booking amount valid nahi hai.");
    return;
  }

  const upiParams = new URLSearchParams({
    pa: UPI_ID,
    pn: "MK Travels",
    am: finalAmount.toFixed(2),
    cu: "INR",
    tn: `MK Travels - ${bookingTitle}`.slice(0, 80),
  });

  const upiUrl = `upi://pay?${upiParams.toString()}`;

  // Laptop par QR code se payment karne ka option available hai.
  if (!/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
    setPaymentError(
      "Laptop par UPI app direct open nahi ho sakta. Neeche diye gaye QR code ko mobile UPI app se scan karein."
    );
    document.querySelector(".phonepe-qr-wrapper")?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
    return;
  }

  // Mobile par UPI app open karne ki koshish.
  window.location.href = upiUrl;
};


  const handleScreenshotChange = (event) => {
    const file = event.target.files?.[0];

    setPaymentError("");

    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setPaymentError("Sirf JPG, PNG ya WebP image upload karein.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_SCREENSHOT_SIZE) {
      setPaymentError("Screenshot ka size maximum 5 MB ho sakta hai.");
      event.target.value = "";
      return;
    }

    setPaymentScreenshot(file);
    setScreenshotPreview(URL.createObjectURL(file));
  };

  const removeScreenshot = () => {
    setPaymentScreenshot(null);
    setScreenshotPreview("");
    setPaymentError("");

    const input = document.getElementById("payment-screenshot");
    if (input) input.value = "";
  };

  const applyCoupon = () => {
    setCouponError("");

    if (!coupon.trim()) {
      setCouponError("Coupon code enter karein.");
      return;
    }

    if (coupon.trim().toUpperCase() === "TRAVEL10") {
      setCouponApplied(true);
    } else {
      setCouponApplied(false);
      setCouponError("Invalid coupon code.");
    }
  };

  const formatDate = (value) => {
    if (!value) return "Not selected";

    const date = new Date(`${value}T00:00:00`);

    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const travellerCount =
    Number(booking.adults || 0) +
    Number(booking.children || 0) +
    Number(booking.infants || 0);

  const dateLabel = isHotelBooking ? "Check-in Date" : "Travel Date";

  const explorePath = isCabBooking
    ? "/cabs"
    : isBusBooking
    ? "/bus-result"
    : isHotelBooking
    ? "/hotel-results"
    : isInsuranceBooking
    ? "/insurance-results"
    : "/tours";

  const exploreLabel = isCabBooking
    ? "Explore More Cabs"
    : isBusBooking
    ? "Search More Buses"
    : isHotelBooking
    ? "Explore More Hotels"
    : isInsuranceBooking
    ? "Explore Insurance"
    : "Explore More Tours";

  const handleExploreMore = () => {
    if (isBusBooking) {
      const search = new URLSearchParams({
        type: "bus",
        from: item.from,
        to: item.to,
        date: item.date,
      });

      navigate(`/bus-result?${search.toString()}`);
      return;
    }

    navigate(explorePath);
  };

  const isBookingMissing = isTourBooking
    ? !tour || !Number.isFinite(initialTotal) || initialTotal <= 0
    : !item.id || !Number.isFinite(initialTotal) || initialTotal <= 0;

  const handlePaymentRequest = async (event) => {
    event.preventDefault();
    setPaymentError("");

    if (!Number.isFinite(finalAmount) || finalAmount <= 0) {
      setPaymentError("Booking amount valid nahi hai. Dobara booking select karein.");
      return;
    }

    if (!paymentScreenshot) {
      setPaymentError("Payment screenshot upload karein.");
      return;
    }

    if (!booking.fullName || !booking.mobile || !booking.email) {
      setPaymentError(
        "Customer name, mobile aur email missing hain. Booking form par wapas jaakar details complete karein."
      );
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();

      formData.append("paymentScreenshot", paymentScreenshot);

      formData.append(
        "bookingData",
        JSON.stringify({
          type: isTourBooking ? "tour" : type,
          itemId: item.id,
          title: bookingTitle,
          destination: isTourBooking
            ? tour?.destination || ""
            : item.to || item.name || "",
          travelDate: item.date || booking.travelDate || null,
          endDate: isHotelBooking ? item.checkOut || null : null,
          travellers: isHotelBooking
            ? item.guests
            : isBusBooking
            ? item.seats
            : travellerCount || item.travellers || 1,
          amount: finalAmount,
          currency: "INR",
          details: {
            from: item.from,
            to: item.to,
            time: item.time,
            departure: item.departure,
            vehicle: item.vehicle,
            seatType: item.seatType,
            seats: item.seats,
            checkIn: item.checkIn,
            checkOut: item.checkOut,
            rooms: item.rooms,
            guests: item.guests,
            plan: item.plan,
            coverage: item.coverage,
            customerName: booking.fullName,
            customerEmail: booking.email,
            customerMobile: booking.mobile,
            coupon: couponApplied ? "TRAVEL10" : "",
          },
        })
      );

      const response = await fetch(
        `${API_BASE}/api/bookings/payment-request`,
        {
          method: "POST",
          credentials: "include",
          body: formData,
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Payment screenshot submit nahi hua. Backend route check karein."
        );
      }

      setPaymentRequest(data.booking || data);
    } catch (error) {
      setPaymentError(
        error.message ||
          "Server se connect nahi ho paya. Backend server check karein."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (isBookingMissing) {
    return (
      <div className="payment-not-found">
        <h2>Booking Details Not Found</h2>
        <p>
          Booking details ya price missing hai. Results page par wapas
          jaakar booking dobara select karein.
        </p>
        <Link to={explorePath} className="payment-back-button">
          <ArrowLeft size={17} />
          Back to {exploreLabel}
        </Link>
      </div>
    );
  }

  if (paymentRequest) {
    return (
      <div className="payment-success-page">
        <div className="success-card">
          <div className="success-icon pending">
            <Clock size={38} />
          </div>

          <span className="success-label">PAYMENT VERIFICATION PENDING</span>
          <h1>Request Submitted!</h1>

          <p className="success-message">
            Aapka payment screenshot receive ho gaya hai. Booking abhi
            confirm nahi hui hai. Owner payment verify karne ke baad hi
            booking status update karega.
          </p>

          <div className="booking-confirmation">
            <div className="confirmation-row">
              <span>Booking Reference</span>
              <strong>
                {paymentRequest.bookingReference ||
                  paymentRequest._id ||
                  "Pending"}
              </strong>
            </div>

            <div className="confirmation-row">
              <span>Booking</span>
              <strong>{bookingTitle}</strong>
            </div>

            <div className="confirmation-row">
              <span>Payment Proof</span>
              <strong>Screenshot Submitted</strong>
            </div>

            <div className="confirmation-row">
              <span>Payment Status</span>
              <strong>Pending Verification</strong>
            </div>

            <div className="confirmation-row total">
              <span>Amount Submitted</span>
              <strong>₹{finalAmount.toLocaleString("en-IN")}</strong>
            </div>
          </div>

          <div className="success-actions">
            <Link to="/" className="success-home-button">
              Go to Home
            </Link>

            <button
              type="button"
              className="success-tours-button"
              onClick={handleExploreMore}
            >
              {exploreLabel}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-page">
      <div className="payment-container">
        <button
          type="button"
          onClick={() => {
            if (isTourBooking && tour?.id) {
              navigate(`/booking/${tour.id}`);
            } else {
              navigate(-1);
            }
          }}
          className="payment-back-link"
        >
          <ArrowLeft size={17} />
          Back to Booking
        </button>

        <div className="payment-header">
          <div>
            <span className="payment-label">UPI QR CHECKOUT</span>
            <h1>Complete Your Payment</h1>
            <p>UPI app se pay karein ya QR code scan karein.</p>
          </div>

          <div className="payment-secure">
            <ShieldCheck size={16} />
            Manual Verification
          </div>
        </div>

        <div className="payment-layout">
          <div className="payment-main">
            <section className="payment-card qr-payment-card">
              <div className="payment-card-heading">
                <div className="payment-heading-icon">
                  <QrCode size={22} />
                </div>

                <div>
                  <h2>Scan & Pay with UPI</h2>
                  <p>PhonePe, Google Pay, Paytm ya supported UPI app.</p>
                </div>
              </div>

              <div className="qr-payment-amount">
                <span>Pay exactly</span>
                <strong>₹{finalAmount.toLocaleString("en-IN")}</strong>
              </div>

              <button
                type="button"
                className="pay-now-button upi-app-button"
                onClick={openUPIPayment}
              >
                <Smartphone size={18} />
                Pay ₹{finalAmount.toLocaleString("en-IN")} via UPI App
              </button>

              <p className="upi-app-note">
                Mobile par tap karne se supported UPI app khul sakta hai.
                Payment karne se pehle receiver aur amount check karein.
              </p>

              <div className="phonepe-qr-wrapper">
  {upiQrDataUrl ? (
    <img
      className="phonepe-qr-image"
      src={upiQrDataUrl}
      alt={`MK Travels UPI QR code for ₹${finalAmount.toFixed(2)}`}
    />
  ) : (
    <p>QR code generate ho raha hai...</p>
  )}

  <p>
    Mobile se QR scan karein. UPI app mein receiver aur amount
    verify karke payment complete karein.
  </p>
</div>

              <ol className="qr-payment-instructions">
                <li>UPI app open karein ya upar wala button tap karein.</li>
                <li>QR scan karein, phir receiver aur amount verify karein.</li>
                <li>₹{finalAmount.toLocaleString("en-IN")} payment complete karein.</li>
                <li>Payment ke baad screenshot save karein aur neeche upload karein.</li>
              </ol>

              <div className="payment-warning">
                <ShieldCheck size={18} />
                <span>
                  UPI PIN sirf apne UPI app mein enter karein, website par
                  kabhi nahi. Payment karne se pehle receiver details verify karein.
                </span>
              </div>
            </section>

            <section className="payment-card coupon-card">
              <div className="coupon-heading">
                <div className="coupon-icon">
                  <TicketPercent size={19} />
                </div>

                <div>
                  <h2>Have a Coupon?</h2>
                  <p>Apply TRAVEL10 to get 10% off.</p>
                </div>
              </div>

              <div className="coupon-form">
                <input
                  type="text"
                  value={coupon}
                  onChange={(event) => {
                    setCoupon(event.target.value);
                    setCouponApplied(false);
                    setCouponError("");
                  }}
                  placeholder="Enter coupon code"
                  disabled={couponApplied}
                />

                <button
                  type="button"
                  onClick={applyCoupon}
                  disabled={couponApplied}
                >
                  {couponApplied ? "Applied" : "Apply"}
                </button>
              </div>

              {couponError && (
                <span className="coupon-error">{couponError}</span>
              )}

              {couponApplied && (
                <div className="coupon-success">
                  <CheckCircle2 size={15} />
                  TRAVEL10 applied. Saved ₹{discount.toLocaleString("en-IN")}.
                  Pay the updated amount shown above.
                </div>
              )}
            </section>

            <section className="payment-card utr-card">
              <div className="payment-card-heading">
                <div className="payment-heading-icon">
                  <ImagePlus size={21} />
                </div>

                <div>
                  <h2>Upload Payment Screenshot</h2>
                  <p>Payment complete hone ke baad screenshot upload karein.</p>
                </div>
              </div>

              <form onSubmit={handlePaymentRequest}>
                <label
                  htmlFor="payment-screenshot"
                  className="payment-upload-box"
                >
                  <ImagePlus size={30} />

                  <strong>
                    {paymentScreenshot
                      ? paymentScreenshot.name
                      : "Choose Payment Screenshot"}
                  </strong>

                  <span>JPG, PNG or WebP · Maximum 5 MB</span>

                  <input
                    id="payment-screenshot"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleScreenshotChange}
                    hidden
                  />
                </label>

                {screenshotPreview && (
                  <div className="payment-screenshot-preview">
                    <img
                      src={screenshotPreview}
                      alt="Selected payment screenshot preview"
                    />

                    <button type="button" onClick={removeScreenshot}>
                      Remove Screenshot
                    </button>
                  </div>
                )}

                {paymentError && (
                  <div className="payment-error">{paymentError}</div>
                )}

                <button
                  type="submit"
                  className="pay-now-button"
                  disabled={submitting || !paymentScreenshot}
                >
                  {submitting ? (
                    <>
                      <LoaderCircle size={17} />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={17} />
                      Submit Payment Screenshot
                    </>
                  )}
                </button>
              </form>

              <div className="payment-protection">
                <Clock size={17} />
                <span>
                  Screenshot submit karne par booking Pending Verification
                  rahegi. Owner ke verify karne se pehle booking confirmed nahi hogi.
                </span>
              </div>
            </section>
          </div>

          <aside className="payment-summary">
            <div className="payment-tour">
              {isTourBooking && tour?.image ? (
                <img src={tour.image} alt={tour.name} />
              ) : (
                <div className="payment-tour-image-placeholder">
                  {isCabBooking && <CarFront size={34} />}
                  {isBusBooking && <Bus size={34} />}
                  {isHotelBooking && <Hotel size={34} />}
                  {isInsuranceBooking && <Shield size={34} />}
                </div>
              )}

              <div>
                <h3>{bookingTitle}</h3>
                <span>{bookingSubtitle}</span>
              </div>
            </div>

            <div className="summary-details">
              <h3>Booking Details</h3>

              <div className="summary-detail-row">
                <CalendarDays size={15} />
                <span>{dateLabel}</span>
                <strong>{formatDate(booking.travelDate)}</strong>
              </div>

              {(isBusBooking || isCabBooking) && (
                <>
                  <div className="summary-detail-row">
                    <MapPin size={15} />
                    <span>From / Pickup</span>
                    <strong>{item.from || "Not specified"}</strong>
                  </div>

                  <div className="summary-detail-row">
                    <MapPin size={15} />
                    <span>To / Drop</span>
                    <strong>{item.to || "Not specified"}</strong>
                  </div>
                </>
              )}

              {isCabBooking && (
                <div className="summary-detail-row">
                  <Clock size={15} />
                  <span>Pickup Time</span>
                  <strong>{item.time || "Not specified"}</strong>
                </div>
              )}

              {isBusBooking && (
                <div className="summary-detail-row">
                  <Users size={15} />
                  <span>Seats</span>
                  <strong>{item.seats}</strong>
                </div>
              )}

              {isCabBooking && (
                <div className="summary-detail-row">
                  <Users size={15} />
                  <span>Travellers</span>
                  <strong>{item.travellers}</strong>
                </div>
              )}

              {isHotelBooking && (
                <>
                  <div className="summary-detail-row">
                    <CalendarDays size={15} />
                    <span>Check-out</span>
                    <strong>{formatDate(item.checkOut)}</strong>
                  </div>

                  <div className="summary-detail-row">
                    <Hotel size={15} />
                    <span>Rooms</span>
                    <strong>{item.rooms}</strong>
                  </div>

                  <div className="summary-detail-row">
                    <Users size={15} />
                    <span>Guests</span>
                    <strong>{item.guests}</strong>
                  </div>
                </>
              )}

              {isInsuranceBooking && (
                <>
                  <div className="summary-detail-row">
                    <Shield size={15} />
                    <span>Plan</span>
                    <strong>{item.plan || "Standard Plan"}</strong>
                  </div>

                  {item.coverage && (
                    <div className="summary-detail-row">
                      <ShieldCheck size={15} />
                      <span>Coverage</span>
                      <strong>{item.coverage}</strong>
                    </div>
                  )}
                </>
              )}

              {isTourBooking && (
                <>
                  <div className="summary-detail-row">
                    <Users size={15} />
                    <span>Travellers</span>
                    <strong>{travellerCount || 1}</strong>
                  </div>

                  <div className="summary-detail-row">
                    <Clock size={15} />
                    <span>Duration</span>
                    <strong>{tour.duration || "Not specified"}</strong>
                  </div>
                </>
              )}
            </div>

            <div className="payment-price">
              <h3>Price Summary</h3>

              <div className="payment-price-row">
                <span>Booking Amount</span>
                <strong>₹{initialTotal.toLocaleString("en-IN")}</strong>
              </div>

              {couponApplied && (
                <div className="payment-price-row discount">
                  <span>Coupon Discount</span>
                  <strong>- ₹{discount.toLocaleString("en-IN")}</strong>
                </div>
              )}

              <div className="payment-divider" />

              <div className="payment-total">
                <span>Total Payable</span>
                <strong>₹{finalAmount.toLocaleString("en-IN")}</strong>
              </div>

              <small>UPI app mein bhi yahi amount verify karein.</small>
            </div>

            <div className="customer-summary">
              <h3>Customer Details</h3>

              <div>
                <User size={14} />
                <span>{booking.fullName || "Name not provided"}</span>
              </div>

              <div>
                <Mail size={14} />
                <span>{booking.email || "Email not provided"}</span>
              </div>

              <div>
                <Phone size={14} />
                <span>{booking.mobile || "Mobile not provided"}</span>
              </div>
            </div>

            <div className="payment-summary-security">
              <ShieldCheck size={19} />
              <div>
                <strong>Payment Verification</strong>
                <span>
                  Booking is confirmed only after payment verification.
                </span>
              </div>
            </div>

            <button
              type="button"
              className="success-tours-button"
              onClick={handleExploreMore}
            >
              {exploreLabel}
            </button>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Payment;
