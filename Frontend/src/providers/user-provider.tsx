import { FC, createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

// Define types for user and form data
interface UserType {
  name: string;
  email: string;
}

interface SignUpData {
  fullName: string;
  dob: string;
  email: string;
  otp: string;
}

interface LoginData {
  email: string;
  otp: string;
}

interface UserContextType {
  user: UserType | null;
  signUp: (userData: SignUpData) => Promise<void>;
  logIn: (userData: LoginData) => Promise<void>;
  logOut: () => void;
}

const initialState: UserContextType = {
  user: null,
  signUp: async () => {},
  logIn: async () => {},
  logOut: () => {},
};

export const UserContext = createContext<UserContextType>(initialState);

interface UserProviderProps {
  children: React.ReactNode;
}

const HOST = import.meta.env.VITE_HOST;

const UserProvider: FC<UserProviderProps> = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserType | null>(null);

  // -------------------
  // Signup
  // -------------------
  const signUp = async (userData: SignUpData) => {
    try {
      const response = await fetch(`${HOST}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      const json = await response.json();

      if (json.success && json.authToken && json.user) {
        localStorage.setItem("token", json.authToken);
        localStorage.setItem("user", JSON.stringify(json.user));
        setUser({ name: json.user.name, email: json.user.email });
        toast.success(json.message);
        navigate("/dashboard");
      } else {
        toast.error(json.message || "Signup failed");
      }
    } catch (err) {
      toast.error("Something went wrong while signing up");
    }
  };

  // -------------------
  // Login
  // -------------------
  const logIn = async (userData: LoginData) => {
    try {
      const response = await fetch(`${HOST}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      const json = await response.json();

      if (json.success && json.authToken && json.user) {
        localStorage.setItem("token", json.authToken);
        localStorage.setItem("user", JSON.stringify(json.user));
        setUser({ name: json.user.name, email: json.user.email });
        toast.success(json.message);
        navigate("/dashboard");
      } else {
        toast.error(json.message || "Login failed");
      }
    } catch (err) {
      toast.error("Something went wrong while logging in");
    }
  };

  // -------------------
  // Logout
  // -------------------
  const logOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  // -------------------
  // Load user from localStorage on refresh
  // -------------------
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <UserContext.Provider value={{ user, signUp, logIn, logOut }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;
