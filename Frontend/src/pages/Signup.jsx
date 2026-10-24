
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Phone,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { apiRequest } from "../api/api";
import "./Auth.css";

const Signup = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Mobile field accepts digits only, with a maximum of 10.
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "phone") {
      const digitsOnly = value.replace(/\D/g, "").slice(0, 10);

      setFormData((previous) => ({
        ...previous,
        phone: digitsOnly,
      }));
    } else {
      setFormData((previous) => ({
        ...previous,
        [name]: value,
      }));
    }

    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const name = formData.name.trim();
    const email = formData.email.trim().toLowerCase();
    const phone = formData.phone;
    const { password, confirmPassword } = formData;

    if (!name || !email || !phone || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (name.length < 2 || name.length > 80) {
      setError("Name must be between 2 and 80 characters.");
      return;
    }

    // Indian mobile numbers: 10 digits, starting with 6, 7, 8 or 9.
    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError(
        "Enter a valid 10-digit Indian mobile number starting with 6, 7, 8 or 9."
      );
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 8 || password.length > 128) {
      setError("Password must be between 8 and 128 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setIsLoading(true);

      await apiRequest("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          name,
          email,
          phone,
          password,
        }),
      });

      // Account created successfully: send user to Login page.
      navigate("/login", {
        replace: true,
        state: { signupSuccess: true, email },
      });
    } catch (err) {
      setError(
        err.message ||
          "Unable to create your account. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* LEFT */}
        <div className="auth-brand-panel">
          <div className="auth-brand-content">
            <div className="auth-logo">MK</div>

            <span className="auth-label">MK TRAVELS</span>

            <h1>
              Travel more.
              <br />
              Remember more.
            </h1>

            <p>
              Create your account and keep
              all your journeys together.
            </p>

            <div className="auth-benefits">
              <div>
                <ShieldCheck size={19} />
                <span>Safe &amp; secure account</span>
              </div>

              <div>
                <UserRound size={19} />
                <span>Manage traveller details</span>
              </div>

              <div>
                <ArrowRight size={19} />
                <span>Track all your bookings</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="auth-form-panel">
          <div className="auth-form-wrapper">
            <div className="auth-mobile-logo">
              <div className="auth-logo">MK</div>
              <strong>MK TRAVELS</strong>
            </div>

            <div className="auth-heading">
              <span>JOIN MK TRAVELS</span>
              <h2>Create your account</h2>
              <p>
                Start planning your next unforgettable journey.
              </p>
            </div>

            {error && (
              <div className="auth-error" role="alert">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
              {/* NAME */}
              <div className="auth-field">
                <label htmlFor="signup-name">Full Name</label>

                <div className="auth-input">
                  <UserRound size={18} />

                  <input
                    id="signup-name"
                    type="text"
                    name="name"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleChange}
                    autoComplete="name"
                    maxLength={80}
                    required
                  />
                </div>
              </div>

              {/* EMAIL */}
              <div className="auth-field">
                <label htmlFor="signup-email">Email Address</label>

                <div className="auth-input">
                  <Mail size={18} />

                  <input
                    id="signup-email"
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    autoComplete="email"
                    maxLength={254}
                    required
                  />
                </div>
              </div>

              {/* PHONE */}
              <div className="auth-field">
                <label htmlFor="signup-phone">Mobile Number</label>

                <div className="auth-input">
                  <Phone size={18} />

                  <input
                    id="signup-phone"
                    type="tel"
                    name="phone"
                    placeholder="Enter 10-digit mobile number"
                    value={formData.phone}
                    onChange={handleChange}
                    onKeyDown={(e) => {
                      if (
                        e.ctrlKey ||
                        e.metaKey ||
                        e.altKey ||
                        [
                          "Backspace",
                          "Delete",
                          "Tab",
                          "ArrowLeft",
                          "ArrowRight",
                          "Home",
                          "End",
                          "Enter",
                        ].includes(e.key)
                      ) {
                        return;
                      }

                      if (!/^\d$/.test(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    inputMode="numeric"
                    pattern="[6-9][0-9]{9}"
                    autoComplete="tel-national"
                    maxLength={10}
                    required
                  />
                </div>

                <small className="signup-phone-hint">
                  Enter 10 digits, starting with 6, 7, 8 or 9.
                </small>
              </div>

              {/* PASSWORD */}
              <div className="auth-field">
                <label htmlFor="signup-password">Password</label>

                <div className="auth-input">
                  <Lock size={18} />

                  <input
                    id="signup-password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Minimum 8 characters"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="new-password"
                    minLength={8}
                    maxLength={128}
                    required
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    onClick={() =>
                      setShowPassword((previous) => !previous)
                    }
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              {/* CONFIRM PASSWORD */}
              <div className="auth-field">
                <label htmlFor="signup-confirm-password">
                  Confirm Password
                </label>

                <div className="auth-input">
                  <Lock size={18} />

                  <input
                    id="signup-confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Re-enter your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    autoComplete="new-password"
                    maxLength={128}
                    required
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    aria-label={
                      showConfirmPassword
                        ? "Hide confirm password"
                        : "Show confirm password"
                    }
                    onClick={() =>
                      setShowConfirmPassword((previous) => !previous)
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="auth-submit"
                disabled={isLoading}
              >
                {isLoading ? "Creating Account..." : "Create Account"}
                {!isLoading && <ArrowRight size={18} />}
              </button>
            </form>

            <div className="auth-divider">
              <span>Already have an account?</span>
            </div>

            <Link to="/login" className="auth-secondary-btn">
              Sign In
            </Link>

            <Link to="/" className="auth-home-link">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
