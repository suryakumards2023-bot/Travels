
import { useCallback, useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarCheck,
  CreditCard,
  CheckCircle,
  XCircle,
  RefreshCw,
  Clock,
  CalendarDays,
  IndianRupee,
  Image as ImageIcon,
  Search,
  X,
  Copy,
  Eye,
  Users,
  Star,
  ChevronRight,
  FileSearch,
  MessageSquare,
} from "lucide-react";
import { apiRequest } from "../api/api";
import "./AdminDashboard.css";
import RefundManagement from "../components/admin/RefundManagement";

const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000/api"
).replace(/\/+$/, "");

const TYPES = ["tour", "hotel", "cab", "bus", "insurance"];

const TYPE_LABELS = {
  tour: "Tour",
  hotel: "Hotel",
  cab: "Cab",
  bus: "Bus",
  insurance: "Insurance",
};

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

// Local date key, e.g. 2026-10-20.
function getLocalDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

// Handles date-only strings without accidentally changing their calendar date.
function getTravelDateKey(value) {
  if (!value) return "";

  if (typeof value === "string") {
    const dateOnlyMatch = value.match(/^(\d{4}-\d{2}-\d{2})$/);

    if (dateOnlyMatch) return dateOnlyMatch[1];
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return getLocalDateKey(date);
}

function getBookingStatus(booking) {
  const status = String(booking.status || "").trim().toLowerCase();

  if (
    status === "cancelled" ||
    status === "canceled" ||
    booking.cancellationSource === "customer" ||
    booking.cancellationSource === "admin"
  ) {
    return "cancelled";
  }

  if (status === "confirmed" || status === "completed") {
    return "confirmed";
  }

  if (status === "rejected") {
    return "rejected";
  }

  return "pending";
}

function getPaymentLabel(booking) {
  const status = String(
    booking.paymentVerificationStatus || ""
  ).toLowerCase();

  if (status === "verified" || booking.paymentStatus === "paid") {
    return "Paid / Verified";
  }

  if (status === "rejected" || booking.paymentStatus === "failed") {
    return "Rejected";
  }

  return "Pending";
}

function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("dashboard");

  const [bookings, setBookings] = useState([]);
  const [requests, setRequests] = useState([]);
  const [refunds, setRefunds] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [processingId, setProcessingId] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showAllBookings, setShowAllBookings] = useState(false);

  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedImage, setSelectedImage] = useState("");
  const [screenshotReference, setScreenshotReference] = useState("");
  const [screenshotData, setScreenshotData] = useState("");
  const [screenshotLoading, setScreenshotLoading] = useState(false);
  const [screenshotError, setScreenshotError] = useState("");

  // Travel-date analytics selection.
  const [analyticsDate, setAnalyticsDate] = useState(() =>
    getLocalDateKey(new Date())
  );

  useEffect(() => {
    let active = true;

    async function loadUser() {
      try {
        const data = await apiRequest("/auth/me");

        if (active) setUser(data.user || data);
      } catch {
        if (active) setUser(null);
      } finally {
        if (active) setAuthLoading(false);
      }
    }

    loadUser();

    return () => {
      active = false;
    };
  }, []);

  const loadDashboardData = useCallback(async () => {
    setDataLoading(true);
    setError("");

    try {
      const [bookingResult, paymentResult, refundResult] =
  await Promise.all([
    apiRequest("/bookings/admin/bookings"),
    apiRequest("/bookings/admin/payment-requests"),
    apiRequest("/bookings/admin/refunds"),
  ]);

      
const allBookings = Array.isArray(bookingResult)
  ? bookingResult
  : Array.isArray(bookingResult?.bookings)
    ? bookingResult.bookings
    : Array.isArray(bookingResult?.data?.bookings)
      ? bookingResult.data.bookings
      : Array.isArray(bookingResult?.data)
        ? bookingResult.data
        : [];

const paymentRequests = Array.isArray(paymentResult)
  ? paymentResult
  : Array.isArray(paymentResult?.bookings)
    ? paymentResult.bookings
    : Array.isArray(paymentResult?.requests)
      ? paymentResult.requests
      : Array.isArray(paymentResult?.data?.bookings)
        ? paymentResult.data.bookings
        : Array.isArray(paymentResult?.data?.requests)
          ? paymentResult.data.requests
          : [];

const refundBookings = Array.isArray(refundResult)
  ? refundResult
  : Array.isArray(refundResult?.bookings)
    ? refundResult.bookings
    : Array.isArray(refundResult?.refunds)
      ? refundResult.refunds
      : Array.isArray(refundResult?.data?.bookings)
        ? refundResult.data.bookings
        : Array.isArray(refundResult?.data?.refunds)
          ? refundResult.data.refunds
          : [];

setBookings(allBookings);
setRequests(paymentRequests);
setRefunds(refundBookings);

    } catch (err) {
      setError(
        err.message ||
          "Booking data load nahi hua. Backend endpoint check karein."
      );
    } finally {
      setDataLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role === "admin") {
      loadDashboardData();
    }
  }, [user, loadDashboardData]);

  // All-time dashboard statistics. Kept for the Dashboard section.
  const stats = useMemo(() => {
    const result = {
      total: bookings.length,
      confirmed: 0,
      pending: 0,
      cancelled: 0,
      rejected: 0,
      amount: 0,
      types: {},
    };

    TYPES.forEach((type) => {
      result.types[type] = { count: 0, amount: 0 };
    });

    bookings.forEach((booking) => {
      const status = getBookingStatus(booking);

      if (status === "confirmed") result.confirmed += 1;
      else if (status === "cancelled") result.cancelled += 1;
      else if (status === "rejected") result.rejected += 1;
      else result.pending += 1;

      const amount = Number(booking.amount) || 0;
      result.amount += amount;

      if (result.types[booking.type]) {
        result.types[booking.type].count += 1;
        result.types[booking.type].amount += amount;
      }
    });

    return result;
  }, [bookings]);

  // Filter by TRAVEL DATE, not createdAt.
  const travelDateStats = useMemo(() => {
    const result = {
      total: 0,
      amount: 0,
      confirmed: 0,
      pending: 0,
      cancelled: 0,
      rejected: 0,
      types: {},
    };

    TYPES.forEach((type) => {
      result.types[type] = { count: 0, amount: 0 };
    });

    const dateBookings = bookings.filter((booking) => {
      return getTravelDateKey(booking.travelDate) === analyticsDate;
    });

    dateBookings.forEach((booking) => {
      result.total += 1;

      const amount = Number(booking.amount) || 0;
      result.amount += amount;

      const status = getBookingStatus(booking);

      if (status === "confirmed") result.confirmed += 1;
      else if (status === "cancelled") result.cancelled += 1;
      else if (status === "rejected") result.rejected += 1;
      else result.pending += 1;

      if (result.types[booking.type]) {
        result.types[booking.type].count += 1;
        result.types[booking.type].amount += amount;
      }
    });

    return { ...result, bookings: dateBookings };
  }, [bookings, analyticsDate]);


const pendingRequests = useMemo(
  () =>
    requests.filter((booking) => {
      const paymentStatus = String(
        booking.paymentVerificationStatus || ""
      ).toLowerCase();

      const hasScreenshot = Boolean(booking.paymentScreenshot);

      // Screenshot wali pending payment request ko dikhao,
      // chahe booking customer ya admin ne cancel ki ho.
      return (
        hasScreenshot &&
        [
          "",
          "pending",
          "pending_verification",
        ].includes(paymentStatus)
      );
    }),
  [requests]
);

const pendingAmount = pendingRequests.reduce(
  (total, booking) =>
    total + (Number(booking.amount) || 0),
  0
);


  const visibleBookings = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return bookings.filter((booking) => {
      const customer =
        booking.user && typeof booking.user === "object"
          ? booking.user
          : {};

      const searchableText = [
        booking.bookingReference,
        booking._id,
        booking.title,
        booking.destination,
        booking.type,
        customer.name,
        customer.email,
        customer.phone,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      if (query && !searchableText.includes(query)) return false;

      if (typeFilter !== "all" && booking.type !== typeFilter) {
        return false;
      }

      const status = getBookingStatus(booking);

      if (statusFilter !== "all" && status !== statusFilter) {
        return false;
      }

      const created = booking.createdAt
        ? new Date(booking.createdAt)
        : null;

      if (startDate) {
        const from = new Date(`${startDate}T00:00:00`);

        if (!created || created < from) return false;
      }

      if (endDate) {
        const to = new Date(`${endDate}T23:59:59.999`);

        if (!created || created > to) return false;
      }

      return true;
    });
  }, [
    bookings,
    searchTerm,
    typeFilter,
    statusFilter,
    startDate,
    endDate,
  ]);

  const displayedBookings = showAllBookings
    ? visibleBookings
    : visibleBookings.slice(0, 5);

  const customers = useMemo(() => {
    const map = new Map();

    bookings.forEach((booking) => {
      const customer =
        booking.user && typeof booking.user === "object"
          ? booking.user
          : null;

      if (!customer) return;

      const key =
        customer._id ||
        customer.email ||
        customer.phone ||
        customer.name;

      if (key && !map.has(key)) {
        map.set(key, {
          ...customer,
          bookingCount: 0,
          totalAmount: 0,
        });
      }

      if (key && map.has(key)) {
        const current = map.get(key);
        current.bookingCount += 1;
        current.totalAmount += Number(booking.amount) || 0;
      }
    });

    return Array.from(map.values());
  }, [bookings]);

  function resetFilters() {
    setSearchTerm("");
    setTypeFilter("all");
    setStatusFilter("all");
    setStartDate("");
    setEndDate("");
    setShowAllBookings(false);
  }

  async function copyReference(reference) {
    try {
      await navigator.clipboard.writeText(String(reference));
      setMessage(`Reference ${reference} copied.`);
      setError("");
    } catch {
      setError("Reference copy nahi ho saka.");
    }
  }

  function closeScreenshot() {
    setSelectedImage("");
    setScreenshotReference("");

    
    setScreenshotData((previous) => {
      if (previous) URL.revokeObjectURL(previous);
      return "";
    });

    setScreenshotError("");
    setScreenshotLoading(false);
  }

  async function openScreenshot(bookingId, reference = "") {
  closeScreenshot();

  setSelectedImage(bookingId);
  setScreenshotReference(reference || bookingId);
  setScreenshotLoading(true);

  try {
    const response = await fetch(
      `${API_BASE_URL}/bookings/admin/payment-requests/${bookingId}/screenshot`,
      { credentials: "include" }
    );

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));

      throw new Error(
        data.message ||
          `Screenshot load failed (${response.status}).`
      );
    }

    const blob = await response.blob();

    if (!blob.type.startsWith("image/")) {
      throw new Error("Server ne valid image return nahi ki.");
    }

    setScreenshotData(URL.createObjectURL(blob));
  } catch (err) {
    setScreenshotError(
      err.message || "Screenshot open nahi hua."
    );
  } finally {
    setScreenshotLoading(false);
  }
}

  async function handleDecision(id, action) {
  setProcessingId(id);
  setError("");
  setMessage("");

  const booking = requests.find(
    (item) => String(item._id) === String(id)
  );

  const wasCancelled =
    ["cancelled", "canceled"].includes(
      String(booking?.status || "").toLowerCase()
    );

  try {
    const result = await apiRequest(
      `/bookings/admin/payment-requests/${id}/${action}`,
      { method: "PATCH" }
    );

    if (result.message) {
      setMessage(result.message);
    } else if (action === "approve" && wasCancelled) {
      setMessage(
        "Payment verified. Booking remains cancelled; check Refund Management."
      );
    } else if (action === "approve") {
      setMessage("Payment verified successfully.");
    } else {
      setMessage(
        "Payment rejected. Cancellation details remain recorded."
      );
    }

    await loadDashboardData();
  } catch (err) {
    setError(
      err.message || "Payment request update nahi hui."
    );
  } finally {
    setProcessingId("");
  }
}

  

async function handleRefundAction(id, action, value = "") {
  setProcessingId(id);
  setError("");
  setMessage("");

  try {
    const options = { method: "PATCH" };

    if (action === "request") {
      options.headers = {
        "Content-Type": "application/json",
      };
      options.body = JSON.stringify({
        refundAmount: Number(value),
      });
    }

    if (action === "complete") {
      options.headers = {
        "Content-Type": "application/json",
      };
      options.body = JSON.stringify({
        refundReference: String(value).trim(),
      });
    }

    const result = await apiRequest(
      `/bookings/admin/refunds/${id}/${action}`,
      options
    );

    setMessage(result.message || "Refund record updated.");

    await loadDashboardData();

    return true;
  } catch (err) {
    setError(err.message || "Refund update nahi ho saka.");
    return false;
  } finally {
    setProcessingId("");
  }
}



  if (authLoading) {
    return (
      <div className="admin-loading-screen">
        <RefreshCw size={25} className="admin-spin" />
        <p>Checking admin access...</p>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (user.role !== "admin") {
    return <Navigate to="/profile" replace />;
  }

  return (
    <div className="admin-shell">
      <div className="admin-layout">
        <aside className="admin-sidebar">
          <div className="admin-sidebar-heading">
            <span>ADMIN WORKSPACE</span>
            <small>Management Console</small>
          </div>

          <p className="admin-nav-heading">WORKSPACE</p>

          <nav className="admin-sidebar-nav">
            <NavButton
              active={activeSection === "dashboard"}
              onClick={() => setActiveSection("dashboard")}
              icon={LayoutDashboard}
              label="Dashboard"
            />

            <NavButton
              active={activeSection === "bookings"}
              onClick={() => setActiveSection("bookings")}
              icon={CalendarCheck}
              label="Booking Management"
            />

            <NavButton
              active={activeSection === "payments"}
              onClick={() => setActiveSection("payments")}
              icon={CreditCard}
              label="Payments"
              count={pendingRequests.length}
            />

            <NavButton
              active={activeSection === "customers"}
              onClick={() => setActiveSection("customers")}
              icon={Users}
              label="Customers"
            />

            <NavButton
  active={activeSection === "refunds"}
  onClick={() => setActiveSection("refunds")}
  icon={IndianRupee}
  label="Refund Management"
  count={refunds.length}
/>

            <NavButton
              active={activeSection === "ratings"}
              onClick={() => setActiveSection("ratings")}
              icon={Star}
              label="Ratings & Reviews"
            />
          </nav>

          <div className="admin-sidebar-bottom">
            <div className="admin-sidebar-footer">
              <span className="admin-secure-dot" />
              <span>Secure admin access</span>
            </div>
          </div>
        </aside>

        <main className="admin-main">
          {/* DASHBOARD */}
          {activeSection === "dashboard" && (
            <>
              <PageHeading
                eyebrow="OVERVIEW"
                title="Dashboard Overview"
                description="Monitor bookings, revenue and customer activity."
                onRefresh={loadDashboardData}
                loading={dataLoading}
              />

              {error && <Notice type="error" message={error} />}
              {message && <Notice message={message} />}

              <BookingOverview stats={stats} />

              <BookingsTable
                bookings={displayedBookings}
                totalFiltered={visibleBookings.length}
                totalBookings={bookings.length}
                loading={dataLoading}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                typeFilter={typeFilter}
                setTypeFilter={setTypeFilter}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                startDate={startDate}
                setStartDate={setStartDate}
                endDate={endDate}
                setEndDate={setEndDate}
                resetFilters={resetFilters}
                showAllBookings={showAllBookings}
                setShowAllBookings={setShowAllBookings}
                onRefresh={loadDashboardData}
                onCopy={copyReference}
                onScreenshot={openScreenshot}
                screenshotLoading={screenshotLoading}
                selectedImage={selectedImage}
                setSelectedBooking={setSelectedBooking}
              />
            </>
          )}

          {/* BOOKING MANAGEMENT: TRAVEL-DATE ANALYTICS */}
          {activeSection === "bookings" && (
            <>
              <PageHeading
                eyebrow="TRAVEL ANALYTICS"
                title="Travel Booking Analytics"
                description="Travel date ke according Tour, Hotel, Cab, Bus aur Insurance bookings dekhein."
                onRefresh={loadDashboardData}
                loading={dataLoading}
              />

              {error && <Notice type="error" message={error} />}
              {message && <Notice message={message} />}

              <TravelDateAnalytics
                selectedDate={analyticsDate}
                setSelectedDate={setAnalyticsDate}
                stats={travelDateStats}
                loading={dataLoading}
                onViewBooking={setSelectedBooking}
              />
            </>
          )}

          {/* PAYMENTS: VERIFICATION IS PRESERVED HERE */}
          {activeSection === "payments" && (
            <>
              <PageHeading
                eyebrow="PAYMENTS"
                title="Payment Verification"
                description="Review submitted screenshots and verify customer payments."
                onRefresh={loadDashboardData}
                loading={dataLoading}
              />

              {error && <Notice type="error" message={error} />}
              {message && <Notice message={message} />}

              <div className="admin-payment-totals admin-payment-totals-large">
                <span>
                  <strong>{pendingRequests.length}</strong> pending requests
                </span>
                <span>
                  <strong>{money(pendingAmount)}</strong> amount awaiting review
                </span>
              </div>

              <PaymentRequestsTable
                requests={requests}
                loading={dataLoading}
                onRefresh={loadDashboardData}
                onDecision={handleDecision}
                processingId={processingId}
                onScreenshot={openScreenshot}
                screenshotLoading={screenshotLoading}
                selectedImage={selectedImage}
                onCopy={copyReference}
              />
            </>
          )}

          
{/* REFUND MANAGEMENT */}
{activeSection === "refunds" && (
  <>
    <PageHeading
      eyebrow="REFUND MANAGEMENT"
      title="Cancelled Booking Refunds"
      description="Manage refunds only for verified and paid bookings cancelled by customers or admins."
      onRefresh={loadDashboardData}
      loading={dataLoading}
    />

    {error && <Notice type="error" message={error} />}
    {message && <Notice message={message} />}

    <div className="admin-payment-totals admin-payment-totals-large">
      <span>
        <strong>{refunds.length}</strong> eligible refunds
      </span>
      <span>
        <strong>
          {money(
            refunds.reduce(
              (total, booking) =>
                total + (Number(booking.refundAmount) || 0),
              0
            )
          )}
        </strong>{" "}
        refund amount recorded
      </span>
    </div>

    <RefundManagement
  refunds={refunds}
  loading={dataLoading}
  processingId={processingId}
  onAction={handleRefundAction}
  onViewBooking={setSelectedBooking}
/>
  </>
)}



          {/* CUSTOMERS */}
          {activeSection === "customers" && (
            <>
              <PageHeading
                eyebrow="CUSTOMERS"
                title="Customer Management"
                description="Customers found in the booking records returned by your backend."
                onRefresh={loadDashboardData}
                loading={dataLoading}
              />

              {error && <Notice type="error" message={error} />}

              <section className="admin-panel-section">
                <div className="admin-section-heading">
                  <div>
                    <h2>Registered Customers</h2>
                    <p>
                      Customer records are grouped from booking data.
                    </p>
                  </div>

                  <span className="admin-count-badge">
                    {customers.length} customers
                  </span>
                </div>

                {customers.length === 0 ? (
                  <EmptyState
                    icon={Users}
                    title="No customer records available"
                    description="Customer details will appear when bookings include populated user information."
                  />
                ) : (
                  <div className="admin-table-wrap">
                    <table className="admin-payment-table">
                      <thead>
                        <tr>
                          <th>Customer</th>
                          <th>Email / Mobile</th>
                          <th>Bookings</th>
                          <th>Total Amount</th>
                        </tr>
                      </thead>

                      <tbody>
                        {customers.map((customer, index) => (
                          <tr
                            key={
                              customer._id ||
                              customer.email ||
                              index
                            }
                          >
                            <td>
                              <div className="admin-cell-copy">
                                <strong>
                                  {customer.name || "Customer"}
                                </strong>
                                <span>Customer account</span>
                              </div>
                            </td>

                            <td>
                              <div className="admin-cell-copy">
                                <span>
                                  {customer.email || "No email"}
                                </span>
                                <span>
                                  {customer.phone || "No phone"}
                                </span>
                              </div>
                            </td>

                            <td>
                              <strong>{customer.bookingCount}</strong>
                            </td>

                            <td>
                              <strong className="admin-amount">
                                {money(customer.totalAmount)}
                              </strong>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </>
          )}

          {/* RATINGS */}
          {activeSection === "ratings" && (
            <>
              <PageHeading
                eyebrow="FEEDBACK"
                title="Ratings & Reviews"
                description="Customer feedback and ratings."
                onRefresh={loadDashboardData}
                loading={dataLoading}
              />

              <section className="admin-panel-section">
                <div className="admin-section-heading">
                  <div>
                    <h2>Customer Ratings</h2>
                    <p>
                      Review data needs to be supplied by a ratings/reviews
                      backend endpoint.
                    </p>
                  </div>
                </div>

                <EmptyState
                  icon={MessageSquare}
                  title="Ratings API not connected"
                  description="Connect the review model and API route to show real ratings here."
                />
              </section>
            </>
          )}

          <footer className="admin-page-footer">
            <span>Admin workspace</span>
            <span>Data shown from connected booking records</span>
          </footer>
        </main>
      </div>

      {/* BOOKING DETAILS MODAL */}
      {selectedBooking && (
        <div
          className="admin-image-modal"
          onClick={() => setSelectedBooking(null)}
          role="presentation"
        >
          <div
            className="admin-image-modal-content admin-details-modal"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Booking details"
          >
            <div className="admin-modal-header">
              <div>
                <span className="admin-modal-eyebrow">
                  BOOKING DETAILS
                </span>
                <strong>
                  {selectedBooking.title || "Travel Booking"}
                </strong>
                <p>
                  Reference:{" "}
                  {selectedBooking.bookingReference ||
                    selectedBooking._id}
                </p>
              </div>

              <button
                type="button"
                className="admin-image-close"
                onClick={() => setSelectedBooking(null)}
                aria-label="Close details"
              >
                <X size={20} />
              </button>
            </div>

            <div className="admin-details-grid">
              <Detail
                label="Customer"
                value={selectedBooking.user?.name || "Customer"}
              />
              <Detail
                label="Email"
                value={selectedBooking.user?.email || "—"}
              />
              <Detail
                label="Mobile"
                value={selectedBooking.user?.phone || "—"}
              />
              <Detail
                label="Booking Type"
                value={
                  TYPE_LABELS[selectedBooking.type] ||
                  selectedBooking.type
                }
              />
              <Detail
                label="Destination"
                value={selectedBooking.destination || "—"}
              />
              <Detail
                label="Travel Date"
                value={formatDate(selectedBooking.travelDate)}
              />
              <Detail
                label="End Date"
                value={formatDate(selectedBooking.endDate)}
              />
              <Detail
                label="Travellers"
                value={selectedBooking.travellers ?? "—"}
              />
              <Detail
                label="Booking Amount"
                value={money(selectedBooking.amount)}
              />
              <Detail
                label="Booking Status"
                value={getBookingStatus(selectedBooking)}
              />
              <Detail
                label="Payment Status"
                value={getPaymentLabel(selectedBooking)}
              />
              <Detail
                label="Created"
                value={formatDate(selectedBooking.createdAt)}
              />
              
{selectedBooking.status === "cancelled" && (
  <div className="admin-extra-details">
    <h4>Cancellation Information</h4>

    <div>
      <span>Cancelled By</span>
      <strong>
        {selectedBooking.cancellationSource === "customer"
          ? "Customer"
          : selectedBooking.cancellationSource === "admin"
          ? "Admin"
          : "Unknown"}
      </strong>
    </div>

    <div>
      <span>Cancellation Date</span>
      <strong>
        {selectedBooking.cancellationDate
          ? new Date(
              selectedBooking.cancellationDate
            ).toLocaleString("en-IN")
          : "Not available"}
      </strong>
    </div>
  </div>
)}


            </div>

            {selectedBooking.details &&
              Object.keys(selectedBooking.details).length > 0 && (
                <div className="admin-extra-details">
                  <h4>Additional Details</h4>

                  {Object.entries(selectedBooking.details).map(
                    ([key, value]) => (
                      <div key={key}>
                        <span>
                          {key.replace(/([A-Z])/g, " $1")}
                        </span>
                        <strong>
                          {typeof value === "object"
                            ? JSON.stringify(value)
                            : String(value ?? "—")}
                        </strong>
                      </div>
                    )
                  )}
                </div>
              )}

            {selectedBooking.paymentScreenshot && (
              <button
                type="button"
                className="admin-view-screenshot"
                onClick={() =>
  openScreenshot(
    selectedBooking._id,
    selectedBooking.bookingReference || selectedBooking._id
  )
}
              >
                <Eye size={15} />
                View Payment Screenshot
              </button>
            )}
          </div>
        </div>
      )}

      {/* PAYMENT SCREENSHOT MODAL */}
      {selectedImage && (
        <div
          className="admin-image-modal"
          onClick={closeScreenshot}
          role="presentation"
        >
          <div
            className="admin-image-modal-content"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Payment screenshot"
          >
            <div className="admin-modal-header">
              <div>
  <span className="admin-modal-eyebrow">PAYMENT PROOF</span>
  <strong>Payment Screenshot</strong>
  <p>Ref: {screenshotReference || "Reference unavailable"}</p>
</div>

              <button
                type="button"
                className="admin-image-close"
                onClick={closeScreenshot}
                aria-label="Close screenshot"
              >
                <X size={20} />
              </button>
            </div>

            {screenshotLoading && (
              <div className="admin-modal-loading">
                <RefreshCw size={26} className="admin-spin" />
                <p>Loading payment screenshot...</p>
              </div>
            )}

            {screenshotError && (
              <Notice type="error" message={screenshotError} />
            )}

            {screenshotData && !screenshotLoading && (
              <img
                src={screenshotData}
                alt="Customer payment screenshot"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function TravelDateAnalytics({
  selectedDate,
  setSelectedDate,
  stats,
  loading,
  onViewBooking,
}) {
  const today = getLocalDateKey(new Date());

  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrow = getLocalDateKey(tomorrowDate);

  const dateLabel =
    selectedDate === today
      ? "Today's Travel"
      : selectedDate === tomorrow
        ? "Tomorrow's Travel"
        : formatDate(`${selectedDate}T12:00:00`);

  return (
    <div className="admin-travel-analytics">
      <section className="admin-panel-section">
        <div className="admin-section-heading">
          <div>
            <h2>Select Travel Date</h2>
            <p>
              Bookings are matched using the travel date saved in the
              booking record.
            </p>
          </div>
          <CalendarDays size={24} />
        </div>

        <div className="admin-travel-date-controls">
          <button
            type="button"
            className={`admin-travel-date-btn ${
              selectedDate === today ? "active" : ""
            }`}
            onClick={() => setSelectedDate(today)}
          >
            <CalendarCheck size={17} />
            Today
          </button>

          <button
            type="button"
            className={`admin-travel-date-btn ${
              selectedDate === tomorrow ? "active" : ""
            }`}
            onClick={() => setSelectedDate(tomorrow)}
          >
            <CalendarDays size={17} />
            Tomorrow
          </button>

          <label className="admin-travel-calendar">
            <CalendarDays size={18} />
            <span>Choose date</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(event) => {
                if (event.target.value) {
                  setSelectedDate(event.target.value);
                }
              }}
            />
          </label>
        </div>
      </section>

      <section className="admin-travel-selected-summary">
        <div className="admin-travel-summary-heading">
          <div>
            <span className="admin-eyebrow">TRAVEL DATE REPORT</span>
            <h2>{dateLabel}</h2>
            <p>{formatDate(`${selectedDate}T12:00:00`)}</p>
          </div>

          <div className="admin-travel-summary-date-icon">
            <CalendarDays size={25} />
          </div>
        </div>

        <div className="admin-travel-total-grid">
          <article className="admin-travel-total-card">
            <span>Total Bookings</span>
            <strong>{stats.total}</strong>
            <small>For selected travel date</small>
          </article>

          <article className="admin-travel-total-card">
            <span>Total Booking Amount</span>
            <strong>{money(stats.amount)}</strong>
            <small>Combined booking value</small>
          </article>

          <article className="admin-travel-total-card">
            <span>Confirmed</span>
            <strong>{stats.confirmed}</strong>
            <small>Confirmed / completed</small>
          </article>

          <article className="admin-travel-total-card">
            <span>Pending</span>
            <strong>{stats.pending}</strong>
            <small>Awaiting confirmation</small>
          </article>

          <article className="admin-travel-total-card admin-travel-cancelled-card">
      <span>Cancelled</span>
      <strong>{stats.cancelled}</strong>
      <small>Cancelled bookings</small>
    </article>
        </div>
      </section>

      <section className="admin-panel-section">
        <div className="admin-section-heading">
          <div>
            <h2>Category-wise Travel Bookings</h2>
            <p>
              Each category shows the number of bookings and their total
              amount for the selected travel date.
            </p>
          </div>

          <span className="admin-count-badge">
            {stats.total} bookings
          </span>
        </div>

        <div className="admin-category-grid">
          {TYPES.map((type) => {
            const item = stats.types[type];

            return (
              <article
                className={`admin-category-card ${type}`}
                key={type}
              >
                <span className="admin-category-name">
                  {TYPE_LABELS[type]}
                </span>

                <strong className="admin-category-count">
                  {item.count}
                </strong>

                <span className="admin-category-caption">
                  {item.count === 1 ? "Booking" : "Bookings"}
                </span>

                <span className="admin-category-amount">
                  {money(item.amount)}
                </span>

                <span className="admin-category-amount-caption">
                  Total amount
                </span>
              </article>
            );
          })}
        </div>
      </section>

      <section className="admin-bookings-panel">
        <div className="admin-section-heading">
          <div>
            <h2>Bookings for Selected Date</h2>
            <p>
              Travel bookings scheduled for{" "}
              {formatDate(`${selectedDate}T12:00:00`)}.
            </p>
          </div>

          <span className="admin-count-badge">
            {stats.bookings.length} records
          </span>
        </div>

        {loading && stats.bookings.length === 0 ? (
          <EmptyState
            icon={RefreshCw}
            title="Loading bookings"
            description="Fetching records from the database."
            spinning
          />
        ) : stats.bookings.length === 0 ? (
          <EmptyState
            icon={FileSearch}
            title="No travel bookings for this date"
            description="Choose Today, Tomorrow, or another calendar date to view its bookings."
          />
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-payment-table admin-bookings-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Booking</th>
                  <th>Travel Date</th>
                  <th>Amount</th>
                  <th>Booking Status</th>
                  <th>Payment</th>
                  <th>Details</th>
                </tr>
              </thead>

              <tbody>
                {stats.bookings.map((booking) => {
                  const customer =
                    booking.user && typeof booking.user === "object"
                      ? booking.user
                      : {};

                  const status = getBookingStatus(booking);

                  return (
                    <tr key={booking._id}>
                      <td>
                        <div className="admin-cell-copy">
                          <strong>{customer.name || "Customer"}</strong>
                          <span>
                            {booking.bookingReference || booking._id}
                          </span>
                          <span>{customer.email || "No email"}</span>
                          <span>{customer.phone || "No phone"}</span>
                        </div>
                      </td>

                      <td>
                        <div className="admin-cell-copy">
                          <strong>
                            {booking.title || "Travel Booking"}
                          </strong>
                          <span className="admin-type-label">
                            {TYPE_LABELS[booking.type] ||
                              booking.type ||
                              "Travel"}
                          </span>
                          <span>
                            {booking.destination || "Destination not set"}
                          </span>
                        </div>
                      </td>

                      <td>
                        <div className="admin-date-copy">
                          <CalendarDays size={15} />
                          {formatDate(booking.travelDate)}
                        </div>
                      </td>

                      <td>
                        <strong className="admin-amount">
                          {money(booking.amount)}
                        </strong>
                      </td>

                      <td>
                        <span
                          className={`admin-status-pill status-${status}`}
                        >
                          {status === "confirmed" ? (
                            <CheckCircle size={13} />
                          ) : status === "cancelled" ||
                            status === "rejected" ? (
                            <XCircle size={13} />
                          ) : (
                            <Clock size={13} />
                          )}
                          {status.charAt(0).toUpperCase() +
                            status.slice(1)}
                        </span>
                      </td>

                      <td>
                        <span className="admin-payment-label">
                          {getPaymentLabel(booking)}
                        </span>

                        {booking.paymentScreenshot && (
                          <button
                            type="button"
                            className="admin-view-screenshot"
                            onClick={() => {
                              // The screenshot modal is available from the
                              // dashboard/payment section.
                              onViewBooking(booking);
                            }}
                          >
                            <Eye size={14} />
                            View Details
                          </button>
                        )}
                      </td>

                      <td>
                        <button
                          type="button"
                          className="admin-details-btn"
                          onClick={() => onViewBooking(booking)}
                        >
                          <Eye size={15} />
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function NavButton({ active, onClick, icon: Icon, label, count }) {
  return (
    <button
      type="button"
      className={`admin-nav-item ${active ? "active" : ""}`}
      onClick={onClick}
    >
      <Icon size={18} />
      <span>{label}</span>

      {count > 0 && (
        <span className="admin-nav-count">{count}</span>
      )}

      {label === "Booking Management" && (
        <ChevronRight size={15} className="admin-nav-chevron" />
      )}
    </button>
  );
}

function PageHeading({
  eyebrow,
  title,
  description,
  onRefresh,
  loading,
}) {
  return (
    <div className="admin-page-heading">
      <div>
        <span className="admin-eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>

      <button
        type="button"
        className="admin-refresh-btn"
        onClick={onRefresh}
        disabled={loading}
      >
        <RefreshCw
          size={16}
          className={loading ? "admin-spin" : ""}
        />
        Refresh
      </button>
    </div>
  );
}

function BookingOverview({ stats }) {
  return (
    <section className="admin-overview-section">
      <div className="admin-booking-summary">
        <SummaryCard
          title="Total Bookings"
          value={stats.total}
          subtitle="All booking records"
          tone="blue"
        />
        <SummaryCard
          title="Total Booking Amount"
          value={money(stats.amount)}
          subtitle="Amount across all bookings"
          tone="purple"
        />
        <SummaryCard
          title="Confirmed"
          value={stats.confirmed}
          subtitle="Confirmed / completed"
          tone="green"
        />
        <SummaryCard
          title="Cancelled"
          value={stats.cancelled}
          subtitle="Cancelled bookings"
          tone="red"
        />
      </div>

      <div className="admin-category-grid">
        {TYPES.map((type) => {
          const item = stats.types[type];

          return (
            <div className={`admin-category-card ${type}`} key={type}>
              <span className="admin-category-name">
                {TYPE_LABELS[type]}
              </span>
              <strong className="admin-category-count">
                {item.count}
              </strong>
              <span className="admin-category-caption">Bookings</span>
              <span className="admin-category-amount">
                {money(item.amount)}
              </span>
              <span className="admin-category-amount-caption">
                Total amount
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function SummaryCard({ title, value, subtitle, tone }) {
  return (
    <article className={`admin-summary-card ${tone}`}>
      <span className="admin-summary-title">{title}</span>
      <strong>{value}</strong>
      <small>{subtitle}</small>
    </article>
  );
}

function BookingsTable({
  bookings,
  totalFiltered,
  totalBookings,
  loading,
  searchTerm,
  setSearchTerm,
  typeFilter,
  setTypeFilter,
  statusFilter,
  setStatusFilter,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  resetFilters,
  showAllBookings,
  setShowAllBookings,
  onRefresh,
  onCopy,
  onScreenshot,
  screenshotLoading,
  selectedImage,
  setSelectedBooking,
}) {
  return (
    <section className="admin-bookings-panel">
      <div className="admin-section-heading">
        <div>
          <h2>All Bookings</h2>
          <p>Search, filter and inspect customer bookings.</p>
        </div>
        <span className="admin-count-badge">
          {totalFiltered} results
        </span>
      </div>

      <div className="admin-booking-filters">
        <label className="admin-search-field">
          <Search size={17} />
          <input
            type="search"
            placeholder="Search reference, name, email or mobile..."
            value={searchTerm}
            onChange={(event) => {
              setSearchTerm(event.target.value);
              setShowAllBookings(false);
            }}
          />

          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              aria-label="Clear search"
            >
              <X size={15} />
            </button>
          )}
        </label>

        <select
          value={typeFilter}
          onChange={(event) => {
            setTypeFilter(event.target.value);
            setShowAllBookings(false);
          }}
          aria-label="Booking type"
        >
          <option value="all">All types</option>
          {TYPES.map((type) => (
            <option value={type} key={type}>
              {TYPE_LABELS[type]}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(event) => {
            setStatusFilter(event.target.value);
            setShowAllBookings(false);
          }}
          aria-label="Booking status"
        >
          <option value="all">All statuses</option>
          <option value="confirmed">Confirmed</option>
          <option value="pending">Pending</option>
          <option value="cancelled">Cancelled</option>
          <option value="rejected">Rejected</option>
        </select>

        <label className="admin-date-field">
          <span>From</span>
          <input
            type="date"
            value={startDate}
            max={endDate || undefined}
            onChange={(event) => {
              setStartDate(event.target.value);
              setShowAllBookings(false);
            }}
          />
        </label>

        <label className="admin-date-field">
          <span>To</span>
          <input
            type="date"
            value={endDate}
            min={startDate || undefined}
            onChange={(event) => {
              setEndDate(event.target.value);
              setShowAllBookings(false);
            }}
          />
        </label>

        <button
          type="button"
          className="admin-reset-btn"
          onClick={resetFilters}
        >
          Reset
        </button>
      </div>

      {loading && bookings.length === 0 ? (
        <EmptyState
          icon={RefreshCw}
          title="Loading bookings"
          description="Fetching records from the database."
          spinning
        />
      ) : bookings.length === 0 ? (
        <EmptyState
          icon={FileSearch}
          title="No bookings found"
          description="Try changing the search or filter options."
        />
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-payment-table admin-bookings-table">
            <thead>
              <tr>
                <th>Customer / Reference</th>
                <th>Booking</th>
                <th>Travel Date</th>
                <th>Amount</th>
                <th>Booking Status</th>
                <th>Payment</th>
                <th>Details</th>
              </tr>
            </thead>

            <tbody>
              {bookings.map((booking) => {
                const customer =
                  booking.user && typeof booking.user === "object"
                    ? booking.user
                    : {};

                const status = getBookingStatus(booking);
                const reference =
                  booking.bookingReference || booking._id;

                return (
                  <tr key={booking._id}>
                    <td>
                      <div className="admin-cell-copy">
                        <strong>{customer.name || "Customer"}</strong>
                        <span className="admin-reference-line">
                          {reference}
                          <button
                            type="button"
                            onClick={() => onCopy(reference)}
                            title="Copy reference"
                            aria-label="Copy reference"
                          >
                            <Copy size={13} />
                          </button>
                        </span>
                        <span>{customer.email || "No email"}</span>
                        <span>{customer.phone || "No phone"}</span>
                      </div>
                    </td>

                    <td>
                      <div className="admin-cell-copy">
                        <strong>
                          {booking.title || "Travel Booking"}
                        </strong>
                        <span className="admin-type-label">
                          {TYPE_LABELS[booking.type] ||
                            booking.type ||
                            "Travel"}
                        </span>
                        <span>
                          {booking.destination || "Destination not set"}
                        </span>
                      </div>
                    </td>

                    <td>
                      <div className="admin-date-copy">
                        <CalendarDays size={15} />
                        {formatDate(booking.travelDate)}
                      </div>
                    </td>

                    <td>
                      <strong className="admin-amount">
                        {money(booking.amount)}
                      </strong>
                    </td>

                    <td>
                      <span
                        className={`admin-status-pill status-${status}`}
                      >
                        {status === "confirmed" ? (
                          <CheckCircle size={13} />
                        ) : status === "cancelled" ||
                          status === "rejected" ? (
                          <XCircle size={13} />
                        ) : (
                          <Clock size={13} />
                        )}
                        {status.charAt(0).toUpperCase() +
                          status.slice(1)}
                      </span>
                    </td>

                    <td>
                      <span className="admin-payment-label">
                        {getPaymentLabel(booking)}
                      </span>

                      {booking.paymentScreenshot && (
                        <button
                          type="button"
                          className="admin-view-screenshot"
                          onClick={() =>
  onScreenshot(
    booking._id,
    booking.bookingReference || booking._id
  )
}
                        >
                          <Eye size={14} />
                          Screenshot
                        </button>
                      )}
                    </td>

                    <td>
                      <button
                        type="button"
                        className="admin-details-btn"
                        onClick={() => setSelectedBooking(booking)}
                      >
                        <Eye size={15} />
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="admin-table-footer">
        <span>
          Showing {bookings.length} of {totalFiltered} filtered bookings ·{" "}
          {totalBookings} total records
        </span>

        <div className="admin-table-footer-actions">
          {totalFiltered > 5 && (
            <button
              type="button"
              className="admin-see-more-btn"
              onClick={() =>
                setShowAllBookings((value) => !value)
              }
            >
              {showAllBookings
                ? "See Less"
                : `See More (${totalFiltered - 5} more)`}
              <ChevronRight
                size={15}
                className={showAllBookings ? "rotate-up" : ""}
              />
            </button>
          )}

          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
          >
            <RefreshCw
              size={14}
              className={loading ? "admin-spin" : ""}
            />
            Update records
          </button>
        </div>
      </div>
    </section>
  );
}


function PaymentRequestsTable({
  requests,
  loading,
  onRefresh,
  onDecision,
  processingId,
  onScreenshot,
  screenshotLoading,
  selectedImage,
  onCopy,
}) {
  const pending = requests.filter((booking) => {
    const paymentStatus = String(
      booking.paymentVerificationStatus || ""
    ).toLowerCase();

    return (
      Boolean(booking.paymentScreenshot) &&
      [
        "",
        "pending",
        "pending_verification",
      ].includes(paymentStatus)
    );
  });

  return (
    <section className="admin-payment-section">
      <div className="admin-list-toolbar">
        <div className="admin-list-label">
          <span className="admin-pending-dot" />
          <strong>Payment Requests</strong>
          <span className="admin-count-badge">
            {pending.length} requests
          </span>
        </div>

        <button
          type="button"
          className="admin-refresh-btn"
          onClick={onRefresh}
          disabled={loading}
        >
          <RefreshCw
            size={14}
            className={loading ? "admin-spin" : ""}
          />
          Refresh
        </button>
      </div>

      {loading && pending.length === 0 ? (
        <EmptyState
          icon={RefreshCw}
          title="Loading payment requests"
          description="Payment requests database se load ho rahi hain."
          spinning
        />
      ) : pending.length === 0 ? (
        <EmptyState
          icon={CheckCircle}
          title="No pending payment requests"
          description="Pending verification ke liye screenshot submit hone par request yahan dikhegi."
        />
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-payment-table">
            <thead>
              <tr>
                <th>Customer / Reference</th>
                <th>Booking Details</th>
                <th>Payment Proof</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {pending.map((booking) => {
                const customer =
                  booking.user &&
                  typeof booking.user === "object"
                    ? booking.user
                    : {};

                const reference =
                  booking.bookingReference || booking._id;

                const busy = processingId === booking._id;

                const bookingStatus = String(
                  booking.status || ""
                ).toLowerCase();

                const cancellationSource = String(
                  booking.cancellationSource || ""
                ).toLowerCase();

                const customerCancelled =
                  ["cancelled", "canceled"].includes(
                    bookingStatus
                  ) && cancellationSource === "customer";

                const adminCancelled =
                  ["cancelled", "canceled"].includes(
                    bookingStatus
                  ) && cancellationSource === "admin";

                return (
                  <tr key={booking._id}>
                    <td>
                      <div className="admin-cell-copy">
                        <strong>
                          {customer.name || "Customer"}
                        </strong>

                        <span className="admin-reference-line">
                          {reference}
                          <button
                            type="button"
                            onClick={() => onCopy(reference)}
                            aria-label="Copy booking reference"
                            title="Copy reference"
                          >
                            <Copy size={13} />
                          </button>
                        </span>

                        <span>{customer.email || "—"}</span>
                        <span>{customer.phone || "—"}</span>
                      </div>
                    </td>

                    <td>
                      <div className="admin-cell-copy">
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
                          Travel: {formatDate(booking.travelDate)}
                        </span>

                        {customerCancelled && (
                          <span className="admin-cancellation-info">
                            Cancelled by customer
                            {booking.cancellationDate
                              ? ` — ${formatDate(
                                  booking.cancellationDate
                                )}`
                              : ""}
                          </span>
                        )}

                        {adminCancelled && (
                          <span className="admin-cancellation-info">
                            Cancelled by admin
                            {booking.cancellationDate
                              ? ` — ${formatDate(
                                  booking.cancellationDate
                                )}`
                              : ""}
                          </span>
                        )}
                      </div>
                    </td>

                    <td>
                      <button
                        type="button"
                        className="admin-view-screenshot"
                        onClick={() =>
                          onScreenshot(
                            booking._id,
                            reference
                          )
                        }
                        disabled={
                          screenshotLoading &&
                          selectedImage === booking._id
                        }
                      >
                        <Eye size={15} />
                        {screenshotLoading &&
                        selectedImage === booking._id
                          ? "Loading..."
                          : "View Screenshot"}
                      </button>
                    </td>

                    <td>
                      <strong className="admin-amount">
                        {money(booking.amount)}
                      </strong>
                    </td>

                    <td>
                      {customerCancelled ? (
                        <span className="admin-status-pill status-cancelled">
                          <XCircle size={13} />
                          Customer Cancelled
                        </span>
                      ) : adminCancelled ? (
                        <span className="admin-status-pill status-cancelled">
                          <XCircle size={13} />
                          Admin Cancelled
                        </span>
                      ) : (
                        <span className="admin-status-pill status-pending">
                          <Clock size={13} />
                          Pending Verification
                        </span>
                      )}
                    </td>

                    <td>
                      {/* Cancelled bookings ke liye bhi
                          Accept aur Reject visible rahenge. */}
                      <div className="admin-row-actions">
                        <button
                          type="button"
                          className="admin-row-approve"
                          disabled={busy}
                          onClick={() =>
                            onDecision(booking._id, "approve")
                          }
                        >
                          {busy ? (
                            <RefreshCw
                              size={14}
                              className="admin-spin"
                            />
                          ) : (
                            <CheckCircle size={14} />
                          )}
                          Accept
                        </button>

                        <button
                          type="button"
                          className="admin-row-reject"
                          disabled={busy}
                          onClick={() =>
                            onDecision(booking._id, "reject")
                          }
                        >
                          {busy ? (
                            <RefreshCw
                              size={14}
                              className="admin-spin"
                            />
                          ) : (
                            <XCircle size={14} />
                          )}
                          Reject
                        </button>
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
  );
}



function Detail({ label, value }) {
  return (
    <div className="admin-detail-item">
      <span>{label}</span>
      <strong>{value || "—"}</strong>
    </div>
  );
}

function Notice({ message, type = "success" }) {
  return (
    <div
      className={
        type === "error"
          ? "admin-error-message"
          : "admin-success-message"
      }
      role={type === "error" ? "alert" : "status"}
    >
      {type === "error" ? (
        <XCircle size={17} />
      ) : (
        <CheckCircle size={17} />
      )}
      <span>{message}</span>
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
  spinning = false,
}) {
  return (
    <div className="admin-empty-state">
      <Icon
        size={29}
        className={spinning ? "admin-spin" : ""}
      />
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}


export default AdminDashboard;
