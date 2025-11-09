// src/config/clienteConfig.ts

export const CLIENTE_CONFIG = {
  clienteId: import.meta.env.VITE_CLIENT_ID || "cliente_demo",
  clienteNombre: import.meta.env.VITE_CLIENT_NAME || "Cliente Demo",
  logoUrl: import.meta.env.VITE_LOGO_URL || "",
};
