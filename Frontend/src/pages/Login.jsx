import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { apiRequest } from "../api/api";
import "./Auth.css";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((previous) => ({
      ...previous,
      [e.target.name]: e.target.value,
    }));

    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const email = formData.email.trim();
    const password = formData.password;

    if (!email || !password) {
      setError("Please enter email and password.");
      return;
    }

    try {
      setIsLoading(true);

      // Login API: call only once.
      await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email,
          password,
        }),
      });

      // Open the originally requested page when available.
      // Otherwise, open the Profile page.
      const requestedPath = location.state?.from;

      const safePath =
        typeof requestedPath === "string" &&
        requestedPath.startsWith("/") &&
        !requestedPath.startsWith("//")
          ? requestedPath
          : "/profile";

      navigate(safePath, { replace: true });
    } catch (err) {
      setError(
        err.message || "Unable to sign in. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* LEFT PANEL */}
        <div className="auth-brand-panel">
          <div className="auth-brand-content">
            <div className="auth-logo">MK</div>

            <span className="auth-label">MK TRAVELS</span>

            <h1>
              Your journey
              <br />
              starts here.
            </h1>

            <p>
              Sign in to manage your trips,
              bookings and travel preferences
              in one place.
            </p>

            <div className="auth-benefits">
              <div>
                <ShieldCheck size={19} />
                <span>Secure booking management</span>
              </div>

              <div>
                <UserRound size={19} />
                <span>Personalized travel profile</span>
              </div>

              <div>
                <ArrowRight size={19} />
                <span>Easy access to your trips</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="auth-form-panel">
          <div className="auth-form-wrapper">
            <div className="auth-mobile-logo">
              <div className="auth-logo">MK</div>
              <strong>MK TRAVELS</strong>
            </div>

            <div className="auth-heading">
              <span>WELCOME BACK</span>
              <h2>Sign in to your account</h2>
              <p>
                Access your bookings and manage your trips.
              </p>
            </div>

            {error && (
              <div className="auth-error" role="alert">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="auth-field">
                <label htmlFor="login-email">
                  Email Address
                </label>

                <div className="auth-input">
                  <Mail size={18} />

                  <input
                    id="login-email"
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

              <div className="auth-field">
                <div className="auth-label-row">
                  <label htmlFor="login-password">
                    Password
                  </label>

                  <button
                    type="button"
                    className="forgot-btn"
                    onClick={() =>
                      setError(
                        "Password reset has not been implemented yet."
                      )
                    }
                  >
                    Forgot password?
                  </button>
                </div>

                <div className="auth-input">
                  <Lock size={18} />

                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="current-password"
                    maxLength={128}
                    required
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
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

              <button
                type="submit"
                className="auth-submit"
                disabled={isLoading}
              >
                {isLoading ? "Signing In..." : "Sign In"}
                {!isLoading && <ArrowRight size={18} />}
              </button>
            </form>

            <div className="auth-divider">
              <span>Don't have an account?</span>
            </div>

            <Link to="/signup" className="auth-secondary-btn">
              Create New Account
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

export default Login;