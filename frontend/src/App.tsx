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
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary px-4">
        <div className="container-fluid" style={{ maxWidth: "1920px" }}>
          <Link className="navbar-brand me-3" to="/">
            🎯 GotLucky
          </Link>
          <div className="navbar-nav flex-row gap-2">
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
            {user ? (
              <>
                <Link className="nav-link text-white px-2" to="/policy">
                  ⚖️ 정책
                </Link>
                <Link to="/logout" className="nav-link text-white px-2">
                  🚪 로그아웃
                </Link>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-link text-white px-2">
                  🔐 로그인
                </Link>
                <Link to="/register" className="nav-link text-white px-2">
                  🗄️ 회원가입
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

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
