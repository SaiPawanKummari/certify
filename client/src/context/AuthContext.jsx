import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("certify_user");

    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem("certify_user");
      }
    }

    setLoading(false);
  }, []);

  const register = async (name, email, password) => {
    const response = await api.post("/auth/register", {
      name,
      email,
      password,
    });

    const { token, user } = response.data;

    localStorage.setItem("certify_token", token);
    localStorage.setItem(
      "certify_user",
      JSON.stringify(user)
    );

    setUser(user);

    return user;
  };

  const login = async (email, password) => {
    const response = await api.post("/auth/login", {
      email,
      password,
    });

    const { token, user } = response.data;

    localStorage.setItem("certify_token", token);
    localStorage.setItem(
      "certify_user",
      JSON.stringify(user)
    );

    setUser(user);

    return user;
  };

  const logout = () => {
    localStorage.removeItem("certify_token");
    localStorage.removeItem("certify_user");

    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        register,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}