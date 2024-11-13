// app/layout.tsx
import React from "react";
import Navbar from "@/app/components/navbar";
import Sidebar from "@/app/components/sidebar";

const Layout: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 bg-gray-50">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
