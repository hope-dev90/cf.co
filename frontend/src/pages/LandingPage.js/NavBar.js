import Logo from "../../../src/assets/logo.png";

function Navbar() {
  return (
    <nav
      className="navbar navbar-expand-lg px-4"
      style={{
        backgroundColor: "#f4efeb",
        boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
      }}
    >
      <div className="container-fluid">

        {/* Logo */}
        <div className="Logo">
          <img
            src={Logo}
            alt="logo"
            style={{
              width: "80px",
              height: "80px",
              objectFit: "contain",
            }}
          />
        </div>

        {/* Mobile Toggle */}
        <button
  className="navbar-toggler"
  type="button"
  data-bs-toggle="collapse"
  data-bs-target="#navbarNav"
  aria-controls="navbarNav"
  aria-expanded="false"
  aria-label="Toggle navigation"
>
  <span className="navbar-toggler-icon"></span>
</button>
        {/* Nav Links */}
        <div
          className="collapse navbar-collapse justify-content-center"
          id="navbarNav"
        >
          <ul
            className="navbar-nav gap-lg-5 text-center"
            style={{
              fontSize: "20px",
              fontWeight: "700",
              fontFamily: "serif",
            }}
          >
            <li className="nav-item">
              <a className="nav-link nav-custom" href="#">
                Home
              </a>
            </li>

            <li className="nav-item">
              <a className="nav-link nav-custom" href="#">
                Our Menu
              </a>
            </li>

            <li className="nav-item">
              <a className="nav-link nav-custom" href="#">
                About
              </a>
            </li>
          </ul>
        </div>

        {/* Button */}
        <button
          className="btn px-4 py-2 d-none d-lg-block"
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

      {/* Internal CSS */}
      <style>
        {`
          .nav-custom {
            color: #2b1b1b;
            position: relative;
            transition: 0.3s ease;
          }

          .nav-custom::after {
            content: "";
            position: absolute;
            left: 0;
            bottom: -5px;
            width: 0%;
            height: 3px;
            background: black;
            transition: 0.3s ease;
          }

          .nav-custom:hover::after {
            width: 100%;
          }

          .active-link::after {
            width: 100%;
          }

          @media (max-width: 991px) {
            .navbar-nav {
              padding-top: 20px;
              gap: 20px;
            }

            .nav-custom {
              display: inline-block;
            }
          }
        `}
      </style>
    </nav>
  );
}

export default Navbar;