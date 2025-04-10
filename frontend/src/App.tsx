import {
  BrowserRouter as Router,
  Route,
  Routes,
  Link,
  useLocation,
} from "react-router-dom";
import Home from "./pages/Home";
import Results from "./pages/Results";
import SubmitResults from "./pages/SubmitResults";
import ManageGames from "./pages/ManageGames";
import ManageGameTypes from "./pages/ManageGameTypes";
import ManageUsers from "./pages/ManageUsers";
import { useMemo } from "react";

function App() {
  const location = useLocation();
  const isAdmin = useMemo(
    () => new URLSearchParams(location.search).has("admin"),
    [location.search]
  );

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary px-4">
        <div className="container-fluid" style={{ maxWidth: "1920px" }}>
          <Link className="navbar-brand me-3" to="/">
            🎯 게임
          </Link>
          <div className="navbar-nav flex-row gap-2">
            {isAdmin && (
              <Link className="nav-link text-white px-2" to="/user?admin">
                👤 유저 관리
              </Link>
            )}
            {isAdmin && (
              <Link className="nav-link text-white px-2" to="/submit?admin">
                🛠️ 결과 기록
              </Link>
            )}
            {isAdmin && (
              <Link className="nav-link text-white px-2" to="/manage?admin">
                🧩 게임 관리
              </Link>
            )}
            {isAdmin && (
              <Link className="nav-link text-white px-2" to="/?admin">
                📊 결과 보기
              </Link>
            )}
          </div>
        </div>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        {isAdmin && <Route path="/user" element={<ManageUsers />} />}
        {isAdmin && <Route path="/submit" element={<SubmitResults />} />}
        {isAdmin && <Route path="/manage" element={<ManageGames />} />}
        {isAdmin && (
          <Route path="/manage/types" element={<ManageGameTypes />} />
        )}
        <Route path="/results/:id" element={<Results />} />
      </Routes>
    </>
  );
}

export default function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}
