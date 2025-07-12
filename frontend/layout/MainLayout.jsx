// src/layout/MainLayout.jsx
import Navbar from "@/components/Navbar2";

const MainLayout = ({ children }) => {
  return (
    <>
      <Navbar />
      <main className="pt-20 px-4 md:px-10 max-w-7xl mx-auto">{children}</main>
    </>
  );
};

export default MainLayout;
