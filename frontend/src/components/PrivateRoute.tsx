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
import LadderBoard from "../pages/LadderBoard";
import WizardBoard from "../pages/WizardBoard";
import WizardAdmin from "../pages/WizardAdmin";
import WizardHistory from "../pages/WizardHistory";

import Home from "../pages/Home";

export default function PrivateRoute() {
  const { user } = useUser();
  const isAdmin = user?.role === "admin";

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Routes>
      {/* General User Protected Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/lottery" element={<Lottery />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/skull-king" element={<SkullKingBoard />} />
      <Route path="/ladder" element={<LadderBoard />} />
      <Route path="/wizard" element={<WizardBoard />} />
      <Route path="/wizard/history" element={<WizardHistory />} />
      <Route path="/skull-king/history" element={<SkullKingHistory />} />
      <Route path="/policy" element={<Policy />} />
      <Route path="/results/:id" element={<Results />} />

      {/* Admin Only Routes */}
      {isAdmin && (
        <>
          <Route path="/skull-king/admin" element={<SkullKingAdmin />} />
          <Route path="/wizard/admin" element={<WizardAdmin />} />
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
