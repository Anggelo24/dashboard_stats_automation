// src/services/googleSheetsService.ts

import { CLIENTE_CONFIG } from "../config/clienteConfig";

export interface DatosNegocio {
  // Paso 1: Información General
  nombreNegocio: string;
  industria: string;
  dedicacion: string;
  objetivo: string;
  contactoNombre: string;
  contactoEmail: string;
  contactoTelefono: string;
  contactoCargo: string;

  // Paso 2: Herramientas
  herramientasEmail: string[];
  herramientasVentas: string[];
  herramientasOrganizacion: string[];
  herramientasPagos: string[];
  herramientasSocial: string[];
  herramientasOtras: string;

  // Paso 3: Detalles de Herramientas
  detallesHerramientas: {
    nombre: string;
    categoria: string;
    url: string;
    plan: string;
    usuarioAdmin: string;
    tieneAPI: boolean;
  }[];

  // Paso 4: Accesos
  infoAccesos: {
    herramienta: string;
    cuenta: string;
    contrasena: string;
    tipoAcceso: string;
    notasAcceso: string;
  }[];

  // Paso 5: Requisitos Técnicos
  volumenDatos: string;
  requestsDia: string;
  horarioOperacion: string;
  slaEsperado: string;
  requiere2FA: boolean;
  restriccionesSeguridad: string;

  // Paso 6: Detalles Finales
  procesosActuales: string;
  puntosDolor: string;
  expectativas: string;
  cuandoEmpezar: string;
  presupuestoAproximado: string;
  notasAdicionales: string;
}

class GoogleSheetsService {
  private scriptUrl = import.meta.env.VITE_GOOGLE_SHEETS_URL || "";

  async enviarDatos(data: DatosNegocio): Promise<boolean> {
    try {
      const payload = {
        clienteId: CLIENTE_CONFIG.clienteId,
        clienteNombre: data.nombreNegocio, // Use the business name from the form
        timestamp: new Date().toISOString(),
        fechaLocal: new Date().toLocaleString("es-PA", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        }),
        ...data,
      };

      console.log("📤 Enviando datos a Google Sheets...", payload);

      await fetch(this.scriptUrl, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      console.log("✅ Datos enviados correctamente");

      // Guardar backup local
      localStorage.setItem(
        `backup_datos_${CLIENTE_CONFIG.clienteId}`,
        JSON.stringify(payload)
      );

      return true;
    } catch (error) {
      console.error("❌ Error al enviar datos:", error);

      // Guardar en cola para reintentar
      this.guardarEnCola(data);

      return false;
    }
  }

  private guardarEnCola(data: DatosNegocio) {
    const cola = JSON.parse(localStorage.getItem("cola_pendiente") || "[]");
    cola.push({
      clienteId: CLIENTE_CONFIG.clienteId,
      clienteNombre: data.nombreNegocio, // Use the business name from the form
      data,
      timestamp: new Date().toISOString(),
    });
    localStorage.setItem("cola_pendiente", JSON.stringify(cola));
    console.log("💾 Datos guardados en cola para reintento");
  }

  async reintentarEnvios(): Promise<number> {
    const cola = JSON.parse(localStorage.getItem("cola_pendiente") || "[]");
    if (cola.length === 0) return 0;

    let exitosos = 0;

    for (let i = cola.length - 1; i >= 0; i--) {
      const exito = await this.enviarDatos(cola[i].data);
      if (exito) {
        cola.splice(i, 1);
        exitosos++;
      }
    }

    localStorage.setItem("cola_pendiente", JSON.stringify(cola));
    return exitosos;
  }
}

export const googleSheetsService = new GoogleSheetsService();