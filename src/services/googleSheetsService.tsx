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
      // Preparar payload con datos limpios
      const payload = {
        clienteId: CLIENTE_CONFIG.clienteId,
        clienteNombre: data.nombreNegocio,
        timestamp: new Date().toISOString(),
        fechaLocal: new Date().toLocaleString("es-PA", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        }),
        
        // Información General
        nombreNegocio: data.nombreNegocio,
        industria: data.industria,
        dedicacion: data.dedicacion,
        objetivo: data.objetivo,
        
        // Contacto
        contactoNombre: data.contactoNombre,
        contactoEmail: data.contactoEmail,
        contactoTelefono: data.contactoTelefono,
        contactoCargo: data.contactoCargo,
        
        // Herramientas
        herramientasEmail: data.herramientasEmail || [],
        herramientasVentas: data.herramientasVentas || [],
        herramientasOrganizacion: data.herramientasOrganizacion || [],
        herramientasPagos: data.herramientasPagos || [],
        herramientasSocial: data.herramientasSocial || [],
        herramientasOtras: data.herramientasOtras || '',
        
        // Accesos - IMPORTANTE: Enviar con todas las propiedades
        infoAccesos: (data.infoAccesos || []).map(acceso => ({
          herramienta: acceso.herramienta || '',
          tipoAcceso: acceso.tipoAcceso || '',
          cuenta: acceso.cuenta || '',
          contrasena: acceso.contrasena || '', // ← CRÍTICO: Enviar contraseña
          notasAcceso: acceso.notasAcceso || ''
        })),
        
        // Procesos y Automatizaciones
        procesosActuales: data.procesosActuales || '',
        expectativas: data.expectativas || '',
        puntosDolor: data.puntosDolor || '',
        notasAdicionales: data.notasAdicionales || ''
      };

      console.log("📤 Enviando datos a Google Sheets...");
      console.log("📋 Payload preparado:", {
        ...payload,
        infoAccesos: payload.infoAccesos.map(a => ({
          ...a,
          contrasena: a.contrasena ? '***[OCULTO]***' : 'N/A'
        }))
      });

      const response = await fetch(this.scriptUrl, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      console.log("✅ Datos enviados correctamente");

      // Guardar backup local (sin contraseñas por seguridad)
      const backupData = {
        ...payload,
        infoAccesos: payload.infoAccesos.map(a => ({
          ...a,
          contrasena: '[PROTEGIDO]'
        })),
        backupDate: new Date().toISOString()
      };
      
      localStorage.setItem(
        `backup_datos_${CLIENTE_CONFIG.clienteId}`,
        JSON.stringify(backupData)
      );

      return true;
    } catch (error) {
      console.error("❌ Error al enviar datos:", error);

      // Guardar en cola para reintentar (sin contraseñas)
      this.guardarEnCola(data);

      return false;
    }
  }

  private guardarEnCola(data: DatosNegocio) {
    const cola = JSON.parse(localStorage.getItem("cola_pendiente") || "[]");
    
    // No guardar contraseñas en la cola local por seguridad
    const dataSinContrasenas = {
      ...data,
      infoAccesos: data.infoAccesos.map(a => ({
        ...a,
        contrasena: '[REQUIERE_REINGRESO]'
      }))
    };
    
    cola.push({
      clienteId: CLIENTE_CONFIG.clienteId,
      clienteNombre: data.nombreNegocio,
      data: dataSinContrasenas,
      timestamp: new Date().toISOString(),
      requiereReingreso: true
    });
    
    localStorage.setItem("cola_pendiente", JSON.stringify(cola));
    console.log("💾 Datos guardados en cola para reintento (sin contraseñas por seguridad)");
  }

  async reintentarEnvios(): Promise<number> {
    const cola = JSON.parse(localStorage.getItem("cola_pendiente") || "[]");
    if (cola.length === 0) return 0;

    let exitosos = 0;

    for (let i = cola.length - 1; i >= 0; i--) {
      const item = cola[i];
      
      // Si requiere reingreso de contraseñas, no reintentar automáticamente
      if (item.requiereReingreso) {
        console.log("⚠️ Pendiente requiere reingreso de credenciales");
        continue;
      }
      
      const exito = await this.enviarDatos(item.data);
      if (exito) {
        cola.splice(i, 1);
        exitosos++;
      }
    }

    localStorage.setItem("cola_pendiente", JSON.stringify(cola));
    return exitosos;
  }

  // Método para obtener estadísticas de envío
  obtenerEstadisticas() {
    const backup = localStorage.getItem(`backup_datos_${CLIENTE_CONFIG.clienteId}`);
    const cola = JSON.parse(localStorage.getItem("cola_pendiente") || "[]");
    
    return {
      tieneBackup: !!backup,
      pendientes: cola.length,
      ultimoEnvio: backup ? JSON.parse(backup).backupDate : null
    };
  }

  // Método para limpiar datos locales (útil después de confirmar envío exitoso)
  limpiarDatosLocales() {
    localStorage.removeItem(`mi_negocio_data_${CLIENTE_CONFIG.clienteId}`);
    localStorage.removeItem(`backup_datos_${CLIENTE_CONFIG.clienteId}`);
    localStorage.removeItem("cola_pendiente");
    console.log("🧹 Datos locales limpiados");
  }
}

export const googleSheetsService = new GoogleSheetsService();