import "./Footer.css";
import {
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="footer">

      {/* =========================================
          FOOTER MAIN
      ========================================= */}

      <div className="footer-container">

        {/* BRAND */}

        <div className="footer-brand">

          <Link to="/" className="footer-logo">
            MK <span>TRAVELS</span>
          </Link>

          <p>
            Explore beautiful destinations, discover
            amazing experiences and make unforgettable
            travel memories with MK Travels.
          </p>

          {/* SOCIAL MEDIA */}

          <div className="footer-social">

            <a href="https://www.facebook.com/mktravelsbihar/" aria-label="Facebook">
              f
            </a>

            <a href="https://www.instagram.com/mktravelsbihar/" aria-label="Instagram">
              ◎
            </a>

            <a href="https://twitter.com/mktravelsbihar" aria-label="Twitter">
              𝕏
            </a>

            <a href="https://www.youtube.com/@mktravelsbihar" aria-label="YouTube">
              ▶
            </a>

            <a href="https://www.linkedin.com/company/mktravelsbihar" aria-label="LinkedIn">
              in
            </a>

          </div>

        </div>


        {/* COMPANY */}

        <div className="footer-column">

          <h3>Company</h3>

          <Link to="/">Home</Link>
          <Link to="/tours">Tours</Link>
          <Link to="/about">About Us</Link>
          <Link to="/contact">Contact Us</Link>
          <Link to="/careers">Careers</Link>

        </div>


        {/* TRAVEL */}

        <div className="footer-column">

          <h3>Travel</h3>

          <Link to="/tours">
            Holiday Packages
          </Link>

          <Link to="/search?type=bus">
            Bus Booking
          </Link>

          <Link to="/search?type=cab">
            Cab Booking
          </Link>

          <Link to="/search?type=hotel">
            Hotels
          </Link>

          <Link to="/insurance">
            Travel Insurance
          </Link>

        </div>


        {/* SUPPORT */}

        <div className="footer-column">

          <h3>Support</h3>

          <Link to="/help">
            Help Center
          </Link>

          <Link to="/my-trips">
            My Trips
          </Link>

          <Link to="/terms">
            Terms & Conditions
          </Link>

          <Link to="/privacy">
            Privacy Policy
          </Link>

          <Link to="/refund">
            Refund Policy
          </Link>

        </div>


        {/* CONTACT */}

        <div className="footer-column footer-contact">

          <h3>Contact Us</h3>

          <div className="footer-contact-item">

            <Phone size={17} />

            <span>
              +91 98765 43210
            </span>

          </div>


          <div className="footer-contact-item">

            <Mail size={17} />

            <span>
              mktravelsbihar@gmail.com
            </span>

          </div>


          <div className="footer-contact-item">

            <MapPin size={17} />

            <span>
              India
            </span>

          </div>

        </div>

      </div>


      {/* =========================================
          NEWSLETTER
      ========================================= */}

      <div className="footer-newsletter">

        <div className="footer-newsletter-container">

          <div>

            <h3>
              Get travel inspiration in your inbox
            </h3>

            <p>
              Subscribe for travel deals, offers and
              destination updates.
            </p>

          </div>


          <form
            className="newsletter-form"
            onSubmit={(e) => e.preventDefault()}
          >

            <input
              type="email"
              placeholder="Enter your email address"
              aria-label="Email address"
            />

            <button type="submit">
              Subscribe
            </button>

          </form>

        </div>

      </div>


      {/* =========================================
          FOOTER BOTTOM
      ========================================= */}

      <div className="footer-bottom">

        <div className="footer-bottom-container">

          <p>
            © {new Date().getFullYear()} MK Travels.
            All rights reserved.
          </p>


          <div className="footer-bottom-links">

            <Link to="/privacy">
              Privacy
            </Link>

            <Link to="/terms">
              Terms
            </Link>

            <Link to="/refund">
              Refund
            </Link>

          </div>

        </div>

      </div>

    </footer>
  );
}
export default Footer;
