import { Outlet } from "react-router-dom";
import Header from "./components/";
import Footer from "./components/Footer";

const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto p-4">
        <Outlet /> {/* Đây sẽ hiển thị nội dung của từng trang */}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
