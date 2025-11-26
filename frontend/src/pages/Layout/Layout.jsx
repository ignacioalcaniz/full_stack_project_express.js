import { Navbar } from "../../components/NavBar/NavBar";
import { Outlet } from "react-router-dom";
import { Footer } from "../../components/footer/Footer";

export const Layout = () => {
  return (
    <>
      <Navbar />
      <div className="page-container">
        <Outlet />
        <Footer />
      </div>
    </>
  );
};
