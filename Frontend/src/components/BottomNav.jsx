import { Link } from "react-router-dom";
import {Home,Search,Map,User
} from "lucide-react";

function BottomNav() {
  return (
    <nav className="bottom-nav">
      <Link to="/">
        <Home size={20} />
        <span>Home</span>
      </Link>

      <Link to="/search">
        <Search size={20} />
        <span>Search</span>
      </Link>

      <Link to="/tours">
        <Map size={20} />
        <span>Tours</span>
      </Link>

      <Link to="/profile">
        <User size={20} />
        <span>Profile</span>
      </Link>
    </nav>
  );
}
export default BottomNav;