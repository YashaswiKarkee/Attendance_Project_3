// app/layout.tsx
import React from "react";
import Navbar from "@/app/components/navbar";

const Layout: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  return (
    <div>
      <Navbar />
      <main>{children}</main>
    </div>
  );
};

export default Layout;
