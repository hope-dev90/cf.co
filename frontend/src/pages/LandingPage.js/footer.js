import logo from "../../../src/assets/logo.png";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Lato:wght@300;400;700&display=swap');

  .footer {
    font-family: 'Lato', sans-serif;
    background: #8d7f6e;
    padding: 40px 48px 24px;
    display: flex;
    flex-direction: column;
    gap: 32px;
  }

  .footer-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 24px;
  }

  .footer-brand {
    display: flex;
    flex-direction: column;
    gap: 12px;
    min-width: 140px;
  }

  .footer-logo {
    width: 64px;
    height: auto;
  }

  .footer-tagline {
    font-size: 13px;
    color: #1a1209;
    line-height: 1.5;
    margin: 0;
    font-weight: 700;
  }

  .footer-location {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 13px;
    color: #1a1209;
    font-weight: 700;
    margin: 0;
  }

  .footer-location .pin {
    color: #c0281a;
    font-size: 15px;
  }

  .footer-nav {
    display: flex;
    flex-direction: column;
    gap: 18px;
    align-items: flex-start;
  }

  .footer-nav a {
    font-size: 14px;
    color: #1a1209;
    text-decoration: none;
    font-weight: 400;
    transition: opacity 0.15s;
  }

  .footer-nav a:hover {
    opacity: 0.65;
  }

  .footer-chips {
    width: 160px;
    height: auto;
    object-fit: contain;
    align-self: center;
  }

  .footer-chips-placeholder {
    width: 160px;
    height: 130px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .footer-bottom {
    border-top: 0.5px solid rgba(26, 18, 9, 0.25);
    padding-top: 16px;
    display: flex;
    justify-content: flex-end;
  }

  .footer-copy {
    font-size: 12px;
    color: #1a1209;
    margin: 0;
    opacity: 0.85;
  }

  @media (max-width: 480px) {
    .footer {
      padding: 32px 24px 20px;
    }
    .footer-top {
      flex-wrap: wrap;
    }
    .footer-chips-placeholder,
    .footer-chips {
      width: 120px;
    }
    .footer-bottom {
      justify-content: center;
    }
  }
`;

const ChipsIllustration = () => (
  <svg
    viewBox="0 0 160 130"
    xmlns="http://www.w3.org/2000/svg"
    style={{ width: "160px", height: "130px" }}
    aria-hidden="true"
  >
    {[0,1,2,3,4,5,6].map((i) => {
      const y = 100 - i * 13;
      const rx = 52 - i * 1.5;
      const ry = 14 - i * 0.5;
      const fill = i % 2 === 0 ? "#f0c060" : "#e8b040";
      const tilt = i % 3 === 0 ? 3 : i % 3 === 1 ? -4 : 1;
      return (
        <ellipse
          key={i}
          cx="80"
          cy={y}
          rx={rx}
          ry={ry}
          fill={fill}
          stroke="#c8902a"
          strokeWidth="0.8"
          transform={`rotate(${tilt}, 80, ${y})`}
        />
      );
    })}
  </svg>
);

export default function Footer({ onNavigate }) {
  if (typeof document !== "undefined" && !document.getElementById("footer-styles")) {
    const tag = document.createElement("style");
    tag.id = "footer-styles";
    tag.textContent = styles;
    document.head.appendChild(tag);
  }

  const handleNav = (page) => {
    if (onNavigate) onNavigate(page);
  };

  return (
    <footer className="footer">
      <div className="footer-top">
        {/* Brand */}
        <div className="footer-brand">
          <img src={logo} alt="C&F Company logo" className="footer-logo" />
          <p className="footer-tagline">
            Smart Management.<br />Seamless Dining.
          </p>
          <p className="footer-location">
            <span className="pin" aria-hidden="true">📍</span>
            Kigali, Rwanda
          </p>
        </div>

        {/* Nav links */}
        <nav className="footer-nav" aria-label="Footer navigation">
          <a href="#about" onClick={(e) => { e.preventDefault(); handleNav("about"); }}>About</a>
          <a href="#home" onClick={(e) => { e.preventDefault(); handleNav("home"); }}>Home</a>
          <a href="#order" onClick={(e) => { e.preventDefault(); handleNav("order"); }}>Order</a>
        </nav>

        {/* Chips image */}
        <div className="footer-chips-placeholder">
          <ChipsIllustration />
        </div>
      </div>

      <div className="footer-bottom">
        <p className="footer-copy">© 2026 C&amp;F Company Limited. All rights reserved.</p>
      </div>
    </footer>
  );
}