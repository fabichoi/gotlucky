import { Route, Routes, Link, useLocation } from "react-router-dom";
import { useUser } from "./context/UserContext";
import Login from "./pages/Login";
import PrivateRoute from "./components/PrivateRoute";
import DefaultRoute from "./components/DefaultRoute";
import LoadingSpinner from "./components/LoadingSpinner";
import Logout from "./pages/Logout";

function App() {
  const { user } = useUser();
  const isAdmin = user?.role === "admin";

  if (user === undefined) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary px-4">
        <div className="container-fluid" style={{ maxWidth: "1920px" }}>
          <Link className="navbar-brand me-3" to="/">
            🎯 게임
          </Link>
          <div className="navbar-nav flex-row gap-2">
            <Link className="nav-link text-white px-2" to="/policy">
              ⚖️ 정책
            </Link>
            {isAdmin && (
              <>
                <Link className="nav-link text-white px-2" to="/admin/user">
                  👤 유저 관리
                </Link>
                <Link className="nav-link text-white px-2" to="/admin/submit">
                  🛠️ 결과 기록
                </Link>
                <Link className="nav-link text-white px-2" to="/admin/manage">
                  🧩 게임 관리
                </Link>
                <Link
                  className="nav-link text-white px-2"
                  to="/admin/manage/types"
                >
                  🎲 게임 타입
                </Link>
                <Link className="nav-link text-white px-2" to="/admin">
                  📊 결과 보기
                </Link>
              </>
            )}
            <Link to="/logout" className="nav-link text-white px-2">
              🚪 로그아웃
            </Link>
          </div>
        </div>
      </nav>

      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/logout" element={<Logout />} />
        <Route
          path="/*"
          element={
            <PrivateRoute>
              <DefaultRoute />
            </PrivateRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;
