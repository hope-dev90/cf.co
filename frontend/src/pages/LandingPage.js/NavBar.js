import { useNavigate } from "react-router-dom";
import Logo from "../../../src/assets/logo.png";
import { useAuth } from "../../../src/context/AuthContext";

function Navbar() {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      if (user?.role === "admin") navigate("/admin");
      else if (user?.role === "restaurateur") navigate("/restaurateur");
      else navigate("/user");
    } else {
      navigate("/signup");
    }
  };

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav
      className="navbar navbar-expand-lg px-4"
      style={{ backgroundColor: "#f4efeb", boxShadow: "0 4px 10px rgba(0,0,0,0.2)" }}
    >
      <div className="container-fluid">
        <div className="Logo" style={{ cursor: "pointer" }} onClick={() => navigate("/")}>
          <img src={Logo} alt="logo" style={{ width: "80px", height: "80px", objectFit: "contain" }} />
        </div>

        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse justify-content-center" id="navbarNav">
          <ul className="navbar-nav gap-lg-5 text-center" style={{ fontSize: "20px", fontWeight: "700", fontFamily: "serif" }}>
            <li className="nav-item">
              <button className="nav-link nav-custom btn btn-link" style={{ textDecoration: "none" }} onClick={() => scrollTo("hero")}>Home</button>
            </li>
            <li className="nav-item">
              <button className="nav-link nav-custom btn btn-link" style={{ textDecoration: "none" }} onClick={() => scrollTo("menu")}>Our Menu</button>
            </li>
            <li className="nav-item">
              <button className="nav-link nav-custom btn btn-link" style={{ textDecoration: "none" }} onClick={() => scrollTo("about")}>About</button>
            </li>
          </ul>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          {isAuthenticated ? (
            <>
              <button
                className="btn px-4 py-2 d-none d-lg-block"
                style={{ backgroundColor: "#2a0d0d", color: "white", fontWeight: "700", borderRadius: "6px", border: "none", fontFamily: "serif" }}
                onClick={handleGetStarted}
              >
                Dashboard
              </button>
              <button
                className="btn px-3 py-2 d-none d-lg-block"
                style={{ backgroundColor: "transparent", color: "#2a0d0d", fontWeight: "700", borderRadius: "6px", border: "1px solid #2a0d0d", fontFamily: "serif", fontSize: "14px" }}
                onClick={logout}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                className="btn px-3 py-2 d-none d-lg-block"
                style={{ backgroundColor: "transparent", color: "#2a0d0d", fontWeight: "700", borderRadius: "6px", border: "1px solid #2a0d0d", fontFamily: "serif", fontSize: "14px" }}
                onClick={() => navigate("/login")}
              >
                Login
              </button>
              <button
                className="btn px-4 py-2 d-none d-lg-block"
                style={{ backgroundColor: "#9c8585", color: "black", fontWeight: "700", borderRadius: "6px", border: "none", fontFamily: "serif" }}
                onClick={handleGetStarted}
              >
                Get Started
              </button>
            </>
          )}
        </div>
      </div>

      <style>{`
        .nav-custom { color: #2b1b1b !important; position: relative; transition: 0.3s ease; }
        .nav-custom::after { content: ""; position: absolute; left: 0; bottom: -5px; width: 0%; height: 3px; background: black; transition: 0.3s ease; }
        .nav-custom:hover::after { width: 100%; }
        @media (max-width: 991px) { .navbar-nav { padding-top: 20px; gap: 20px; } }
      `}</style>
    </nav>
  );
}

export default Navbar;
