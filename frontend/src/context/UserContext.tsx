import { createContext, useContext } from "react";

export interface User {
  id: number;
  name: string;
  role: string;
}

interface UserContextType {
  user: User | null | undefined;
  setUser: (user: User | null) => void;
}

export const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
});

export const useUser = () => useContext(UserContext);
