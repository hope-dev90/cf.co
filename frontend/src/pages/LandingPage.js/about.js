import { useEffect, useRef } from "react";
import chipsImage from "../../../src/assets/chips.png"; // ✅ correct import

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Lato:wght@300;400;700&display=swap');

  .about-section {
    font-family: 'Lato', sans-serif;
    background: #f5f0eb;
    padding: 48px 40px;
    min-height: 380px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .about-heading {
    font-family: 'Playfair Display', serif;
    font-size: 26px;
    font-weight: 700;
    color: #1a1a1a;
    margin: 0 0 8px;
    text-align: center;
  }

  .heading-rule {
    width: 40px;
    height: 2.5px;
    background: #1a1a1a;
    margin: 0 auto 32px;
    border: none;
  }

  .about-content {
    display: flex;
    align-items: center;
    gap: 32px;
    max-width: 640px;
    width: 100%;
  }

  .about-img-wrap {
    width: 210px;
    height: 220px;
    overflow: hidden;
  }

  .about-img-wrap img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .about-text {
    flex: 1;
  }

  .get-started-btn {
    margin-top: 20px;
    background: #1a0f08;
    color: #fff;
    border: none;
    border-radius: 40px;
    padding: 14px 36px;
    cursor: pointer;
  }
`;

export default function AboutSection() {
  const styleRef = useRef(null);

  useEffect(() => {
    if (!document.getElementById("about-section-styles")) {
      const tag = document.createElement("style");
      tag.id = "about-section-styles";
      tag.textContent = styles;
      document.head.appendChild(tag);
      styleRef.current = tag;
    }
    return () => {
      if (styleRef.current) {
        styleRef.current.remove();
      }
    };
  }, []);

  return (
    <section className="about-section">
      <h2 className="about-heading">About</h2>
      <hr className="heading-rule" />

      <div className="about-content">
        <div className="about-img-wrap">
          <img src={chipsImage} alt="C&F Company dining" />
        </div>

        <div className="about-text">
          <p>
            <strong>C&amp;F Company Limited:</strong> Smart management for seamless dining.
          </p>
          <p>We combine varieties at once.</p>

          <button
            className="get-started-btn"
            onClick={() => alert("Get Started clicked")} // ✅ safe fix
          >
            Get started
          </button>
        </div>
      </div>
    </section>
  );
}