import Logo from "../../../src/assets/logo.png"
function Navbar() {
  return (
    <nav
      className="navbar navbar-expand-lg px-4"
      style={{
        backgroundColor: "#f4efeb",
        boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
        height: "95px",
      }}
    >
      <div className="container-fluid">

        {/* Logo */}
  <div className="Logo">
  <img src={Logo} alt="logo" />
</div>

        {/* Toggle */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Nav Links */}
        <div
          className="collapse navbar-collapse justify-content-center"
          id="navbarNav"
        >
          <ul
            className="navbar-nav gap-5"
            style={{
              fontSize: "20px",
              fontWeight: "700",
              fontFamily: "serif",
            }}
          >
            <li className="nav-item">
              <a
                className="nav-link active"
                href="#"
                style={{
                  color: "#2b1b1b",
                  borderBottom: "3px solid black",
                  width: "fit-content",
                }}
              >
                Home
              </a>
            </li>

            <li className="nav-item">
              <a className="nav-link" href="#" style={{ color: "#2b1b1b" }}>
                Our Menu
              </a>
            </li>

            <li className="nav-item">
              <a className="nav-link" href="#" style={{ color: "#2b1b1b" }}>
                About
              </a>
            </li>
          </ul>
        </div>

        {/* Button */}
        <button
          className="btn px-4 py-2"
          style={{
            backgroundColor: "#9c8585",
            color: "black",
            fontWeight: "700",
            borderRadius: "6px",
            border: "none",
            fontFamily: "serif",
          }}
        >
          Get Started
        </button>
      </div>
    </nav>
  );
}

export default Navbar;