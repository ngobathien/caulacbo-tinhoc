import "./App.css";
import { BrowserRouter, useLocation } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import Footer from "./components/layouts/Footer";
import Header from "./components/layouts/Header";
import { useEffect, useState } from "react";

// AppWrapper để dùng useLocation
function AppWrapper() {
  const location = useLocation();

  // Các trang KHÔNG cần Header/Footer
  const noLayoutPaths = ["/login", "/register"];

  // Nếu pathname nằm trong noLayoutPaths thì ẩn Header/Footer
  const isNoLayout = noLayoutPaths.includes(location.pathname);

  // Dark mode state (đẩy lên App để toàn app dùng)
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900 dark:text-gray-100 transition-colors">
      {!isNoLayout && (
        <Header
          className="w-full fixed top-0 left-0 bg-white shadow-md z-50"
          darkMode={darkMode}
          setDarkMode={setDarkMode}
        />
      )}

      <AppRoutes />

      {/* Nếu muốn dùng Footer cũng dark mode, truyền darkMode/setDarkMode nếu cần */}
      {/* {!isNoLayout && (
        <Footer className="w-full bg-gray-900 text-white py-4 mt-auto" />
      )} */}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppWrapper />
    </BrowserRouter>
  );
}

export default App;
