
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CalendarDays,
  CarFront,
  CheckCircle2,
  Hotel,
  Image as ImageIcon,
  MapPin,
  Search,
  ShieldCheck,
  Ticket,
  RefreshCw,
  X,
} from "lucide-react";

import { apiRequest } from "../api/api";
import "./MyBookings.css";

const FILTERS = ["All", "Upcoming", "Completed", "Cancelled"];
const TYPES = ["Tour", "Hotel", "Cab", "Bus", "Insurance"];

function getId(b) {
  return String(b?._id || b?.id || "");
}

function getReference(b) {
  return String(
    b?.bookingReference || b?.reference || b?._id || b?.id || "N/A"
  );
}

function getType(b) {
  const value = String(
    b?.type || b?.service || b?.bookingType || ""
  ).toLowerCase();
  const d = b?.details || {};

  if (value.includes("bus") || b?.busName || d?.busName) return "Bus";
  if (value.includes("hotel") || b?.hotelName || d?.checkIn) return "Hotel";

  if (
    value.includes("cab") ||
    value.includes("car") ||
    b?.cabName ||
    b?.vehicleName
  ) {
    return "Cab";
  }

  if (value.includes("insurance")) return "Insurance";

  return "Tour";
}

function getTitle(b) {
  const d = b?.details || {};

  return (
    b?.title ||
    b?.tourName ||
    b?.hotelName ||
    b?.busName ||
    b?.cabName ||
    b?.vehicleName ||
    d?.title ||
    d?.hotelName ||
    d?.busName ||
    d?.vehicleName ||
    `${getType(b)} Booking`
  );
}

function getDate(b) {
  const d = b?.details || {};

  return (
    b?.travelDate ||
    b?.date ||
    b?.checkIn ||
    b?.departureDate ||
    d?.travelDate ||
    d?.checkIn ||
    d?.departureDate ||
    ""
  );
}

function formatDate(date) {
  if (!date) return "—";

  const value = String(date).slice(0, 10);
  const parsed = new Date(`${value}T00:00:00`);

  if (Number.isNaN(parsed.getTime())) return String(date);

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function currency(value) {
  const n = Number(value);

  if (
    value === null ||
    value === undefined ||
    value === "" ||
    !Number.isFinite(n)
  ) {
    return "—";
  }

  return n.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  });
}

function getRefundAmount(b) {
  const value = b?.refundAmount;

  if (value === null || value === undefined || value === "") {
    return null;
  }

  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function getRefundInfo(b) {
  const refund = String(b?.refundStatus || "").toLowerCase();
  const payment = String(b?.paymentStatus || "").toLowerCase();
  const verification = String(
    b?.paymentVerificationStatus || ""
  ).toLowerCase();

  const status = String(b?.status || "").toLowerCase();
  const amount = getRefundAmount(b);
  const cancelled = ["cancelled", "canceled"].includes(status);
  const rejected =
    payment === "rejected" ||
    payment === "failed" ||
    verification === "rejected";

  if (refund === "refunded") {
    return { label: "Refund Confirmed", className: "refunded", amount };
  }

  if (refund === "refund_pending") {
    return { label: "Refund Pending", className: "refund-pending", amount };
  }

  if (refund === "not_eligible") {
    return { label: "Not Eligible", className: "no-refund", amount: null };
  }

  if (refund === "not_requested") {
    return { label: "Not Requested", className: "no-refund", amount: null };
  }

  if (rejected) {
    return { label: "Payment Rejected", className: "no-refund", amount: null };
  }

  if (cancelled) {
    return { label: "Awaiting Update", className: "refund-pending", amount };
  }

  return { label: "—", className: "no-refund", amount: null };
}

function getStatus(b) {
  const status = String(b?.status || "").toLowerCase();
  const verification = String(
    b?.paymentVerificationStatus || ""
  ).toLowerCase();
  const payment = String(b?.paymentStatus || "").toLowerCase();

  if (
    ["cancelled", "canceled", "rejected"].includes(status) ||
    verification === "rejected" ||
    payment === "rejected" ||
    payment === "failed"
  ) {
    return "Cancelled";
  }

  if (status === "completed") return "Completed";

  const date = getDate(b);

  if (date && (verification === "verified" || payment === "paid")) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const travelDate = new Date(
      `${String(date).slice(0, 10)}T00:00:00`
    );

    if (
      !Number.isNaN(travelDate.getTime()) &&
      travelDate < today
    ) {
      return "Completed";
    }
  }

  return "Upcoming";
}

/*
 * Customer can cancel an upcoming booking, including a confirmed/paid
 * booking, unless it has already been cancelled, completed or rejected.
 * Actual cancellation permission must also be enforced by the backend.
 */


function canCancelBooking(booking) {
  if (!booking) return false;

  const status = String(booking.status || "")
    .toLowerCase()
    .trim();

  const verification = String(
    booking.paymentVerificationStatus || ""
  ).toLowerCase().trim();

  const payment = String(
    booking.paymentStatus || ""
  ).toLowerCase().trim();

  const refund = String(
    booking.refundStatus || ""
  ).toLowerCase().trim();

  // Already cancelled or completed
  if (
    ["cancelled", "canceled", "completed"].includes(status)
  ) {
    return false;
  }

  // Rejected payments cannot be cancelled again
  if (
    verification === "rejected" ||
    ["rejected", "failed", "refunded"].includes(payment)
  ) {
    return false;
  }

  // Don't allow another cancellation once a refund is in progress
  if (["refund_pending", "refunded"].includes(refund)) {
    return false;
  }

  // Find the travel date, including dates nested in details
  const date = getDate(booking);

  if (date) {
    const travelDate = new Date(date);

    if (!Number.isNaN(travelDate.getTime())) {
      travelDate.setHours(0, 0, 0, 0);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (travelDate < today) {
        return false;
      }
    }
  }

  // Pending, verified, paid, and confirmed bookings are eligible.
  return true;
}



function getIcon(type) {
  if (type === "Bus") return Ticket;
  if (type === "Hotel") return Hotel;
  if (type === "Cab") return CarFront;
  if (type === "Insurance") return ShieldCheck;
  return MapPin;
}

function getScreenshotUrl(booking) {
  const candidates = [
    booking?.paymentScreenshotUrl,
    booking?.screenshotUrl,
    booking?.paymentScreenshotPath,
    booking?.screenshotPath,
    booking?.paymentScreenshot,
    booking?.screenshot,
  ];

  const value = candidates.find(
    (item) =>
      typeof item === "string" &&
      item.trim() !== "" &&
      item !== "null" &&
      item !== "undefined"
  );

  if (!value) return "";

  const path = value.trim();

  if (/^(https?:\/\/|data:image\/|blob:)/i.test(path)) {
    return path;
  }

  const apiBase = String(
    import.meta.env.VITE_API_URL || "http://localhost:5000/api"
  ).replace(/\/+$/, "");

  const backendOrigin = apiBase.replace(/\/api$/i, "");

  return `${backendOrigin}/${path.replace(/^\/+/, "")}`;
}

function normalize(b) {
  const d = b?.details || {};

  return {
    ...b,
    id: getId(b),
    reference: getReference(b),
    typeLabel: getType(b),
    titleLabel: getTitle(b),
    dateLabel: getDate(b),
    statusLabel: getStatus(b),
    amount: Number(
      b?.amount ?? b?.totalPrice ?? b?.price ?? d?.amount ?? 0
    ),
    refundInfo: getRefundInfo(b),
    screenshotUrl: getScreenshotUrl(b),
    fromLabel: b?.from || d?.from || d?.source || d?.origin || "",
    toLabel: b?.to || d?.to || d?.destination || "",
    destinationLabel:
      b?.destination || d?.destination || b?.location || "",
    travellers:
      b?.travellers ??
      b?.guests ??
      b?.seats ??
      d?.travellers ??
      d?.guests ??
      d?.seats ??
      1,
  };
}

function MyBookings() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [selectedScreenshot, setSelectedScreenshot] = useState(null);
  const [showAllBookings, setShowAllBookings] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cancellingId, setCancellingId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadBookings = useCallback(
    async ({ refresh = false } = {}) => {
      if (refresh) setRefreshing(true);
      setError("");

      try {
        const meResponse = await apiRequest("/auth/me");
        const currentUser = meResponse?.user || meResponse;

        if (
          !currentUser?._id &&
          !currentUser?.id &&
          !currentUser?.email
        ) {
          setUser(null);
          navigate("/login", {
            replace: true,
            state: { from: "/my-bookings" },
          });
          return;
        }

        setUser(currentUser);

        const response = await apiRequest("/bookings");

        const list = Array.isArray(response)
          ? response
          : Array.isArray(response?.bookings)
            ? response.bookings
            : Array.isArray(response?.data)
              ? response.data
              : Array.isArray(response?.data?.bookings)
                ? response.data.bookings
                : [];

        setBookings(
          list
            .filter((booking) => booking && (booking._id || booking.id))
            .map(normalize)
            .sort((a, b) => {
              const dateA = new Date(
                a.createdAt || a.dateLabel || 0
              ).getTime();

              const dateB = new Date(
                b.createdAt || b.dateLabel || 0
              ).getTime();

              return dateB - dateA;
            })
        );
      } catch (err) {
        if (
          err?.status === 401 ||
          /please login|session expired|invalid authentication/i.test(
            err?.message || ""
          )
        ) {
          setUser(null);
          navigate("/login", {
            replace: true,
            state: { from: "/my-bookings" },
          });
          return;
        }

        setError(
          err?.message ||
            "Bookings load nahi ho paayin. Please try again."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [navigate]
  );

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const summary = useMemo(() => {
    const refundedBookings = bookings.filter(
      (b) => String(b.refundStatus || "").toLowerCase() === "refunded"
    );

    const pendingRefundBookings = bookings.filter(
      (b) => String(b.refundStatus || "").toLowerCase() === "refund_pending"
    );

    return {
      total: bookings.length,
      upcoming: bookings.filter(
        (b) => b.statusLabel === "Upcoming"
      ).length,
      completed: bookings.filter(
        (b) => b.statusLabel === "Completed"
      ).length,
      cancelled: bookings.filter(
        (b) => b.statusLabel === "Cancelled"
      ).length,
      refundConfirmed: refundedBookings.length,
      refundPending: pendingRefundBookings.length,
    };
  }, [bookings]);

  const typeSummary = useMemo(
    () =>
      TYPES.map((type) => ({
        type,
        count: bookings.filter((b) => b.typeLabel === type).length,
      })),
    [bookings]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return bookings.filter((b) => {
      const matchesStatus =
        filter === "All" || b.statusLabel === filter;

      const matchesType =
        typeFilter === "All" || b.typeLabel === typeFilter;

      const searchable = [
        b.id,
        b.reference,
        b.titleLabel,
        b.destinationLabel,
        b.fromLabel,
        b.toLabel,
        b.typeLabel,
        b.paymentStatus,
        b.paymentVerificationStatus,
        b.refundStatus,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return (
        matchesStatus &&
        matchesType &&
        searchable.includes(q)
      );
    });
  }, [bookings, filter, typeFilter, search]);

  
const handleCancel = async (booking) => {
  if (!booking?.id || !canCancelBooking(booking) || cancellingId) {
    return;
  }

  const bookingId = booking.id;

  setCancellingId(bookingId);
  setError("");
  setNotice("");

  try {
    const response = await apiRequest(
      `/bookings/${encodeURIComponent(bookingId)}/cancel`,
      { method: "PATCH" }
    );

    setNotice(
      response?.message ||
        `Booking ${booking.reference} cancelled successfully.`
    );

    await loadBookings({ refresh: true });
  } catch (err) {
    setError(
      err?.message ||
        "Booking cancel nahi ho paayi. Please try again."
    );
  } finally {
    setCancellingId("");
  }
};


  if (loading) {
    return (
      <div className="my-bookings-page">
        <div className="my-bookings-loading">
          <RefreshCw size={20} className="my-bookings-spin" />
          <p>Loading your bookings...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="my-bookings-page">
        <div className="my-bookings-loading">
          Redirecting to login...
        </div>
      </div>
    );
  }

  return (
    <div className="my-bookings-page">
      <div className="my-bookings-container">
        <header className="my-bookings-header">
          <button
            type="button"
            className="my-bookings-back"
            onClick={() => navigate("/")}
          >
            Back to Home
          </button>

          <div className="my-bookings-title-row">
            <div>
              <h1>My Bookings</h1>
              <p>Manage your trips and track refund updates.</p>
            </div>

            <button
              type="button"
              className="my-bookings-refresh"
              onClick={() => loadBookings({ refresh: true })}
              disabled={refreshing}
            >
              <RefreshCw
                size={14}
                className={refreshing ? "my-bookings-spin" : ""}
              />
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </header>

        {notice && (
          <div className="my-bookings-success" role="status">
            <CheckCircle2 size={16} />
            <span>{notice}</span>
            <button
              type="button"
              onClick={() => setNotice("")}
              aria-label="Dismiss"
            >
              ×
            </button>
          </div>
        )}

        {error && (
          <div className="my-bookings-error" role="alert">
            <span>{error}</span>
            <button
              type="button"
              onClick={() => loadBookings({ refresh: true })}
            >
              Try Again
            </button>
          </div>
        )}

        <section className="my-overview-stats">
          <article className="my-overview-stat stat-blue">
            <span>Total Bookings</span>
            <strong>{summary.total}</strong>
            <small>All booking records</small>
          </article>

          <article className="my-overview-stat stat-purple">
            <span>Refund Confirmed</span>
            <strong>{summary.refundConfirmed}</strong>
            <small>Successfully refunded</small>
          </article>

          <article className="my-overview-stat stat-green">
            <span>Upcoming</span>
            <strong>{summary.upcoming}</strong>
            <small>Upcoming trips</small>
          </article>

          <article className="my-overview-stat stat-red">
            <span>Cancelled</span>
            <strong>{summary.cancelled}</strong>
            <small>Cancelled bookings</small>
          </article>

          <article className="my-overview-stat stat-orange">
            <span>Refund Pending</span>
            <strong>{summary.refundPending}</strong>
            <small>Awaiting refund completion</small>
          </article>
        </section>

        <section className="my-booking-category-grid">
          {typeSummary.map((item, index) => (
            <button
              type="button"
              key={item.type}
              className={`my-booking-category category-${index}`}
              onClick={() => {
                setTypeFilter(item.type);
                setFilter("All");
              }}
            >
              <span>{item.type}</span>
              <strong>{item.count}</strong>
              <small>
                {item.count === 1 ? "Booking" : "Bookings"}
              </small>
            </button>
          ))}
        </section>

        <section className="my-bookings-panel">
          <div className="my-bookings-panel-heading">
            <div>
              <h2>All Bookings</h2>
              <p>Search and manage your bookings, payments and refunds.</p>
            </div>

            <span className="my-bookings-result-count">
              {filtered.length} results
            </span>
          </div>

          <div className="my-bookings-toolbar">
            <label className="my-bookings-search">
              <Search size={15} />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search reference, booking, destination..."
                aria-label="Search bookings"
              />
            </label>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              aria-label="Filter booking type"
            >
              <option value="All">All types</option>
              {TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              aria-label="Filter booking status"
            >
              {FILTERS.map((item) => (
                <option key={item} value={item}>
                  {item} statuses
                </option>
              ))}
            </select>

            <button
              type="button"
              className="my-bookings-reset"
              onClick={() => {
                setSearch("");
                setFilter("All");
                setTypeFilter("All");
              }}
            >
              Reset
            </button>
          </div>

          <div className="my-bookings-table-wrap">
            <table className="my-bookings-table">
              <thead>
                <tr>
                  <th>Booking / Reference</th>
                  <th>Travel Date</th>
                  <th>Refund</th>
                  <th>Booking Status</th>
                  <th>Payment</th>
                  <th>Payment Screenshot</th>
                  <th>Details</th>
                </tr>
              </thead>

              <tbody>
                {(showAllBookings
                  ? filtered
                  : filtered.slice(0, 5)
                ).map((booking) => {
                  const refund = booking.refundInfo;
                  const Icon = getIcon(booking.typeLabel);

                  const route =
                    booking.fromLabel && booking.toLabel
                      ? `${booking.fromLabel} → ${booking.toLabel}`
                      : booking.destinationLabel;

                  const verification = String(
                    booking.paymentVerificationStatus || ""
                  ).toLowerCase();

                  const payment = String(
                    booking.paymentStatus || ""
                  ).toLowerCase();

                  const paymentLabel =
                    booking.paymentVerificationStatus ||
                    booking.paymentStatus ||
                    "Unavailable";

                  const paymentClass =
                    verification === "verified" || payment === "paid"
                      ? "payment-paid"
                      : verification === "rejected" ||
                          payment === "rejected" ||
                          payment === "failed"
                        ? "payment-rejected"
                        : "payment-pending";

                  return (
                    <tr key={booking.id}>
                      <td>
                        <div className="my-table-booking">
                          <span className="my-table-type-icon">
                            <Icon size={15} />
                          </span>

                          <div>
                            <strong>{booking.titleLabel}</strong>

                            {route && (
                              <small>
                                <MapPin size={11} />
                                {route}
                              </small>
                            )}

                            <small>Ref: {booking.reference}</small>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="my-table-date">
                          <CalendarDays size={12} />
                          {formatDate(booking.dateLabel)}
                        </span>
                      </td>

                      <td>
                        <div className="my-table-refund">
                          <strong>
                            {refund.amount !== null
                              ? currency(refund.amount)
                              : "—"}
                          </strong>

                          <span
                            className={`my-refund-badge ${refund.className}`}
                          >
                            {refund.label}
                          </span>

                          {String(booking.refundStatus || "").toLowerCase() ===
                            "refunded" &&
                            booking.refundReference && (
                              <small>
                                Ref: {booking.refundReference}
                              </small>
                            )}
                        </div>
                      </td>

                      <td>
                        <span
                          className={`my-table-status status-${booking.statusLabel.toLowerCase()}`}
                        >
                          {booking.statusLabel}
                        </span>

                        {(booking.cancelledBy ||
                          booking.cancellationSource) && (
                          <small className="my-cancelled-by">
                            By:{" "}
                            {booking.cancelledBy ||
                              booking.cancellationSource}
                          </small>
                        )}

                        {booking.cancellationDate && (
                          <small className="my-cancelled-by">
                            On: {formatDate(booking.cancellationDate)}
                          </small>
                        )}
                      </td>

                      <td>
                        <div className="my-table-payment">
                          <span
                            className={`my-payment-badge ${paymentClass}`}
                          >
                            {paymentLabel}
                          </span>

                          {booking.refundedAt && (
                            <small>
                              Refunded: {formatDate(booking.refundedAt)}
                            </small>
                          )}
                        </div>
                      </td>

                      <td>
                        {booking.screenshotUrl ? (
                          <button
                            type="button"
                            className="my-table-screenshot"
                            onClick={() =>
                              setSelectedScreenshot({
                                url: booking.screenshotUrl,
                                reference: booking.reference,
                              })
                            }
                            aria-label={`View payment screenshot for ${booking.reference}`}
                          >
                            <ImageIcon size={13} />
                            Screenshot
                          </button>
                        ) : (
                          <span className="my-screenshot-unavailable">
                            Not available
                          </span>
                        )}
                      </td>

                      
<td>
  <div className="my-table-actions">
    <Link
      to={`/booking-details/${encodeURIComponent(booking.id)}`}
      state={{ booking }}
      className="my-table-view"
    >
      View
    </Link>

    {canCancelBooking(booking) && (
      <button
        type="button"
        className="my-table-cancel"
        disabled={cancellingId === booking.id}
        onClick={() => handleCancel(booking)}
      >
        {cancellingId === booking.id
          ? "Cancelling..."
          : "Cancel Booking"}
      </button>
    )}
  </div>
</td>


                    </tr>
                  );
                })}

                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7}>
                      <div className="my-bookings-empty">
                        <CalendarDays size={27} />

                        <strong>
                          {bookings.length
                            ? "No matching bookings"
                            : "No bookings yet"}
                        </strong>

                        <p>
                          {bookings.length
                            ? "Change your search or filters and try again."
                            : "Your saved bookings will appear here."}
                        </p>

                        {bookings.length === 0 && (
                          <Link
                            to="/"
                            className="my-bookings-explore"
                          >
                            Explore Trips
                            <ArrowRight size={14} />
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {filtered.length > 5 && (
            <div className="my-bookings-see-more-wrap">
              <button
                type="button"
                className="my-bookings-see-more"
                onClick={() => setShowAllBookings((prev) => !prev)}
              >
                {showAllBookings ? "Show Less" : "See More"}
              </button>
            </div>
          )}
        </section>

        <div className="my-bookings-help">
          <ShieldCheck size={16} />
          <p>
            Booking, payment and refund information is displayed from your
            saved booking records. Refund completion depends on the recorded
            refund status.
          </p>
        </div>
      </div>

      {selectedScreenshot && (
        <div
          className="my-screenshot-modal-overlay"
          role="presentation"
          onClick={() => setSelectedScreenshot(null)}
        >
          <div
            className="my-screenshot-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Payment screenshot"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="my-screenshot-modal-header">
              <div>
                <strong>Payment Screenshot</strong>
                <small>Ref: {selectedScreenshot.reference}</small>
              </div>

              <button
                type="button"
                className="my-screenshot-modal-close"
                onClick={() => setSelectedScreenshot(null)}
                aria-label="Close screenshot"
                title="Close"
              >
                <X size={22} />
              </button>
            </div>

            <div className="my-screenshot-modal-body">
              <img
                src={selectedScreenshot.url}
                alt={`Payment screenshot for ${selectedScreenshot.reference}`}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyBookings;
