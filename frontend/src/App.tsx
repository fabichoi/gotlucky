import { Route, Routes, Link } from "react-router-dom";
import { useUser } from "./context/UserContext";
import Login from "./pages/Login";
import Logout from "./pages/Logout";
import Register from "./pages/Register";
import PrivateRoute from "./components/PrivateRoute";
import DefaultRoute from "./components/DefaultRoute";
import LoadingSpinner from "./components/LoadingSpinner";

function App() {
  const { user } = useUser();
  const isAdmin = user?.role === "admin";

  if (user === undefined) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <nav className="navbar glass-nav fixed-top px-3 py-1">
        <div className="container-fluid px-0" style={{ maxWidth: "1200px", display: 'flex', flexWrap: 'nowrap', alignItems: 'center' }}>
          <Link className="navbar-brand d-flex align-items-center" to="/" style={{ flexShrink: 0 }}>
            <span className="me-1">🎯</span> GotLucky
          </Link>
          
          <div className="gn-nav-list ms-auto d-flex align-items-center flex-nowrap">
            {user ? (
              <>
                {/* 게임 드롭다운 */}
                <div className="dropdown gn-dropdown">
                  <button
                    className="nav-link px-2 dropdown-toggle border-0 bg-transparent gn-link d-flex align-items-center"
                    type="button"
                    data-bs-toggle="dropdown"
                    data-bs-offset="0,4"
                    data-bs-boundary="viewport"
                    aria-expanded="false"
                  >
                    <span className="gn-icon">🎮</span> <span className="gn-text">게임</span>
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end glass-card border-0 shadow-lg mt-1">
                    <li><Link className="dropdown-item py-2" to="/skull-king">💀 스컬킹</Link></li>
                    <li><Link className="dropdown-item py-2" to="/wizard">🧙 위자드</Link></li>
                  </ul>
                </div>

                {/* 추첨 드롭다운 */}
                <div className="dropdown gn-dropdown">
                  <button
                    className="nav-link px-2 dropdown-toggle border-0 bg-transparent gn-link d-flex align-items-center"
                    type="button"
                    data-bs-toggle="dropdown"
                    data-bs-offset="0,4"
                    data-bs-boundary="viewport"
                    aria-expanded="false"
                  >
                    <span className="gn-icon">🎲</span> <span className="gn-text">추첨</span>
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end glass-card border-0 shadow-lg mt-1">
                    <li><Link className="dropdown-item py-2" to="/lottery">🎰 복권</Link></li>
                    <li><Link className="dropdown-item py-2" to="/ladder">🪜 사다리</Link></li>
                  </ul>
                </div>

                {/* 포인트 */}
                <div className="d-flex align-items-center px-1">
                  <span className="badge rounded-pill gn-badge fw-bold" style={{ background: "var(--primary-color)", whiteSpace: "nowrap" }}>
                    ⭐ {user.points.toLocaleString()}
                  </span>
                </div>

                {isAdmin && (
                  <div className="dropdown gn-dropdown">
                    <button
                      className="nav-link px-2 dropdown-toggle border-0 bg-transparent gn-link"
                      type="button"
                      data-bs-toggle="dropdown"
                      data-bs-offset="0,4"
                      data-bs-boundary="viewport"
                      aria-expanded="false"
                      style={{ color: "var(--accent-color)", fontWeight: "600" }}
                    >
                      🛠️
                    </button>
                    <ul className="dropdown-menu dropdown-menu-end glass-card border-0 shadow-lg mt-1">
                      <li><Link className="dropdown-item py-2" to="/admin/user">👤 유저 관리</Link></li>
                      <li><Link className="dropdown-item py-2" to="/admin/submit">📝 결과 기록</Link></li>
                      <li><Link className="dropdown-item py-2" to="/admin/manage">🧩 게임 관리</Link></li>
                      <li><Link className="dropdown-item py-2" to="/admin/manage/types">🎲 게임 타입</Link></li>
                      <li><Link className="dropdown-item py-2" to="/admin/invites">🎟️ 초대 코드 관리</Link></li>
                      <li><hr className="dropdown-divider" /></li>
                      <li><Link className="dropdown-item py-2" to="/admin">📊 결과 보기</Link></li>
                    </ul>
                  </div>
                )}
                {/* 유저 드롭다운 */}
                <div className="dropdown gn-dropdown">
                  <button
                    className="nav-link px-2 dropdown-toggle border-0 bg-transparent gn-link d-flex align-items-center"
                    type="button"
                    data-bs-toggle="dropdown"
                    data-bs-offset="0,4"
                    data-bs-boundary="viewport"
                    aria-expanded="false"
                  >
                    <span className="gn-icon" style={{ marginRight: 0 }}>👤</span>
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end glass-card border-0 shadow-lg mt-1">
                    <li><Link className="dropdown-item py-2" to="/profile">👤 내정보 관리</Link></li>
                    <li><hr className="dropdown-divider" /></li>
                    <li><Link className="dropdown-item py-2 fw-bold" to="/logout" style={{ color: 'var(--primary-color)' }}>🚪 로그아웃</Link></li>
                  </ul>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-link px-2 gn-link">
                  🔐 로그인
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm ms-2 py-1 px-3" style={{ fontSize: '0.8rem' }}>
                  가입
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
      <div style={{ height: "80px" }}></div> {/* Spacer for fixed navbar */}

      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/*"
          element={
            <DefaultRoute>
              <PrivateRoute />
            </DefaultRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;
