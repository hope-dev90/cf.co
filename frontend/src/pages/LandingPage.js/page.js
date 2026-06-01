import Navbar from "./NavBar";
import Hero from "./body";
import Menu from "./menu";
import AboutSection from "./about";
import Footer from "./footer";

function LandingPage() {
  const stats = [
    { number: "5,000+", label: "Pasta" },
    { number: "200+", label: "Chicken" },
    { number: "98%", label: "Cappuccino" },
  ];

  return (
    <div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;800&display=swap');

        .stats-card {
          display: flex;
          align-items: stretch;
          background: rgba(255, 255, 255, 0.55);
          border: 1px solid rgba(255, 255, 255, 0.75);
          border-radius: 24px;
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          box-shadow: 0 8px 40px rgba(120, 80, 40, 0.10), inset 0 1.5px 0 rgba(255,255,255,0.7);
          overflow: hidden;
          width: 100%;
          max-width: 640px;
        }

        .stat-item {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 36px 24px;
          gap: 6px;
          position: relative;
        }

        .stat-item--divided::before {
          content: "";
          position: absolute;
          left: 0; top: 20%;
          height: 60%; width: 1px;
          background: rgba(160, 120, 80, 0.2);
        }

        .stat-num {
          font-family: 'Inter', sans-serif;
          font-size: clamp(28px, 4vw, 40px);
          font-weight: 800;
          color: #1a1008;
          line-height: 1;
          letter-spacing: -1px;
        }

        .stat-label {
          font-family: 'Inter', sans-serif;
          font-size: 13px;
          font-weight: 400;
          color: #9b8878;
          letter-spacing: 0.02em;
        }

        @media (max-width: 600px) {
          .stats-card { flex-direction: column; }
          .stat-item--divided::before { top: 0; left: 20%; width: 60%; height: 1px; }
        }
      `}</style>

      <Navbar />

      <Hero />

      <div style={{ display: "flex", justifyContent: "center", padding: "0 24px", marginTop: "-48px", position: "relative", zIndex: 10 }}>
        <div className="stats-card">
          {stats.map((stat, i) => (
            <div key={i} className={`stat-item ${i > 0 ? "stat-item--divided" : ""}`}>
              <span className="stat-num">{stat.number}</span>
              <span className="stat-label">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

     
       <div className="flex flex-col scroll-smooth">
      <Menu />

      <div className="mt-10">
        <AboutSection />
      </div>
    </div>

      <Footer />
    </div>
  );
}

export default LandingPage;