import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const SOCKET_URL =
  process.env.REACT_APP_SOCKET_URL?.trim() ||
  process.env.REACT_APP_API_BASE_URL?.trim() ||
  "https://api.thelibrarystore.it.com";

export function useDashboardLive() {
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      secure: true,
    });

    const handleDashboardChanged = () => {
      setRefreshKey((prev) => prev + 1);
    };

    socket.on("connect", () => {
      console.log("🟢 Dashboard socket conectado:", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("🔴 Dashboard socket desconectado");
    });

    socket.on("dashboard:changed", handleDashboardChanged);

    return () => {
      socket.off("dashboard:changed", handleDashboardChanged);
      socket.disconnect();
    };
  }, []);

  return refreshKey;
}