import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Permite probar el servidor de desarrollo desde el iPhone en la misma red.
  // Para mostrarle la propuesta al cliente usamos igualmente el build de producción.
  allowedDevOrigins: ["192.168.1.187"],
};

export default nextConfig;
