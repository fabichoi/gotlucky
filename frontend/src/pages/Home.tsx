import { Link } from "react-router-dom";

export default function Home() {

  const menuItems = [
    {
      title: "스컬킹",
      subtitle: "💀 Skull King",
      description: "예측과 배신의 심리전! 해적들의 카드 게임",
      link: "/skull-king",
      icon: "⚓",
      color: "#0f172a",
      badge: "HOT"
    },
    {
      title: "위자드",
      subtitle: "🧙 Wizard",
      description: "당신의 예지력을 증명하세요! 정통 트릭 테이킹 게임",
      link: "/wizard",
      icon: "✨",
      color: "#7e22ce",
    },
    {
      title: "복권 추첨",
      subtitle: "🎰 Lottery",
      description: "인생은 한 방! 행운의 주인공이 되어보세요",
      link: "/lottery",
      icon: "💎",
      color: "#0284c7",
    },
    {
      title: "사다리 타기",
      subtitle: "🪜 Ladder",
      description: "운명의 사다리! 간편한 내기나 추첨에 딱",
      link: "/ladder",
      icon: "🪜",
      color: "#059669",
    }
  ];

  return (
    <div className="container py-4 fade-in" style={{ maxWidth: "1000px" }}>
      <header className="mb-5 text-center pt-3">
        <h1 className="fw-900 mb-2" style={{ fontSize: "2.2rem", letterSpacing: "-1px" }}>
          오늘은 어떤 행운이 <br /> <span style={{ color: "var(--accent-color)" }}>기다리고 있을까요?</span>
        </h1>
      </header>

      <div className="row g-4">
        {menuItems.map((item, index) => (
          <div className="col-md-6 col-lg-6" key={index}>
            <Link to={item.link} className="text-decoration-none h-100 d-block">
              <div className="glass-card p-4 h-100 position-relative overflow-hidden border-0 shadow-sm hover-lift transition-all">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div
                    className="icon-circle d-flex align-items-center justify-content-center"
                    style={{
                      width: "64px",
                      height: "64px",
                      fontSize: "2rem",
                      background: "rgba(0,0,0,0.04)",
                      borderRadius: "18px"
                    }}
                  >
                    {item.icon}
                  </div>
                  {item.badge && (
                    <span className="badge rounded-pill bg-danger px-3 py-2">
                      {item.badge}
                    </span>
                  )}
                </div>

                <div className="mt-2">
                  <h6 className="text-muted fw-bold mb-1" style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "1px" }}>
                    {item.subtitle}
                  </h6>
                  <h3 className="fw-800 mb-2 text-dark">{item.title}</h3>
                  <p className="text-muted mb-0" style={{ fontSize: "0.95rem", lineHeight: "1.5" }}>
                    {item.description}
                  </p>
                </div>

                <div className="mt-4 d-flex align-items-center fw-bold text-primary" style={{ fontSize: "0.9rem" }}>
                  지금 시작하기 <span className="ms-2">→</span>
                </div>

                {/* Subtle background decoration */}
                <div
                  className="position-absolute"
                  style={{
                    bottom: "-20px",
                    right: "-20px",
                    fontSize: "6rem",
                    opacity: "0.03",
                    transform: "rotate(-15deg)"
                  }}
                >
                  {item.icon}
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>

      <footer className="mt-5 pt-5 pb-3 text-center border-top">
        <p className="small text-muted">
          © 2026 GotLucky. All rights reserved. 🎰
        </p>
      </footer>
    </div>
  );
}
