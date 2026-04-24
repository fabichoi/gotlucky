import { Route, Routes } from "react-router-dom";
import SkullKingHistory from "../pages/SkullKingHistory";
import Policy from "../pages/Policy";
import Results from "../pages/Results";
import SubmitResults from "../pages/SubmitResults";
import ManageGames from "../pages/ManageGames";
import ManageGameTypes from "../pages/ManageGameTypes";
import ManageUsers from "../pages/ManageUsers";

export default function PrivateRoute() {
  return (
    <Routes>
      <Route path="/" element={<SkullKingHistory />} />
      <Route path="/policy" element={<Policy />} />
      <Route path="/results/:id" element={<Results />} />
      <Route path="/admin/user" element={<ManageUsers />} />
      <Route path="/admin/submit" element={<SubmitResults />} />
      <Route path="/admin/manage" element={<ManageGames />} />
      <Route path="/admin/manage/types" element={<ManageGameTypes />} />
    </Routes>
  );
}
