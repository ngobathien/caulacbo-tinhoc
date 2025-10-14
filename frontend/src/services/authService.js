import axios from "axios";

const auth = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 100000,
  headers: { "Content-Type": "application/json" },
});

export const register = async (userData) => {
  try {
    const response = await auth.post("/auth/register", userData);

    return response.data;
  } catch (error) {
    console.error("Error during registration:", error);
    throw error;
  }
};

export const login = async (userData) => {
  try {
    const response = await auth.post("/auth/login", userData);
    return response.data;
  } catch (error) {
    console.error("Error during login:", error);
    throw error;
  }
};
