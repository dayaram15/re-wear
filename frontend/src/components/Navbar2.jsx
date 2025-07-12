import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import useAuthStore from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const navLinks = [
  { name: "Home", path: "/" },
  { name: "Browse", path: "/browse" },
  { name: "List an Item", path: "/add-item" },
  { name: "Dashboard", path: "/dashboard" },
];

const Navbar = () => {
  const { user, logout } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);

  const logoutHandler = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error("Logout failed");
    }
  };

  return (
    <header className="w-full px-6 py-4 shadow-sm bg-background border-b border-border fixed top-0 left-0 z-50">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-primary">
          ReWear
        </Link>

        <nav className="hidden md:flex gap-6 items-center">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className="text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              {link.name}
            </Link>
          ))}

          {user ? (
            <>
              <span className="text-sm font-semibold text-foreground">
                {user.username} ({user.points_balance || 0} pts)
              </span>
              {user.is_admin && (
                <Link to="/admin-dashboard">
                  <Button variant="ghost" size="sm">
                    Admin
                  </Button>
                </Link>
              )}
              <Button variant="outline" size="sm" onClick={logoutHandler}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="outline" size="sm">
                  Login
                </Button>
              </Link>
              <Link to="/signup">
                <Button size="sm">Signup</Button>
              </Link>
            </>
          )}
        </nav>

        {/* Mobile menu icon */}
        <div className="md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden mt-4 flex flex-col gap-4 bg-background border-t border-border px-4 py-2">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className="text-sm font-medium text-foreground hover:text-primary transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}

          {user ? (
            <>
              <span className="text-sm font-semibold text-foreground">
                {user.username} ({user.points_balance || 0} pts)
              </span>
              {user.is_admin && (
                <Link to="/admin-dashboard" onClick={() => setMenuOpen(false)}>
                  <Button variant="ghost" size="sm" className="w-full">
                    Admin
                  </Button>
                </Link>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  logoutHandler();
                  setMenuOpen(false);
                }}
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)}>
                <Button variant="outline" size="sm" className="w-full">
                  Login
                </Button>
              </Link>
              <Link to="/signup" onClick={() => setMenuOpen(false)}>
                <Button size="sm" className="w-full">
                  Signup
                </Button>
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
