
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  UserRound,
  Mail,
  Phone,
  MapPin,
  CalendarDays,
  Camera,
  Pencil,
  Save,
  X,
  LogOut,
  Ticket,
  ShieldCheck,
  MapPinned,
  LoaderCircle,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import { apiRequest } from "../api/api";
import "./Profile.css";

const initialForm = {
  name: "",
  email: "",
  phone: "",
  address: "",
  state: "",
  city: "",
  pincode: "",
  townVillage: "",
};

function Profile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState(initialForm);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [photo, setPhoto] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      try {
        const response = await apiRequest("/auth/me");
        const profile = response.user || response;

        if (!active) return;

        setUser(profile);
        setPhoto(profile.profilePhoto || "");
        setFormData({
          name: profile.name || "",
          email: profile.email || "",
          phone: profile.phone || "",
          address: profile.address || "",
          state: profile.state || "",
          city: profile.city || "",
          pincode: profile.pincode || "",
          townVillage: profile.townVillage || "",
        });
      } catch (err) {
        if (active) {
          if (err.status === 401) {
            navigate("/login");
          } else {
            setError(err.message || "Profile load nahi ho paya.");
          }
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadProfile();

    return () => {
      active = false;
    };
  }, [navigate]);

  useEffect(() => {
    if (!success && !error) return;

    const timer = setTimeout(() => {
      setSuccess("");
      setError("");
    }, 3000);

    return () => clearTimeout(timer);
  }, [success, error]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: name === "phone" || name === "pincode"
        ? value.replace(/\D/g, "")
        : value,
    }));
  };

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)) {
      setError("JPG, PNG, WEBP ya GIF image select karo.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("Profile photo 2 MB se chhoti honi chahiye.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setPhoto(reader.result);
      setError("");
    };

    reader.onerror = () => setError("Photo read nahi ho payi.");
    reader.readAsDataURL(file);
  };

  const handleEdit = () => {
    setError("");
    setSuccess("");
    setEditing(true);
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      address: user?.address || "",
      state: user?.state || "",
      city: user?.city || "",
      pincode: user?.pincode || "",
      townVillage: user?.townVillage || "",
    });

    setPhoto(user?.profilePhoto || "");
    setEditing(false);
    setError("");
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.name.trim()) {
      setError("Apna naam enter karo.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      setError("Valid email address enter karo.");
      return;
    }

    if (formData.phone && !/^[6-9]\d{9}$/.test(formData.phone)) {
      setError("Valid 10-digit Indian mobile number enter karo.");
      return;
    }

    if (formData.pincode && !/^\d{6}$/.test(formData.pincode)) {
      setError("PIN code 6 digits ka hona chahiye.");
      return;
    }

    setSaving(true);

    try {
      const response = await apiRequest("/auth/profile", {
        method: "PUT",
        body: JSON.stringify({
          ...formData,
          name: formData.name.trim(),
          email: formData.email.trim(),
          profilePhoto: photo,
        }),
      });

      const updatedUser = response.user || {
        ...user,
        ...formData,
        profilePhoto: photo,
      };

      setUser(updatedUser);
      setPhoto(updatedUser.profilePhoto || photo);
      setFormData((previous) => ({
        ...previous,
        ...updatedUser,
      }));
      setEditing(false);
      setSuccess("Profile successfully update ho gayi!");
    } catch (err) {
      setError(err.message || "Profile update nahi ho payi.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    setError("");

    try {
      await apiRequest("/auth/logout", { method: "POST" });
      navigate("/login", { replace: true });
    } catch (err) {
      setError(err.message || "Logout nahi ho paya. Dobara try karo.");
      setLoggingOut(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <LoaderCircle className="profile-spinner" size={38} />
        <p>Loading your profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-loading">
        <UserRound size={42} />
        <h2>Profile load nahi ho payi</h2>
        <p>{error || "Please dobara login karke try karo."}</p>
        <Link to="/login" className="profile-primary-btn">
          Login
        </Link>
      </div>
    );
  }

  const displayName = user.name || "MK Travels User";
  const initials = displayName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-IN", {
        month: "long",
        year: "numeric",
      })
    : "MK Travels Member";

  return (
    <main className="profile-page">
      <div className="profile-container">
        <header className="profile-page-heading">
          <div>
            <span className="profile-eyebrow">YOUR ACCOUNT</span>
            <h1>My Profile</h1>
            <p>Manage your personal details and travel account.</p>
          </div>

          <Link to="/my-bookings" className="profile-heading-bookings">
            <Ticket size={18} />
            My Bookings
          </Link>
        </header>

        {success && (
          <div className="profile-alert profile-alert-success">
            <CheckCircle2 size={19} />
            {success}
          </div>
        )}

        {error && (
          <div className="profile-alert profile-alert-error">
            <AlertCircle size={19} />
            {error}
          </div>
        )}

        <div className="profile-layout">
          <aside className="profile-sidebar">
            <section className="profile-identity-card">
              <div className="profile-cover">
                <span className="profile-cover-orbit profile-orbit-one" />
                <span className="profile-cover-orbit profile-orbit-two" />
                <span className="profile-cover-plane">✈</span>
              </div>

              <div className="profile-avatar-wrap">
                <div className="profile-avatar">
                  {photo ? (
                    <img src={photo} alt="Profile" />
                  ) : (
                    <span>{initials}</span>
                  )}
                </div>

                {editing && (
                  <label
                    className="profile-camera-btn"
                    title="Change profile photo"
                  >
                    <Camera size={17} />
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={handlePhotoChange}
                    />
                  </label>
                )}
              </div>

              <div className="profile-identity-content">
                <h2>{displayName}</h2>
                <p className="profile-identity-email">{user.email}</p>

                <span className="profile-role-badge">
                  <ShieldCheck size={15} />
                  {user.role === "admin" ? "Administrator" : "Verified Member"}
                </span>

                <div className="profile-member-since">
                  <CalendarDays size={16} />
                  <span>Member since {memberSince}</span>
                </div>
              </div>

              {!editing && (
                <button
                  type="button"
                  className="profile-edit-btn"
                  onClick={handleEdit}
                >
                  <Pencil size={17} />
                  Edit Profile
                </button>
              )}

              {editing && (
                <p className="profile-photo-hint">
                  <Camera size={15} />
                  Photo: JPG, PNG, WEBP or GIF · Max 2 MB
                </p>
              )}
            </section>

            <section className="profile-quick-card">
              <div className="profile-quick-icon">
                <Ticket size={22} />
              </div>
              <div className="profile-quick-copy">
                <h3>Your Journeys</h3>
                <p>View and manage your bookings.</p>
              </div>
              <Link
                to="/my-bookings"
                className="profile-quick-link"
                aria-label="Open my bookings"
              >
                →
              </Link>
            </section>

            <section className="profile-security-card">
              <div className="profile-security-icon">
                <ShieldCheck size={21} />
              </div>
              <div>
                <h3>Your account, protected</h3>
                <p>Your profile is linked to your MK Travels account.</p>
              </div>
            </section>

            <button
              type="button"
              className="profile-logout-btn"
              onClick={handleLogout}
              disabled={loggingOut}
            >
              {loggingOut ? (
                <LoaderCircle size={18} className="profile-spinner" />
              ) : (
                <LogOut size={18} />
              )}
              {loggingOut ? "Logging out..." : "Logout"}
            </button>
          </aside>

          <section className="profile-details-card">
            <div className="profile-details-heading">
              <div className="profile-heading-icon">
                <UserRound size={22} />
              </div>
              <div>
                <h2>Personal Information</h2>
                <p>Keep your details up to date for a smoother journey.</p>
              </div>
            </div>

            <form onSubmit={handleSave}>
              <div className="profile-form-grid">
                <div className="profile-field">
                  <label htmlFor="profile-name">Full Name</label>
                  <div className="profile-input-wrap">
                    <UserRound size={18} />
                    <input
                      id="profile-name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      disabled={!editing || saving}
                      required
                    />
                  </div>
                </div>

                <div className="profile-field">
                  <label htmlFor="profile-email">Email Address</label>
                  <div className="profile-input-wrap">
                    <Mail size={18} />
                    <input
                      id="profile-email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                      disabled={!editing || saving}
                      required
                    />
                  </div>
                </div>

                <div className="profile-field">
                  <label htmlFor="profile-phone">Mobile Number</label>
                  <div className="profile-input-wrap">
                    <Phone size={18} />
                    <input
                      id="profile-phone"
                      name="phone"
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="10-digit mobile number"
                      disabled={!editing || saving}
                    />
                  </div>
                </div>

                <div className="profile-field">
                  <label htmlFor="profile-townVillage">Town / Village</label>
                  <div className="profile-input-wrap">
                    <MapPinned size={18} />
                    <input
                      id="profile-townVillage"
                      name="townVillage"
                      value={formData.townVillage}
                      onChange={handleChange}
                      placeholder="Town or village"
                      disabled={!editing || saving}
                    />
                  </div>
                </div>

                <div className="profile-field profile-field-full">
                  <label htmlFor="profile-address">Street Address</label>
                  <div className="profile-input-wrap">
                    <MapPin size={18} />
                    <input
                      id="profile-address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="House number, street, area"
                      disabled={!editing || saving}
                    />
                  </div>
                </div>

                <div className="profile-field">
                  <label htmlFor="profile-city">City</label>
                  <input
                    className="profile-plain-input"
                    id="profile-city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Your city"
                    disabled={!editing || saving}
                  />
                </div>

                <div className="profile-field">
                  <label htmlFor="profile-state">State</label>
                  <input
                    className="profile-plain-input"
                    id="profile-state"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="Your state"
                    disabled={!editing || saving}
                  />
                </div>

                <div className="profile-field">
                  <label htmlFor="profile-pincode">PIN Code</label>
                  <input
                    className="profile-plain-input"
                    id="profile-pincode"
                    name="pincode"
                    inputMode="numeric"
                    maxLength={6}
                    value={formData.pincode}
                    onChange={handleChange}
                    placeholder="6-digit PIN code"
                    disabled={!editing || saving}
                  />
                </div>
              </div>

              {editing && (
                <div className="profile-form-actions">
                  <button
                    type="button"
                    className="profile-cancel-btn"
                    onClick={handleCancel}
                    disabled={saving}
                  >
                    <X size={18} />
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="profile-save-btn"
                    disabled={saving}
                  >
                    {saving ? (
                      <LoaderCircle size={18} className="profile-spinner" />
                    ) : (
                      <Save size={18} />
                    )}
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              )}

              {!editing && (
                <div className="profile-readonly-note">
                  <ShieldCheck size={17} />
                  Select Edit Profile to update your personal information.
                </div>
              )}
            </form>
          </section>
        </div>

        <footer className="profile-footer-note">
          <span>✦</span>
          Every great journey starts with a plan. Let MK Travels help with the rest.
        </footer>
      </div>
    </main>
  );
}

export default Profile;
