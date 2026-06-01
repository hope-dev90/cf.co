import FoodImage from "../../../src/assets/landing.jpg";
import "./landing.css";
import { useNavigate } from "react-router-dom";

function Hero() {
  const navigate = useNavigate();
  return (
    <section
      id="hero"
      className="container-fluid"
      style={{
        backgroundColor: "#f4efeb",
        minHeight: "100vh",
        padding: "60px 40px",
      }}
    >
      <div className="row align-items-center">

        {/* LEFT CONTENT */}
        <div className="col-lg-6 col-md-12">

          {/* Company name — kept as brand label */}
          <p
            style={{
              color: "#9b5b00",
              fontSize: "13px",
              fontWeight: "600",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              marginBottom: "24px",
              fontFamily: "Inter",
            }}
          >
            C&F Company Limited
          </p>

          {/* Main headline */}
          <h1
            style={{
              color: "#2b1a0e",
              fontSize: "clamp(32px, 4vw, 52px)",
              fontWeight: "700",
              fontFamily: "Inter",
              lineHeight: "1.2",
              marginBottom: "20px",
              marginRight: "60px",
            }}
          >
            Great food,<br />
            <span style={{ color: "#9b5b00" }}>delivered fast.</span>
          </h1>

          {/* Subtext — same Katibeh font, same color as before */}
          <p
            style={{
              color: "#5b5b5b",
              fontSize: "18px",
              fontFamily: "Katibeh, Georgia, serif",
              lineHeight: "1.6",
              marginBottom: "20px",
              marginRight: "80px",
            }}
          >
            Smart dining. Seamless service.
            <br />
            Efficient management made simple.
          </p>

          {/* Social proof — new, subtle */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "40px",
            }}
          >
            <span style={{ color: "#c8890a", fontSize: "15px", letterSpacing: "2px",marginLeft:"99px" }}>
              ★★★★★
            </span>
            <span
              style={{
                color: "#7a6a5e",
               
                fontSize: "13px",
                fontFamily: "Georgia, serif",
              }}
            >
              4.8 · Loved by 2,000+ customers
            </span>
          </div>

          {/* BUTTONS — same visual style, clearer hierarchy */}
          <div className="d-flex gap-4 flex-wrap">
            <button
              className="btn px-5 py-3 hero-btn-primary"
              style={{ backgroundColor: "#7a5c5c", color: "white", marginTop:"90px", fontWeight: "600", borderRadius: "4px", border: "none", marginRight:"40px", fontSize: "18px", transition: "background-color 0.2s ease" }}
              onClick={() => navigate("/user")}
            >
              Order now
            </button>

            <button
              className="btn px-5 py-3 hero-btn-secondary"
              style={{ backgroundColor: "transparent", color: "#3f3f3f", marginTop:"90px", fontWeight: "600", borderRadius: "4px", border: "1px solid #888", fontSize: "18px", transition: "border-color 0.2s ease, color 0.2s ease" }}
              onClick={() => { const el = document.getElementById("about"); if (el) el.scrollIntoView({ behavior: "smooth" }); }}
            >
              About us
            </button>
          </div>
        </div>

        {/* RIGHT IMAGE — identical to original */}
        <div className="col-lg-6 col-md-12 d-flex justify-content-center mt-5 mt-lg-0">
          <div className="image-wrapper">
            <img
              src={FoodImage}
              alt="Delicious food spread"
              className="food-image"
            />
          </div>
        </div>
      </div>

      {/* INTERNAL CSS */}
      <style>
        {`
          .hero-btn-primary:hover {
            background-color: #9b5b00 !important;
          }

          .hero-btn-secondary:hover {
            border-color: #9b5b00 !important;
            color: #9b5b00 !important;
          }

          .image-wrapper {
            position: relative;
            width: 420px;
            height: 520px;
          }

          .image-wrapper::before {
            content: "";
            position: absolute;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.18);
            top: 40px;
            left: -80px;
            border-radius: 220px;
            filter: blur(2px);
            z-index: 0;
          }

          .food-image {
            position: relative;
            width: 100%;
            height: 100%;
            object-fit: cover;
            border-radius: 220px;
            z-index: 2;
          }

          @media (max-width: 992px) {
            .image-wrapper {
              width: 320px;
              height: 420px;
            }
          }
        `}
      </style>
    </section>
  );
}

export default Hero;