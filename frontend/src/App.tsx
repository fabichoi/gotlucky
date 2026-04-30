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
      <nav className="navbar navbar-expand-lg glass-nav fixed-top px-2 py-2">
        <div className="container-fluid" style={{ maxWidth: "1200px" }}>
          <Link className="navbar-brand d-flex align-items-center" to="/" style={{ color: "var(--primary-color)", fontSize: "1.2rem" }}>
            <span className="me-1">🎯</span> GotLucky
          </Link>
          
          <div className="navbar-nav ms-auto flex-row align-items-center gap-1 gap-md-3">
            {user ? (
              <>
                <Link className="nav-link px-1 small-nav-link" to="/lottery">
                  🎲 추첨
                </Link>
                <Link className="nav-link px-1 small-nav-link" to="/skull-king">
                  💀 스컬킹
                </Link>
                <Link className="nav-link px-1 small-nav-link" to="/skull-king/history">
                  📜 전적
                </Link>
                {isAdmin && (
                  <div className="dropdown">
                    <button 
                      className="nav-link px-1 dropdown-toggle border-0 bg-transparent small-nav-link" 
                      type="button" 
                      id="adminDropdown" 
                      data-bs-toggle="dropdown" 
                      aria-expanded="false"
                      style={{ color: "var(--accent-color)", fontWeight: "600" }}
                    >
                      🛠️
                    </button>
                    <ul className="dropdown-menu dropdown-menu-end glass-card border-0 shadow-lg mt-2" aria-labelledby="adminDropdown">
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
                <Link className="nav-link px-1 small-nav-link" to="/profile">
                  📕
                </Link>
                <Link to="/logout" className="nav-link px-1 text-danger small-nav-link">
                  🚪
                </Link>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-link px-2" style={{ color: "var(--text-main)" }}>
                  🔐 로그인
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm ms-1">
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
