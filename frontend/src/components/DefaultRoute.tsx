import { Navigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { JSX } from "react";

export default function DefaultRoute({ children }: { children: JSX.Element }) {
  const { user } = useUser();

  if (user === undefined) return null;

  if (!user) {
    return <Navigate to="/login" replace />;    
  }

  return children;
}
