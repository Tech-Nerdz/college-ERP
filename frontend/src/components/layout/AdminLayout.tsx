import React from "react";

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", padding: 32 }}>
      <header style={{ marginBottom: 32 }}>
        <h2 style={{ fontWeight: 700, fontSize: 24 }}>Admin Panel</h2>
      </header>
      <main>{children}</main>
    </div>
  );
};

export { AdminLayout };
