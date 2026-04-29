import { Route, Routes, Navigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import SkullKingHistory from "../pages/SkullKingHistory";
import SkullKingBoard from "../pages/SkullKingBoard";
import SkullKingAdmin from "../pages/SkullKingAdmin";
import Lottery from "../pages/Lottery";
import Profile from "../pages/Profile";
import Policy from "../pages/Policy";
import Results from "../pages/Results";
import SubmitResults from "../pages/SubmitResults";
import ManageGames from "../pages/ManageGames";
import ManageGameTypes from "../pages/ManageGameTypes";
import ManageUsers from "../pages/ManageUsers";
import InviteManager from "../pages/InviteManager";

export default function PrivateRoute() {
  const { user } = useUser();
  const isAdmin = user?.role === "admin";

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Routes>
      {/* General User Protected Routes */}
      <Route path="/" element={<SkullKingHistory />} />
      <Route path="/lottery" element={<Lottery />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/skull-king" element={<SkullKingBoard />} />
      <Route path="/skull-king/admin" element={<SkullKingAdmin />} />
      <Route path="/skull-king/history" element={<SkullKingHistory />} />
      <Route path="/policy" element={<Policy />} />
      <Route path="/results/:id" element={<Results />} />

      {/* Admin Only Routes */}
      {isAdmin && (
        <>
          <Route path="/admin/user" element={<ManageUsers />} />
          <Route path="/admin/submit" element={<SubmitResults />} />
          <Route path="/admin/manage" element={<ManageGames />} />
          <Route path="/admin/manage/types" element={<ManageGameTypes />} />
          <Route path="/admin/invites" element={<InviteManager />} />
          <Route path="/admin" element={<Results />} />
        </>
      )}

      {/* Fallback for unauthorized admin access or unknown routes */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
