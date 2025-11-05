"use client";

import { useEffect, useState } from "react";
import Dashboard from "../../components/Dashboard";

export default function DashboardPage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return <Dashboard user={user} onLogout={handleLogout} />;
}


