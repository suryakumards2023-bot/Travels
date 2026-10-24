
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  Download,
  FileText,
  MapPin,
  RefreshCw,
  ShieldCheck,
  Ticket,
  Trash2,
  User,
  Users,
  X,
} from "lucide-react";

import { apiRequest } from "../api/api";
import "./BookingDetails.css";

function formatDate(value) {
  if (!value) return "Not available";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatCurrency(value) {
  return Number(value ?? 0).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  });
}

function getStatusLabel(value) {
  const status = String(value || "pending").toLowerCase();

  const labels = {
    pending: "Pending",
    pending_verification: "Payment Verification Pending",
    confirmed: "Confirmed",
    completed: "Completed",
    cancelled: "Cancelled",
    paid: "Paid",
    failed: "Payment Failed",
    refund_pending: "Refund Pending",
    refunded: "Refunded",
    verified: "Verified",
    rejected: "Rejected",
  };

  return labels[status] || status.replaceAll("_", " ");
}

function getBookingType(booking) {
  const type = String(booking?.type || "travel").toLowerCase();

  const labels = {
    bus: "Bus",
    cab: "Cab",
    hotel: "Hotel",
    insurance: "Travel Insurance",
    tour: "Holiday Package",
  };

  return labels[type] || type;
}

function BookingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCancel, setShowCancel] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState("");

  const loadBooking = useCallback(async () => {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      if (!id || id === "undefined" || id === "null") {
        throw new Error("Invalid booking ID.");
      }

      const response = await apiRequest(
        `/bookings/${encodeURIComponent(id)}`
      );

      const result = response?.booking || response;

      if (!result?._id && !result?.id) {
        throw new Error("Booking details could not be found.");
      }

      setBooking(result);
    } catch (err) {
      if (err?.status === 401) {
        navigate("/login", {
          replace: true,
          state: { from: `/booking-details/${id}` },
        });
        return;
      }

      setError(
        err?.message || "Unable to load booking details."
      );
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    loadBooking();
  }, [loadBooking]);

  const handleCancelBooking = async () => {
    if (!booking) return;

    setProcessing(true);
    setError("");
    setMessage("");

    try {
      const response = await apiRequest(
        `/bookings/${encodeURIComponent(id)}/cancel`,
        { method: "PATCH" }
      );

      const updatedBooking = response?.booking || response;

      if (updatedBooking?._id || updatedBooking?.id) {
        setBooking(updatedBooking);
      } else {
        await loadBooking();
      }

      setShowCancel(false);
      setMessage("Cancellation processed successfully.");
    } catch (err) {
      setError(
        err?.message || "Unable to cancel this booking."
      );
      setShowCancel(false);
    } finally {
      setProcessing(false);
    }
  };

  const handleDownloadTicket = () => {
    if (!booking) return;

    const details = booking.details || {};
    const customer = details.customer || {};

    const ticketText = [
      "MK TRAVELS",
      "==============================",
      "BOOKING DETAILS",
      `Booking Reference: ${booking.bookingReference || booking._id}`,
      `Type: ${getBookingType(booking)}`,
      `Title: ${booking.title || "Travel Booking"}`,
      `Destination: ${booking.destination || "Not available"}`,
      `From: ${details.from || details.source || "Not available"}`,
      `To: ${details.to || details.destination || "Not available"}`,
      `Travel Date: ${formatDate(booking.travelDate)}`,
      `End Date: ${formatDate(booking.endDate)}`,
      `Travellers: ${booking.travellers ?? details.travellers ?? 1}`,
      `Amount: ${formatCurrency(booking.amount)}`,
      `Booking Status: ${getStatusLabel(booking.status)}`,
      `Payment Status: ${getStatusLabel(booking.paymentStatus)}`,
      `Customer: ${customer.name || details.customerName || "Not available"}`,
      `Email: ${customer.email || details.email || details.customerEmail || "Not available"}`,
      `Phone: ${customer.phone || details.mobile || details.phone || "Not available"}`,
      "==============================",
      "Keep this document for your reference.",
    ].join("\n");

    const blob = new Blob([ticketText], {
      type: "text/plain;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `${booking.bookingReference || booking._id}-booking.txt`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="booking-details-page">
        <div className="booking-not-found">
          <RefreshCw size={28} />
          <h2>Loading booking...</h2>
        </div>
      </div>
    );
  }

  if (error && !booking) {
    return (
      <div className="booking-details-page">
        <div className="booking-not-found">
          <Ticket size={35} />
          <h2>Unable to Load Booking</h2>
          <p>{error}</p>
          <button type="button" onClick={loadBooking}>
            Try Again
          </button>
          <p>
            <Link to="/my-bookings">Back to My Bookings</Link>
          </p>
        </div>
      </div>
    );
  }

  if (!booking) return null;

  const details = booking.details || {};
  const customer = details.customer || {};

  const reference = booking.bookingReference || booking._id;
  const title = booking.title || "Travel Booking";
  const type = getBookingType(booking);
  const bookingStatus = String(booking.status || "pending").toLowerCase();
  const paymentStatus = String(booking.paymentStatus || "pending").toLowerCase();

  const isCancelled = bookingStatus === "cancelled";
  const isCompleted = bookingStatus === "completed";
  const isPaid = paymentStatus === "paid";

  const travellerCount =
    booking.travellers ?? details.travellers ?? details.guests ?? 1;

  const amount = booking.amount ?? 0;

  const routeFrom = details.from || details.source || details.origin;
  const routeTo = details.to || details.destination;

  const customerName =
    customer.name || details.customerName || details.name || "Not available";

  const customerEmail =
    customer.email || details.email || details.customerEmail || "Not available";

  const customerPhone =
    customer.phone || details.mobile || details.phone || "Not available";

  return (
    <div className="booking-details-page">
      <div className="booking-details-container">
        <Link to="/my-bookings" className="booking-details-back">
          <ArrowLeft size={17} />
          Back to My Bookings
        </Link>

        <div className="booking-details-header">
          <div>
            <span className="booking-details-label">
              BOOKING DETAILS
            </span>
            <h1>{title}</h1>
            <div className="booking-header-location">
              <MapPin size={15} />
              {booking.destination || routeTo || "Destination not available"}
            </div>
          </div>

          <div className="booking-header-actions">
            <button
              type="button"
              className="download-ticket-button"
              onClick={handleDownloadTicket}
            >
              <Download size={17} />
              Download Details
            </button>

            <span
              className={`details-status ${
                isCancelled
                  ? "details-status-cancelled"
                  : isCompleted
                    ? "details-status-completed"
                    : "details-status-upcoming"
              }`}
            >
              {getStatusLabel(booking.status)}
            </span>
          </div>
        </div>

        {error && (
          <div className="my-bookings-error" role="alert">
            <p>{error}</p>
            <button type="button" onClick={loadBooking}>
              Refresh Details
            </button>
          </div>
        )}

        {message && (
          <div role="status" className="booking-success-message">
            {message}
          </div>
        )}

        <div className="booking-details-layout">
          <main className="booking-details-main">
            <section className="details-card">
              <div className="details-section-title">
                <div className="details-title-icon">
                  <Ticket size={19} />
                </div>
                <div>
                  <h2>Booking Summary</h2>
                  <p>Your saved reservation information</p>
                </div>
              </div>

              <div className="summary-tour-content">
                <span className="summary-booking-id">
                  Booking Reference: {reference}
                </span>
                <h2>{title}</h2>
                <p>{type}</p>

                <div className="summary-info-grid">
                  <div>
                    <CalendarDays size={17} />
                    <span>Travel Date</span>
                    <strong>{formatDate(booking.travelDate)}</strong>
                  </div>
                  <div>
                    <Clock3 size={17} />
                    <span>End Date</span>
                    <strong>{formatDate(booking.endDate)}</strong>
                  </div>
                  <div>
                    <Users size={17} />
                    <span>Travellers / Guests</span>
                    <strong>{travellerCount}</strong>
                  </div>
                </div>

                {(routeFrom || routeTo) && (
                  <div className="summary-location">
                    <MapPin size={15} />
                    {routeFrom || "Origin"} → {routeTo || "Destination"}
                  </div>
                )}
              </div>
            </section>

            <section className="details-card">
              <div className="details-section-title">
                <div className="details-title-icon">
                  <User size={19} />
                </div>
                <div>
                  <h2>Traveller Details</h2>
                  <p>Customer information saved with the booking</p>
                </div>
              </div>

              <div className="traveller-grid">
                <div className="traveller-item">
                  <span>Name</span>
                  <strong>{customerName}</strong>
                </div>
                <div className="traveller-item">
                  <span>Email</span>
                  <strong>{customerEmail}</strong>
                </div>
                <div className="traveller-item">
                  <span>Phone</span>
                  <strong>{customerPhone}</strong>
                </div>
                <div className="traveller-item">
                  <span>Number of Travellers</span>
                  <strong>{travellerCount}</strong>
                </div>
              </div>
            </section>

            <section className="details-card">
              <div className="details-section-title">
                <div className="details-title-icon">
                  <FileText size={19} />
                </div>
                <div>
                  <h2>Additional Details</h2>
                  <p>Service information saved with your booking</p>
                </div>
              </div>

              {Object.keys(details).filter(
                (key) =>
                  !["customer", "customerName", "customerEmail", "mobile", "email", "phone"].includes(key) &&
                  ["string", "number", "boolean"].includes(typeof details[key])
              ).length > 0 ? (
                <div className="traveller-grid">
                  {Object.entries(details)
                    .filter(
                      ([key, value]) =>
                        !["customer", "customerName", "customerEmail", "mobile", "email", "phone"].includes(key) &&
                        ["string", "number", "boolean"].includes(typeof value) &&
                        value !== ""
                    )
                    .map(([key, value]) => (
                      <div className="traveller-item" key={key}>
                        <span>
                          {key
                            .replace(/([A-Z])/g, " $1")
                            .replace(/^./, (letter) => letter.toUpperCase())}
                        </span>
                        <strong>{String(value)}</strong>
                      </div>
                    ))}
                </div>
              ) : (
                <p>No additional details were saved for this booking.</p>
              )}
            </section>
          </main>

          <aside className="booking-details-sidebar">
            <section className="details-card payment-details-card">
              <div className="details-section-title">
                <div className="details-title-icon">
                  <CreditCard size={19} />
                </div>
                <div>
                  <h2>Payment Details</h2>
                  <p>Payment and verification status</p>
                </div>
              </div>

              <div className="payment-detail-row">
                <span>Booking Amount</span>
                <strong>{formatCurrency(amount)}</strong>
              </div>

              <div className="payment-detail-divider" />

              <div className="payment-detail-total">
                <span>Total Amount</span>
                <strong>{formatCurrency(amount)}</strong>
              </div>

              <div className="payment-status-box">
                {isPaid ? (
                  <CheckCircle2 size={19} />
                ) : (
                  <Clock3 size={19} />
                )}
                <div>
                  <strong>{getStatusLabel(booking.paymentStatus)}</strong>
                  <span>
                    {isPaid
                      ? "Payment marked as paid by the system."
                      : paymentStatus === "pending_verification"
                        ? "Your payment is awaiting admin verification."
                        : paymentStatus === "failed"
                          ? "Payment has not been completed successfully."
                          : paymentStatus === "refunded"
                            ? "Refund is marked as completed."
                            : "Payment has not been marked as received."}
                  </span>
                </div>
              </div>
            </section>

            <section className="details-card">
              <div className="details-section-title">
                <div className="details-title-icon">
                  <ShieldCheck size={19} />
                </div>
                <div>
                  <h2>Booking Protection</h2>
                  <p>Keep your booking reference safe</p>
                </div>
              </div>
              <p>
                Share your booking reference with MK Travels support when
                asking about this reservation.
              </p>
            </section>

            {!isCancelled && !isCompleted && (
              <button
                type="button"
                className="cancel-booking-button"
                onClick={() => setShowCancel(true)}
                disabled={processing}
              >
                <Trash2 size={16} />
                Cancel Booking
              </button>
            )}
          </aside>
        </div>
      </div>

      {showCancel && (
        <div className="cancel-modal-overlay">
          <div
            className="cancel-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cancel-booking-title"
          >
            <button
              type="button"
              className="modal-close"
              onClick={() => setShowCancel(false)}
              disabled={processing}
              aria-label="Close dialog"
            >
              <X size={19} />
            </button>

            <div className="cancel-modal-icon">
              <Trash2 size={25} />
            </div>

            <h2 id="cancel-booking-title">Cancel Booking?</h2>
            <p>
              Do you want to request cancellation for booking {reference}?
              The backend will check whether cancellation is permitted.
            </p>

            {isPaid && (
              <p>
                This booking is marked as paid. Cancellation may require
                refund verification.
              </p>
            )}

            <div className="cancel-modal-actions">
              <button
                type="button"
                className="keep-booking-button"
                onClick={() => setShowCancel(false)}
                disabled={processing}
              >
                Keep Booking
              </button>

              <button
                type="button"
                className="confirm-cancel-button"
                onClick={handleCancelBooking}
                disabled={processing}
              >
                {processing ? "Processing..." : "Confirm Cancellation"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BookingDetails;
