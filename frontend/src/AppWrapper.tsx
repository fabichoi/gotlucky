import { useEffect, useState } from "react";
import { UserContext } from "./context/UserContext";
import App from "./App";
import { User } from "./context/UserContext";
import { BrowserRouter as Router } from "react-router-dom";
import { getCurrentUser } from "./api/gameApi";

export default function AppWrapper() {
  const [user, setUser] = useState<User | null | undefined>(undefined);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return setUser(null);

    getCurrentUser()
      .then(setUser)
      .catch(() => setUser(null));
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      <Router>
        <App />
      </Router>
    </UserContext.Provider>
  );
}
