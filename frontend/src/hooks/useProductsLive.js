import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const SOCKET_URL =
  process.env.REACT_APP_SOCKET_URL?.trim() ||
  process.env.REACT_APP_API_BASE_URL?.trim() ||
  "https://api.thelibrarystore.it.com";

export function useProductsLive() {
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

    const onProductsChanged = () => {
      setRefreshKey((prev) => prev + 1);
    };

    socket.on("connect", () => {
      console.log("🟢 Products socket conectado:", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("🔴 Products socket desconectado");
    });

    socket.on("products:changed", onProductsChanged);

    return () => {
      socket.off("products:changed", onProductsChanged);
      socket.disconnect();
    };
  }, []);

  return refreshKey;
}