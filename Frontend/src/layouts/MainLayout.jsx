import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import BottomNav from "../components/BottomNav";
import Footer from "../components/Footer";

function MainLayout() {
  return (
    <div className="app">
      <Navbar />

      <main>
        <Outlet />
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
}

export default MainLayout;