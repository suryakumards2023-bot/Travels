import { useState } from "react";
import {
  CheckCircle,
  Clock,
  Eye,
  RefreshCw,
  X,
  XCircle,
} from "lucide-react";
import "./RefundManagement.css";

const money = (amount) =>
  `₹${(Number(amount) || 0).toLocaleString("en-IN")}`;

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
};

const TYPE_LABELS = {
  tour: "Tour",
  hotel: "Hotel",
  cab: "Cab",
  bus: "Bus",
  insurance: "Insurance",
};

export default function RefundManagement({
  refunds = [],
  loading = false,
  processingId = "",
  onAction,
  onViewBooking,
}) {
  const [modalBooking, setModalBooking] = useState(null);
  const [refundAmount, setRefundAmount] = useState("");
  const [refundReference, setRefundReference] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState("");

  function openAmountModal(booking) {
    setModalError("");
    setRefundAmount(String(booking.amount ?? ""));
    setRefundReference("");
    setModalBooking({ booking, mode: "request" });
  }

  function openReferenceModal(booking) {
    setModalError("");
    setRefundAmount(String(booking.refundAmount ?? ""));
    setRefundReference("");
    setModalBooking({ booking, mode: "complete" });
  }

  function closeModal() {
    if (submitting) return;

    setModalBooking(null);
    setModalError("");
  }

  async function submitRefund(event) {
    event.preventDefault();

    if (!modalBooking || submitting) return;

    const { booking, mode } = modalBooking;

    if (mode === "request") {
      const amount = Number(refundAmount);

      if (
        refundAmount.trim() === "" ||
        !Number.isFinite(amount) ||
        amount <= 0 ||
        amount > Number(booking.amount)
      ) {
        setModalError(
          `Refund amount ₹1 se zyada aur booking amount ${money(
            booking.amount
          )} se zyada nahi hona chahiye.`
        );
        return;
      }

      setSubmitting(true);
      setModalError("");

      try {
        const success = await onAction(
          booking._id,
          "request",
          amount
        );

        if (success) setModalBooking(null);
      } catch (error) {
        setModalError(error.message || "Refund update nahi hua.");
      } finally {
        setSubmitting(false);
      }

      return;
    }

    const reference = refundReference.trim();

    if (!reference) {
      setModalError("Refund transaction reference enter karo.");
      return;
    }

    if (reference.length > 200) {
      setModalError("Reference 200 characters se chhota hona chahiye.");
      return;
    }

    const confirmed = window.confirm(
      `Kya ₹${Number(booking.refundAmount).toLocaleString(
        "en-IN"
      )} customer ko sach mein transfer ho chuka hai?\n\nSirf actual successful refund ke baad confirm karein.`
    );

    if (!confirmed) return;

    setSubmitting(true);
    setModalError("");

    try {
      const success = await onAction(
        booking._id,
        "complete",
        reference
      );

      if (success) setModalBooking(null);
    } catch (error) {
      setModalError(error.message || "Refund complete nahi hua.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading && refunds.length === 0) {
    return (
      <div className="refund-empty">
        <RefreshCw className="refund-spin" size={25} />
        <h3>Loading refunds...</h3>
        <p>Database se eligible cancelled bookings load ho rahi hain.</p>
      </div>
    );
  }

  return (
    <>
      <section className="refund-panel">
        <div className="refund-panel-heading">
          <div>
            <h2>Eligible Refunds</h2>
            <p>
              Sirf verified aur paid bookings jo cancel ho chuki hain.
            </p>
          </div>

          <span className="refund-count">
            {refunds.length} records
          </span>
        </div>

        {refunds.length === 0 ? (
          <div className="refund-empty">
            <CheckCircle size={28} />
            <h3>No eligible refunds</h3>
            <p>
              Verified payment wali cancelled bookings yahan dikhenगी.
            </p>
          </div>
        ) : (
          <div className="refund-table-wrap">
            <table className="refund-table">
              <thead>
                <tr>
                  <th>Customer / Reference</th>
                  <th>Booking</th>
                  <th>Cancellation</th>
                  <th>Refund Status</th>
                  <th>Refund Amount</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {refunds.map((booking) => {
                  const customer =
                    booking.user &&
                    typeof booking.user === "object"
                      ? booking.user
                      : {};

                  const status =
                    booking.refundStatus || "not_requested";

                  const busy =
                    processingId === booking._id;

                  return (
                    <tr key={booking._id}>
                      <td>
                        <div className="refund-cell">
                          <strong>
                            {customer.name || "Customer"}
                          </strong>
                          <span>
                            {booking.bookingReference || booking._id}
                          </span>
                          <span>{customer.email || "—"}</span>
                          <span>{customer.phone || "—"}</span>
                        </div>
                      </td>

                      <td>
                        <div className="refund-cell">
                          <strong>
                            {booking.title || "Travel Booking"}
                          </strong>
                          <span>
                            {TYPE_LABELS[booking.type] ||
                              booking.type ||
                              "Travel"}
                          </span>
                          <span>
                            {booking.destination || "—"}
                          </span>
                          <span>
                            Booking amount: {money(booking.amount)}
                          </span>
                        </div>
                      </td>

                      <td>
                        <div className="refund-cell">
                          <strong>
                            {booking.cancellationSource === "customer"
                              ? "Customer cancelled"
                              : booking.cancellationSource === "admin"
                                ? "Admin cancelled"
                                : "Cancellation recorded"}
                          </strong>
                          <span>
                            {formatDate(booking.cancellationDate)}
                          </span>
                        </div>
                      </td>

                      <td>
                        <span
                          className={`refund-status refund-status-${status}`}
                        >
                          {status === "refunded" ? (
                            <CheckCircle size={14} />
                          ) : status === "refund_pending" ? (
                            <Clock size={14} />
                          ) : (
                            <XCircle size={14} />
                          )}

                          {status === "refunded"
                            ? "Refunded"
                            : status === "refund_pending"
                              ? "Refund Pending"
                              : "Not Started"}
                        </span>

                        {booking.refundReference && (
                          <div className="refund-reference">
                            Ref: {booking.refundReference}
                          </div>
                        )}

                        {booking.refundedAt && (
                          <div className="refund-reference">
                            Date: {formatDate(booking.refundedAt)}
                          </div>
                        )}
                      </td>

                      <td>
                        <strong className="refund-amount">
                          {money(booking.refundAmount)}
                        </strong>
                      </td>

                      <td>
                        <div className="refund-actions">
                          <button
                            type="button"
                            className="refund-btn refund-btn-details"
                            onClick={() => onViewBooking(booking)}
                          >
                            <Eye size={14} />
                            Details
                          </button>

                          {status === "not_requested" && (
                            <button
                              type="button"
                              className="refund-btn refund-btn-primary"
                              disabled={busy}
                              onClick={() => openAmountModal(booking)}
                            >
                              {busy ? (
                                <RefreshCw
                                  size={14}
                                  className="refund-spin"
                                />
                              ) : (
                                <Clock size={14} />
                              )}
                              Mark Pending
                            </button>
                          )}

                          {status === "refund_pending" && (
                            <button
                              type="button"
                              className="refund-btn refund-btn-primary"
                              disabled={busy}
                              onClick={() => openReferenceModal(booking)}
                            >
                              {busy ? (
                                <RefreshCw
                                  size={14}
                                  className="refund-spin"
                                />
                              ) : (
                                <CheckCircle size={14} />
                              )}
                              Mark Refunded
                            </button>
                          )}

                          {status === "refunded" && (
                            <span className="refund-complete-label">
                              <CheckCircle size={14} />
                              Completed
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {modalBooking && (
        <div
          className="refund-modal-overlay"
          onClick={closeModal}
          role="presentation"
        >
          <section
            className="refund-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="refund-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="refund-modal-header">
              <div>
                <span className="refund-modal-eyebrow">
                  MK TRAVELS · REFUND MANAGEMENT
                </span>

                <h2 id="refund-modal-title">
                  {modalBooking.mode === "request"
                    ? "Set Refund Amount"
                    : "Confirm Refund"}
                </h2>
              </div>

              <button
                type="button"
                className="refund-modal-close"
                onClick={closeModal}
                disabled={submitting}
                aria-label="Close popup"
              >
                <X size={20} />
              </button>
            </div>

            <div className="refund-booking-summary">
              <span>Booking Reference</span>
              <strong>
                {modalBooking.booking.bookingReference ||
                  modalBooking.booking._id}
              </strong>

              <span>Original Booking Amount</span>
              <strong>
                {money(modalBooking.booking.amount)}
              </strong>
            </div>

            <form onSubmit={submitRefund}>
              {modalBooking.mode === "request" ? (
                <>
                  <label htmlFor="refund-amount">
                    Approved Refund Amount (₹)
                  </label>

                  <input
                    id="refund-amount"
                    type="number"
                    min="0.01"
                    max={modalBooking.booking.amount}
                    step="0.01"
                    value={refundAmount}
                    onChange={(event) => {
                      setRefundAmount(event.target.value);
                      setModalError("");
                    }}
                    placeholder="Refund amount enter karein"
                    required
                    autoFocus
                  />

                  <p className="refund-modal-help">
                    Amount check karke confirm karein. Is action se
                    customer ko paise transfer nahi honge.
                  </p>
                </>
              ) : (
                <>
                  <label htmlFor="refund-transaction-reference">
                    Actual Refund Transaction Reference
                  </label>

                  <input
                    id="refund-transaction-reference"
                    type="text"
                    maxLength={200}
                    value={refundReference}
                    onChange={(event) => {
                      setRefundReference(event.target.value);
                      setModalError("");
                    }}
                    placeholder="UPI / bank transaction reference"
                    required
                    autoFocus
                  />

                  <p className="refund-modal-help">
                    Sirf tab complete karein jab refund sach mein
                    customer ko bhej diya gaya ho.
                  </p>
                </>
              )}

              {modalError && (
                <div className="refund-modal-error" role="alert">
                  <XCircle size={16} />
                  {modalError}
                </div>
              )}

              <div className="refund-modal-actions">
                <button
                  type="button"
                  className="refund-btn refund-btn-cancel"
                  onClick={closeModal}
                  disabled={submitting}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="refund-btn refund-btn-primary refund-submit"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <RefreshCw
                        size={15}
                        className="refund-spin"
                      />
                      Saving...
                    </>
                  ) : modalBooking.mode === "request" ? (
                    "Confirm Refund Pending"
                  ) : (
                    "Confirm Refund Sent"
                  )}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </>
  );
}
