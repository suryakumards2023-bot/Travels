
import { BrowserRouter, Routes, Route } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";

import Home from "./pages/Home";
import Tours from "./pages/Tours";
import TourDetails from "./pages/TourDetails";
import Booking from "./pages/Booking";
import Payment from "./pages/Payment";

import MyBookings from "./pages/MyBookings";
import BookingDetails from "./pages/BookingDetails";

import BusResult from "./pages/BusResult";
import BusBooking from "./pages/BusBooking";

import CabResults from "./pages/CabResults";
import CabBooking from "./pages/CabBooking";

import HotelResults from "./pages/HotelResults";
import HotelDetails from "./pages/HotelDetails";
import HotelBooking from "./pages/HotelBooking";

import InsuranceResults from "./pages/InsuranceResults";
import InsuranceBooking from "./pages/InsuranceBooking";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />

          {/* Tours */}
          <Route path="/tours" element={<Tours />} />
          <Route path="/tours/:id" element={<TourDetails />} />
          <Route path="/booking/:id" element={<Booking />} />

          {/* Shared Payment */}
          <Route path="/payment/:id" element={<Payment />} />

          {/* Booking History */}
          <Route path="/my-bookings" element={<MyBookings />} />
          <Route path="/my-trips" element={<MyBookings />} />
          <Route
            path="/booking-details/:id"
            element={<BookingDetails />}
          />

          {/* Bus Booking */}
          <Route path="/bus-result" element={<BusResult />} />
          <Route path="/bus-booking" element={<BusBooking />} />

          {/* Cab Booking */}
          <Route path="/cab-results" element={<CabResults />} />
          <Route path="/cabs" element={<CabResults />} />
          <Route path="/cab-booking" element={<CabBooking />} />

          {/* Hotel Booking */}
          <Route path="/hotel-results" element={<HotelResults />} />
          <Route
  path="/hotel-details"
  element={<HotelDetails />}
/>
          <Route path="/hotel-booking" element={<HotelBooking />} />

          {/* Travel Insurance */}
          <Route
            path="/insurance-results"
            element={<InsuranceResults />}
          />
          <Route path="/insurance-booking" element={<InsuranceBooking />} />
          

          {/* Account */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;