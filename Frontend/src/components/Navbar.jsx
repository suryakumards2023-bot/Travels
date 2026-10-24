import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  User,
  Menu,
  LogOut,
  ChevronDown,
  CalendarCheck,
  LayoutDashboard,
  Settings,
  Bell,
  Wallet,
  MessageSquare,
  Mail,
  Phone,
  X,
  Globe,
} from "lucide-react";
import {
  FaFacebookF,
  FaInstagram,
  FaWhatsapp,
  FaYoutube,
} from "react-icons/fa";

import { apiRequest } from "../api/api";
import "./Navbar.css";

function Navbar() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");

  const location = useLocation();
  const navigate = useNavigate();

  const isAdmin = user?.role === "admin";
  const displayName = user?.name || "My Account";

  const initials = displayName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();

  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    let active = true;

    async function loadUser() {
      try {
        const response = await apiRequest("/auth/me");
        const currentUser = response?.user || response;

        if (active) {
          setUser(currentUser?.role ? currentUser : null);
        }
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
  }, [location.pathname]);

  useEffect(() => {
    setMenuOpen(false);
    setAccountOpen(false);
    setLogoutError("");
  }, [location.pathname]);

  useEffect(() => {
    if (!menuOpen && !accountOpen) return;

    function handleOutsideClick(event) {
      if (
        menuOpen &&
        !event.target.closest(".mobile-drawer") &&
        !event.target.closest(".menu-button")
      ) {
        setMenuOpen(false);
      }

      if (
        accountOpen &&
        !event.target.closest(".account-wrapper")
      ) {
        setAccountOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setAccountOpen(false);
      }
    }

    document.addEventListener("click", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("click", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [menuOpen, accountOpen]);

  function closeMenus() {
    setMenuOpen(false);
    setAccountOpen(false);
    setLogoutError("");
  }

  async function handleLogout() {
    if (loggingOut) return;

    setLoggingOut(true);
    setLogoutError("");

    try {
      await apiRequest("/auth/logout", { method: "POST" });

      setUser(null);
      closeMenus();
      navigate("/login", { replace: true });
    } catch (error) {
      setLogoutError(
        error.message || "Logout nahi ho paya. Dobara try karein."
      );
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <header className="navbar">
      <div className="navbar-container">
        {/* Mobile menu button */}
        <button
          type="button"
          className="menu-button"
          aria-label="Open navigation menu"
          aria-expanded={menuOpen}
          aria-controls="mobile-drawer"
          onClick={() => {
            setMenuOpen((open) => !open);
            setAccountOpen(false);
          }}
        >
          <Menu size={22} />
        </button>

        {/* Logo */}
        <Link to="/" className="logo" onClick={closeMenus}>
          <span className="logo-mark">MK</span>
          <span className="logo-text">
           <span>Travels</span>
          </span>
        </Link>

        {/* Desktop navigation */}
        <nav className="nav-links desktop-nav" aria-label="Main navigation">
          <Link
            to="/"
            className={isActive("/") ? "nav-link active" : "nav-link"}
          >
            Home
          </Link>

          <Link
            to="/tours"
            className={isActive("/tours") ? "nav-link active" : "nav-link"}
          >
            Tours
          </Link>

          <Link
            to="/search"
            className={isActive("/search") ? "nav-link active" : "nav-link"}
          >
            Search
          </Link>

          <Link
            to="/my-bookings"
            className={
              isActive("/my-bookings") ? "nav-link active" : "nav-link"
            }
          >
            My Bookings
          </Link>

          {isAdmin && (
            <Link
              to="/admin"
              className={
                isActive("/admin")
                  ? "nav-link active admin-link"
                  : "nav-link admin-link"
              }
            >
              Dashboard
            </Link>
          )}
        </nav>

        {/* Right-side account area */}
        <div className="navbar-account">
          {!authLoading && user && (
            <button
              type="button"
              className="navbar-notification"
              aria-label="Open bookings or dashboard"
              title="Notifications"
              onClick={() =>
                navigate(isAdmin ? "/admin" : "/my-bookings")
              }
            >
              <Bell size={20} />
              <span className="notification-dot" />
            </button>
          )}

          {authLoading ? (
            <span className="account-loading" aria-label="Loading account">
              ...
            </span>
          ) : !user ? (
            <div className="guest-actions">
              <Link to="/login" className="login-btn">
                Login
              </Link>
            </div>
          ) : (
            <div className="account-wrapper">
              <button
                type="button"
                className="account-trigger"
                onClick={() => {
                  setAccountOpen((open) => !open);
                  setMenuOpen(false);
                  setLogoutError("");
                }}
                aria-label="Open profile menu"
                aria-expanded={accountOpen}
                aria-haspopup="true"
              >
                <span className="account-avatar">
                  {user.profilePhoto ? (
                    <img
                      src={user.profilePhoto}
                      alt=""
                      className="account-avatar-image"
                    />
                  ) : (
                    <span className="account-avatar-initials">
                      {initials || <User size={19} />}
                    </span>
                  )}
                </span>

                <span className="account-summary">
                  <strong>{displayName}</strong>
                  <small>{isAdmin ? "Administrator" : "Customer"}</small>
                </span>

                <ChevronDown
                  size={15}
                  className="account-chevron"
                  aria-hidden="true"
                />
              </button>

              {accountOpen && (
                <div className="account-dropdown">
                  <div className="account-dropdown-header">
                    <div className="dropdown-user-avatar">
                      {user.profilePhoto ? (
                        <img src={user.profilePhoto} alt="" />
                      ) : (
                        <span>{initials || "U"}</span>
                      )}
                    </div>

                    <div className="dropdown-user-info">
                      <strong>{displayName}</strong>
                      <span>{user.email || ""}</span>
                      <small className="dropdown-role">
                        {isAdmin ? "Administrator" : "Customer"}
                      </small>
                    </div>
                  </div>

                  <div className="dropdown-divider" />

                  <Link
                    to="/profile"
                    className="dropdown-link"
                    onClick={closeMenus}
                  >
                    <User size={17} />
                    <span>My Profile</span>
                  </Link>

                  <Link
                    to="/my-bookings"
                    className="dropdown-link"
                    onClick={closeMenus}
                  >
                    <CalendarCheck size={17} />
                    <span>My Bookings</span>
                  </Link>

                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="dropdown-link"
                      onClick={closeMenus}
                    >
                      <LayoutDashboard size={17} />
                      <span>Admin Dashboard</span>
                    </Link>
                  )}

                  <Link
                    to="/profile"
                    className="dropdown-link"
                    onClick={closeMenus}
                  >
                    <Settings size={17} />
                    <span>Account Settings</span>
                  </Link>

                  {logoutError && (
                    <p className="logout-error" role="alert">
                      {logoutError}
                    </p>
                  )}

                  <button
                    type="button"
                    className="dropdown-logout"
                    onClick={handleLogout}
                    disabled={loggingOut}
                  >
                    <LogOut size={17} />
                    {loggingOut ? "Logging out..." : "Logout"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile side panel */}
      {menuOpen && (
        <>
          <button
            type="button"
            className="drawer-backdrop"
            aria-label="Close navigation menu"
            onClick={() => setMenuOpen(false)}
          />

          <aside
            id="mobile-drawer"
            className="mobile-drawer"
            aria-label="Mobile navigation"
          >
            <div className="drawer-header">
              <div className="drawer-brand">
                <span className="logo-mark">MK</span>
                <span className="logo-text">MK Travels</span>
              </div>

              <button
                type="button"
                className="drawer-close-button"
                aria-label="Close menu"
                onClick={() => setMenuOpen(false)}
              >
                <X size={19} />
              </button>
            </div>

            {user && (
              <button
                type="button"
                className="drawer-profile"
                onClick={() => {
                  closeMenus();
                  navigate("/profile");
                }}
              >
                <span className="account-avatar">
                  {user.profilePhoto ? (
                    <img src={user.profilePhoto} alt="" />
                  ) : (
                    <span className="account-avatar-initials">
                      {initials || <User size={18} />}
                    </span>
                  )}
                </span>

                <span className="drawer-profile-info">
                  <strong>{displayName}</strong>
                  <small>{isAdmin ? "Administrator" : "Customer"}</small>
                </span>
                <ChevronDown size={16} />
              </button>
            )}

            <p className="drawer-section-label">MENU</p>

            <nav className="drawer-nav">
              <Link
                to="/"
                className={isActive("/") ? "drawer-link active" : "drawer-link"}
                onClick={closeMenus}
              >
                <LayoutDashboard size={18} />
                <span>Home</span>
              </Link>

              <Link
                to="/tours"
                className={
                  isActive("/tours") ? "drawer-link active" : "drawer-link"
                }
                onClick={closeMenus}
              >
                <CalendarCheck size={18} />
                <span>Explore Tours</span>
              </Link>

              <Link
                to="/search"
                className={
                  isActive("/search") ? "drawer-link active" : "drawer-link"
                }
                onClick={closeMenus}
              >
                <Globe size={18} />
                <span>Search Trips</span>
              </Link>

              <Link
                to="/my-bookings"
                className={
                  isActive("/my-bookings")
                    ? "drawer-link active"
                    : "drawer-link"
                }
                onClick={closeMenus}
              >
                <CalendarCheck size={18} />
                <span>My Bookings</span>
              </Link>

              {isAdmin && (
                <Link
                  to="/admin"
                  className={
                    isActive("/admin")
                      ? "drawer-link active"
                      : "drawer-link"
                  }
                  onClick={closeMenus}
                >
                  <LayoutDashboard size={18} />
                  <span>Admin Dashboard</span>
                </Link>
              )}
            </nav>

            <p className="drawer-section-label">HELP & SUPPORT</p>

            <nav className="drawer-nav">
              <Link
                to="/my-bookings"
                className="drawer-link"
                onClick={closeMenus}
              >
                <Wallet size={18} />
                <span>Refunds & Cancellations</span>
              </Link>

              <Link
                to="/profile"
                className="drawer-link"
                onClick={closeMenus}
              >
                <MessageSquare size={18} />
                <span>Complaint / Feedback</span>
              </Link>

              <a
                href="mailto:mktravelsbihar@gmil.com?subject=MK%20Travels%20Support"
                className="drawer-link"
                onClick={closeMenus}
              >
                <Mail size={18} />
                <span>Email Support</span>
              </a>

              <a
                href="tel:+910000000000"
                className="drawer-link"
                onClick={closeMenus}
              >
                <Phone size={18} />
                <span>Call Support</span>
              </a>
            </nav>

            <div className="drawer-social-section">
  <h3>Follow Us</h3>

  <div className="drawer-social-icons">
    <a
      href="https://www.facebook.com/"
      target="_blank"
      rel="noopener noreferrer"
      className="drawer-social-link facebook"
      aria-label="Facebook"
    >
      <FaFacebookF />
    </a>

    <a
      href="https://www.instagram.com/"
      target="_blank"
      rel="noopener noreferrer"
      className="drawer-social-link instagram"
      aria-label="Instagram"
    >
      <FaInstagram />
    </a>

    <a
      href="https://wa.me/"
      target="_blank"
      rel="noopener noreferrer"
      className="drawer-social-link whatsapp"
      aria-label="WhatsApp"
    >
      <FaWhatsapp />
    </a>

    <a
      href="https://www.youtube.com/"
      target="_blank"
      rel="noopener noreferrer"
      className="drawer-social-link youtube"
      aria-label="YouTube"
    >
      <FaYoutube />
    </a>
  </div>
</div>

            <div className="drawer-bottom">
              {!authLoading && !user && (
                <Link
                  to="/login"
                  className="drawer-login"
                  onClick={closeMenus}
                >
                  <User size={17} />
                  Login
                </Link>
              )}

              {user && (
                <button
                  type="button"
                  className="drawer-logout"
                  onClick={handleLogout}
                  disabled={loggingOut}
                >
                  <LogOut size={17} />
                  {loggingOut ? "Logging out..." : "Logout"}
                </button>
              )}

              <small>Thank you for travelling with MK Travels</small>
            </div>
          </aside>
        </>
      )}
    </header>
  );
}

export default Navbar;