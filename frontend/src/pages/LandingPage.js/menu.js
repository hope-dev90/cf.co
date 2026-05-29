import pasta from "../../../src/assets/pasta.jpg";
import chicken from "../../../src/assets/chicken.jpg";
import cappuccino from "../../../src/assets/cappuccino.jpg";

const menuItems = [
  {
    id: 1,
    image: pasta,
    emoji: "🍝",
    name: "Spaghetti Classico",
    description: "A timeless favorite — fresh pasta tossed in rich tomato sauce and garnished with herbs.",
    price: "$56",
  },
  {
    id: 2,
    image: chicken,
    emoji: "🍗",
    name: "Crispy Chicken Platter",
    description: "Golden fried chicken served with fries and dipping sauces.",
    price: "$96",
  },
  {
    id: 3,
    image: cappuccino,
    emoji: "☕",
    name: "Cappuccino with Heart",
    description: "Smooth espresso topped with creamy foam and latte art.",
    price: "$26",
  },
];

function Menu() {
  return (
    <section
      style={{
        backgroundColor: "#f4efeb",
        padding: "70px 40px",
        minHeight: "100vh",
      }}
    >
      {/* SECTION HEADER */}
      <div style={{ textAlign: "center", marginBottom: "50px" }}>
        <h2
          style={{
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: "34px",
            fontWeight: "700",
            color: "#2b1a0e",
            marginBottom: "12px",
          }}
        >
          Our Menu
        </h2>
        <div
          style={{
            width: "50px",
            height: "3px",
            backgroundColor: "#2b1a0e",
            margin: "0 auto",
            borderRadius: "2px",
          }}
        />
      </div>

      {/* CARDS GRID */}
      <div
        style={{
          display: "flex",
          gap: "24px",
          justifyContent: "center",
          flexWrap: "wrap",
          maxWidth: "1100px",
          margin: "0 auto 48px",
        }}
      >
        {menuItems.map((item) => (
          <div key={item.id} className="menu-card">
            {/* Image */}
            <div className="menu-card-img-wrap">
              <img
                src={item.image}
                alt={item.name}
                className="menu-card-img"
              />
            </div>

            {/* Body */}
            <div style={{ padding: "16px 18px 20px" }}>
              <h3 className="menu-card-title">
                <span style={{ marginRight: "6px" }}>{item.emoji}</span>
                {item.name}
              </h3>

              <p className="menu-card-desc">{item.description}</p>

              <p className="menu-card-price">Price: {item.price}</p>

              <div style={{ textAlign: "right" }}>
                <button className="menu-order-btn">Order now</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* VIEW MORE */}
      <div style={{ textAlign: "center" }}>
        <button className="menu-view-more">
          View more varieties →
        </button>
      </div>

      <style>{`
        .menu-card {
          background: #ffffff;
          border: 1px solid #e0d8d0;
          border-radius: 14px;
          width: 300px;
          flex-shrink: 0;
          overflow: hidden;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .menu-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 28px rgba(0,0,0,0.09);
        }

        .menu-card-img-wrap {
          width: 100%;
          height: 200px;
          overflow: hidden;
          background: #f9f5f1;
          display: flex;
          align-items: center;
          justify-content: center;
          border-bottom: 1px solid #ede8e2;
        }

        .menu-card-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .menu-card-title {
          font-family: Georgia, serif;
          font-size: 17px;
          font-weight: 700;
          color: #9b5b00;
          margin-bottom: 10px;
        }

        .menu-card-desc {
          font-size: 14px;
          color: #5b5b5b;
          line-height: 1.6;
          margin-bottom: 14px;
          font-family: Georgia, serif;
        }

        .menu-card-price {
          font-size: 14px;
          color: #3f3f3f;
          font-weight: 600;
          font-family: Georgia, serif;
          margin-bottom: 10px;
          text-align: center;
        }

        .menu-order-btn {
          background: transparent;
          border: none;
          color: #2b1a0e;
          font-size: 14px;
          font-weight: 600;
          font-family: Georgia, serif;
          cursor: pointer;
          text-decoration: underline;
          text-underline-offset: 3px;
          padding: 0;
          transition: color 0.2s ease;
        }

        .menu-order-btn:hover {
          color: #9b5b00;
        }

        .menu-view-more {
          background: transparent;
          border: none;
          font-family: Georgia, serif;
          font-size: 15px;
          font-weight: 600;
          color: #2b1a0e;
          cursor: pointer;
          text-decoration: underline;
          text-underline-offset: 4px;
          padding: 0;
          transition: color 0.2s ease;
        }

        .menu-view-more:hover {
          color: #9b5b00;
        }

        @media (max-width: 768px) {
          .menu-card {
            width: 100%;
            max-width: 340px;
          }
        }
      `}</style>
    </section>
  );
}

export default Menu;