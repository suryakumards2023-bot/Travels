
import { useState } from "react";
import { createPortal } from "react-dom";
import { Phone, X } from "lucide-react";
import "./TravelContact.css";

const WHATSAPP_NUMBER = "918051936436";

function TravelContact({ destinationName = "your trip" }) {
  const [showCallbackPopup, setShowCallbackPopup] = useState(false);

  const [callbackName, setCallbackName] = useState("");
  const [callbackPhone, setCallbackPhone] = useState("");
  const [callbackEmail, setCallbackEmail] = useState("");
  const [callbackTime, setCallbackTime] = useState("Anytime");

  const [submitting, setSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const closePopup = () => {
    if (submitting) return;

    setShowCallbackPopup(false);
    setCallbackName("");
    setCallbackPhone("");
    setCallbackEmail("");
    setCallbackTime("Anytime");
    setFormMessage("");
    setMessageType("");
  };

  const handleWhatsAppClick = () => {
    const message = `Hello MK Travels! I am interested in the ${destinationName} tour package. Please share more details.`;
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
      message
    )}`;

    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  const handleCallbackSubmit = async (event) => {
    event.preventDefault();

    if (submitting) return;

    const name = callbackName.trim();
    const phone = callbackPhone.trim();
    const email = callbackEmail.trim();

    if (name.length < 2 || name.length > 80) {
      setMessageType("error");
      setFormMessage("Please enter a name between 2 and 80 characters.");
      return;
    }

    if (!/^[6-9]\d{9}$/.test(phone)) {
      setMessageType("error");
      setFormMessage("Please enter a valid 10-digit Indian mobile number.");
      return;
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setMessageType("error");
      setFormMessage("Please enter a valid email address.");
      return;
    }

    setSubmitting(true);
    setFormMessage("");
    setMessageType("");

    try {
      const apiBaseUrl = (
        import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api"
      ).replace(/\/+$/, "");

      const response = await fetch(`${apiBaseUrl}/contact/callback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          phone,
          email,
          preferredTime: callbackTime,
          destination: String(destinationName).slice(0, 120),
        }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          result.message || "Unable to submit your request. Please try again."
        );
      }

      setMessageType("success");
      setFormMessage(
        result.message ||
          "Your callback request has been submitted successfully."
      );

      setCallbackName("");
      setCallbackPhone("");
      setCallbackEmail("");
      setCallbackTime("Anytime");

      // Success message dikhane ke baad popup close karo
setTimeout(() => {
  setShowCallbackPopup(false);
  setFormMessage("");
  setMessageType("");
}, 1000);
    } catch (error) {
      setMessageType("error");
      setFormMessage(
        error.message ||
          "Could not connect to the server. Please try again later."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="destination-contact-actions">
        {/* Opens WhatsApp chat */}
        <button
          type="button"
          className="destination-call-btn"
          onClick={handleWhatsAppClick}
          aria-label={`Contact MK Travels on WhatsApp about ${destinationName}`}
        >
          <Phone size={15} />
          <span>WhatsApp</span>
        </button>

        {/* Opens callback form */}
        <button
          type="button"
          className="destination-callback-btn"
          onClick={() => {
            setFormMessage("");
            setMessageType("");
            setShowCallbackPopup(true);
          }}
        >
          <Phone size={15} />
          <span>Request Callback</span>
        </button>
      </div>

      {showCallbackPopup &&
        createPortal(
          <div
            className="callback-popup-overlay"
            onClick={closePopup}
          >
            <div
              className="callback-popup"
              role="dialog"
              aria-modal="true"
              aria-labelledby="callback-popup-title"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                className="callback-popup-close"
                onClick={closePopup}
                aria-label="Close callback form"
                disabled={submitting}
              >
                <X size={20} />
              </button>

              <div className="callback-popup-header">
                <div className="callback-popup-icon">
                  <Phone size={23} />
                </div>

                <div>
                  <span className="callback-popup-label">
                    TRAVEL EXPERT
                  </span>
                  <h2 id="callback-popup-title">Request a Callback</h2>
                </div>
              </div>

              <p className="callback-popup-description">
                Get personalized help from our travel expert for{" "}
                <strong>{destinationName}</strong>.
              </p>

              <form
                className="callback-form"
                onSubmit={handleCallbackSubmit}
                noValidate
              >
                <div className="callback-field">
                  <label htmlFor="callback-name">Full Name</label>
                  <input
                    id="callback-name"
                    type="text"
                    autoComplete="name"
                    minLength={2}
                    maxLength={80}
                    placeholder="Enter your full name"
                    value={callbackName}
                    onChange={(event) =>
                      setCallbackName(event.target.value)
                    }
                    required
                    disabled={submitting}
                  />
                </div>

                <div className="callback-field">
                  <label htmlFor="callback-phone">Phone Number</label>
                  <input
                    id="callback-phone"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    maxLength={10}
                    pattern="[6-9][0-9]{9}"
                    placeholder="Enter 10 digit mobile number"
                    value={callbackPhone}
                    onChange={(event) =>
                      setCallbackPhone(
                        event.target.value.replace(/\D/g, "").slice(0, 10)
                      )
                    }
                    required
                    disabled={submitting}
                  />
                </div>

                <div className="callback-field">
                  <label htmlFor="callback-email">
                    <span>Email Address</span>
                    <span className="optional-text">Optional</span>
                  </label>
                  <input
                    id="callback-email"
                    type="email"
                    autoComplete="email"
                    maxLength={254}
                    placeholder="Enter your email address"
                    value={callbackEmail}
                    onChange={(event) =>
                      setCallbackEmail(event.target.value)
                    }
                    disabled={submitting}
                  />
                </div>

                <div className="callback-field">
                  <label htmlFor="callback-time">Preferred Call Time</label>
                  <select
                    id="callback-time"
                    value={callbackTime}
                    onChange={(event) =>
                      setCallbackTime(event.target.value)
                    }
                    disabled={submitting}
                  >
                    <option value="Anytime">Anytime</option>
                    <option value="9 AM - 12 PM">9 AM - 12 PM</option>
                    <option value="12 PM - 3 PM">12 PM - 3 PM</option>
                    <option value="3 PM - 6 PM">3 PM - 6 PM</option>
                    <option value="6 PM - 9 PM">6 PM - 9 PM</option>
                  </select>
                </div>

                {formMessage && (
                  <p
                    className="callback-form-message"
                    role="status"
                    aria-live="polite"
                    data-type={messageType}
                  >
                    {formMessage}
                  </p>
                )}

                <button
                  type="submit"
                  className="callback-submit-btn"
                  disabled={submitting}
                >
                  <Phone size={16} />
                  <span>
                    {submitting ? "Submitting..." : "Request Callback"}
                  </span>
                </button>
              </form>

              <div className="callback-popup-footer">
                <span className="callback-footer-dot" />
                <span>
                  Your details will be sent securely to our travel team.
                </span>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}

export default TravelContact;
