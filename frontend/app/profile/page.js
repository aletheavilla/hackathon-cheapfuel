"use client";

import { useEffect, useState } from "react";
import Profile from "../../components/Profile";

export default function ProfilePage() {
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

  return <Profile user={user} setUser={setUser} onLogout={handleLogout} />;
}


