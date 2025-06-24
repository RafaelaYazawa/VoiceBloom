import React from "react";
import Header from "./Header";
import Footer from "./Footer";
import Sidebar from "./Sidebar";
import { useStore } from "../../store/store";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isAuthenticated } = useStore();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <div className="flex-1 flex">
        {isAuthenticated && (
          <div className="hidden lg:block w-64 border-r">
            <Sidebar />
          </div>
        )}
        <main className={`flex-1 ${isAuthenticated ? "md:pl-0" : "md:pl-0"}`}>
          <div className="container mx-auto px-4 py-6 max-w-6xl">
            {children}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default Layout;
