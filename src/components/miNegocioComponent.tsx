// src/components/MiNegocioComponent.tsx

import { useState, useEffect, FormEvent } from "react";
import { googleSheetsService, DatosNegocio } from "../services/googleSheetsService";
import { CLIENTE_CONFIG } from "../config/clienteConfig";
import { useToast } from "../utils/toastManager";
import { Mail, ShoppingCart, LayoutGrid, CreditCard, Share2, Lock, ClipboardList, Check, Info, Building2, ArrowRight, ArrowLeft } from "lucide-react";
import "../style/mi-negocio.css";

interface MiNegocioComponentProps {
  onComplete: (nombreContacto: string) => void;
}

const MiNegocioComponent = ({ onComplete }: MiNegocioComponentProps) => {
  const [paso, setPaso] = useState(1);
  const [enviando, setEnviando] = useState(false);
  const { showToast } = useToast();

  // Estados para manejar "Otro" en cada categoría
  const [otroEmail, setOtroEmail] = useState("");
  const [otroVentas, setOtroVentas] = useState("");
  const [otroOrganizacion, setOtroOrganizacion] = useState("");
  const [otroPagos, setOtroPagos] = useState("");
  const [otroSocial, setOtroSocial] = useState("");

  const [formData, setFormData] = useState<DatosNegocio>({
    nombreNegocio: "",
    industria: "",
    dedicacion: "",
    objetivo: "",
    contactoNombre: "",
    contactoEmail: "",
    contactoTelefono: "",
    contactoCargo: "",
    herramientasEmail: [],
    herramientasVentas: [],
    herramientasOrganizacion: [],
    herramientasPagos: [],
    herramientasSocial: [],
    herramientasOtras: "",
    detallesHerramientas: [],
    infoAccesos: [],
    volumenDatos: "",
    requestsDia: "",
    horarioOperacion: "",
    slaEsperado: "",
    requiere2FA: false,
    restriccionesSeguridad: "",
    procesosActuales: "",
    puntosDolor: "",
    expectativas: "",
    cuandoEmpezar: "",
    presupuestoAproximado: "",
    notasAdicionales: "",
  });

  const totalPasos = 4;
  const progreso = (paso / totalPasos) * 100;

  useEffect(() => {
    const savedData = localStorage.getItem(`mi_negocio_data_${CLIENTE_CONFIG.clienteId}`);
    if (savedData) {
      const parsedData = JSON.parse(savedData) as DatosNegocio;
      // Migrar datos antiguos: agregar campo contrasena si no existe
      if (parsedData.infoAccesos && parsedData.infoAccesos.length > 0) {
        parsedData.infoAccesos = parsedData.infoAccesos.map((acceso) => ({
          herramienta: acceso.herramienta || '',
          cuenta: acceso.cuenta || '',
          contrasena: acceso.contrasena || '',
          tipoAcceso: acceso.tipoAcceso || '',
          notasAcceso: acceso.notasAcceso || ''
        }));
      }
      setFormData(parsedData);
    }
  }, []);

  const guardarDatosLocal = () => {
    localStorage.setItem(`mi_negocio_data_${CLIENTE_CONFIG.clienteId}`, JSON.stringify(formData));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    siguientePaso();
  };

  const validateCurrentStep = (): boolean => {
    if (paso === 1) {
      // Validar campos básicos
      if (!(
        formData.nombreNegocio &&
        formData.industria &&
        formData.dedicacion &&
        formData.objetivo &&
        formData.contactoNombre &&
        formData.contactoEmail &&
        formData.contactoTelefono &&
        formData.contactoCargo
      )) {
        return false;
      }

      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.contactoEmail)) {
        showToast("Por favor ingresa un email válido (ejemplo: usuario@dominio.com)", "warning");
        return false;
      }

      // Validar formato de teléfono (permitir +, espacios, guiones y números)
      const telefonoLimpio = formData.contactoTelefono.replace(/[\s\-\(\)]/g, '');
      const telefonoRegex = /^[\+]?[0-9]{7,15}$/;
      if (!telefonoRegex.test(telefonoLimpio)) {
        showToast("Por favor ingresa un teléfono válido (ejemplo: +507 6000-0000)", "warning");
        return false;
      }

      return true;
    }
    if (paso === 2) {
      // Validar que se haya seleccionado al menos una herramienta
      const tieneHerramientas =
        formData.herramientasEmail.length > 0 ||
        formData.herramientasVentas.length > 0 ||
        formData.herramientasOrganizacion.length > 0 ||
        formData.herramientasPagos.length > 0 ||
        formData.herramientasSocial.length > 0;

      if (!tieneHerramientas) {
        showToast("Debes seleccionar al menos una herramienta", "warning");
        return false;
      }

      // Validar que si seleccionaron "Otro", hayan especificado cuál
      if (formData.herramientasEmail.includes('Otro') && !otroEmail.trim()) {
        showToast("Por favor especifica qué otra herramienta de Email usas", "warning");
        return false;
      }
      if (formData.herramientasVentas.includes('Otro') && !otroVentas.trim()) {
        showToast("Por favor especifica qué otra herramienta de Ventas usas", "warning");
        return false;
      }
      if (formData.herramientasOrganizacion.includes('Otro') && !otroOrganizacion.trim()) {
        showToast("Por favor especifica qué otra herramienta de Organización usas", "warning");
        return false;
      }
      if (formData.herramientasPagos.includes('Otro') && !otroPagos.trim()) {
        showToast("Por favor especifica qué otra herramienta de Pagos usas", "warning");
        return false;
      }
      if (formData.herramientasSocial.includes('Otro') && !otroSocial.trim()) {
        showToast("Por favor especifica qué otra herramienta de Redes Sociales usas", "warning");
        return false;
      }

      return true;
    }
    if (paso === 3) {
      // Validar que todos los accesos tengan la información requerida
      if (formData.infoAccesos.length === 0) {
        showToast("Debes proporcionar al menos un acceso", "warning");
        return false;
      }

      for (let i = 0; i < formData.infoAccesos.length; i++) {
        const acceso = formData.infoAccesos[i];

        // Validar que tenga herramienta y tipo de acceso
        if (!acceso.herramienta || !acceso.tipoAcceso) {
          showToast(`Por favor completa la información de ${acceso.herramienta || 'la herramienta'}`, "warning");
          return false;
        }

        // Si eligió "compartir", necesita usuario/email Y contraseña
        if (acceso.tipoAcceso === 'compartir') {
          if (!acceso.cuenta) {
            showToast(`Por favor ingresa el usuario/email de ${acceso.herramienta}`, "warning");
            return false;
          }
          if (!acceso.contrasena) {
            showToast(`Por favor ingresa la contraseña de ${acceso.herramienta}`, "warning");
            return false;
          }
        }
      }

      return true;
    }
    if (paso === 4) {
      return !!(
        formData.procesosActuales &&
        formData.expectativas &&
        formData.puntosDolor
      );
    }
    return true;
  };

  const siguientePaso = () => {
    if (!validateCurrentStep()) {
      showToast("Por favor completa todos los campos requeridos", "warning");
      return;
    }

    guardarDatosLocal();

    // Si vamos al Paso 3, cargar automáticamente las herramientas seleccionadas
    if (paso === 2) {
      const herramientasSeleccionadas = [
        ...formData.herramientasEmail,
        ...formData.herramientasVentas,
        ...formData.herramientasOrganizacion,
        ...formData.herramientasPagos,
        ...formData.herramientasSocial
      ].filter(h => h !== 'Otro');

      // Agregar las herramientas personalizadas de "Otro"
      const herramientasOtro = [];
      if (formData.herramientasEmail.includes('Otro') && otroEmail.trim()) {
        herramientasOtro.push(otroEmail.trim());
      }
      if (formData.herramientasVentas.includes('Otro') && otroVentas.trim()) {
        herramientasOtro.push(otroVentas.trim());
      }
      if (formData.herramientasOrganizacion.includes('Otro') && otroOrganizacion.trim()) {
        herramientasOtro.push(otroOrganizacion.trim());
      }
      if (formData.herramientasPagos.includes('Otro') && otroPagos.trim()) {
        herramientasOtro.push(otroPagos.trim());
      }
      if (formData.herramientasSocial.includes('Otro') && otroSocial.trim()) {
        herramientasOtro.push(otroSocial.trim());
      }

      // Combinar todas las herramientas
      const todasLasHerramientas = [...herramientasSeleccionadas, ...herramientasOtro];

      // Crear un acceso por cada herramienta seleccionada
      const nuevosAccesos = todasLasHerramientas.map(herramienta => ({
        herramienta,
        cuenta: '',
        contrasena: '',
        tipoAcceso: '',
        notasAcceso: ''
      }));

      setFormData(prevData => ({
        ...prevData,
        infoAccesos: nuevosAccesos
      }));
    }

    if (paso < totalPasos) {
      setPaso(paso + 1);
      window.scrollTo(0, 0);
    } else {
      finalizar();
    }
  };

  const pasoAnterior = () => {
    if (paso > 1) {
      setPaso(paso - 1);
      window.scrollTo(0, 0);
    }
  };

  const finalizar = async () => {
    setEnviando(true);
    guardarDatosLocal();

    try {
      console.log("🚀 Iniciando envío de datos...");
      console.log("📦 Datos a enviar:", formData);

      const exito = await googleSheetsService.enviarDatos(formData);

      if (exito) {
        console.log("✅ Datos enviados exitosamente");
        showToast("¡Información enviada correctamente! Nos pondremos en contacto pronto.", "success");
        onComplete(formData.contactoNombre);
      } else {
        console.log("⚠️ El servicio retornó false");
        showToast("Hubo un problema al enviar. No te preocupes, tus datos están guardados.", "warning");
        onComplete(formData.contactoNombre);
      }
    } catch (error) {
      console.error("❌ Error al enviar:", error);
      showToast("Error al enviar. Tus datos están guardados de forma segura.", "error");
      onComplete(formData.contactoNombre);
    } finally {
      setEnviando(false);
    }
  };

  const handleInputChange = (field: keyof DatosNegocio, value: any) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleCheckboxChange = (categoria: keyof DatosNegocio, valor: string) => {
    const array = formData[categoria] as string[];
    if (array.includes(valor)) {
      setFormData({
        ...formData,
        [categoria]: array.filter((item) => item !== valor),
      });
    } else {
      setFormData({
        ...formData,
        [categoria]: [...array, valor],
      });
    }
  };

  const actualizarAcceso = (index: number, campo: string, valor: string) => {
    const nuevosAccesos = [...formData.infoAccesos];
    nuevosAccesos[index] = { ...nuevosAccesos[index], [campo]: valor };
    setFormData({ ...formData, infoAccesos: nuevosAccesos });
  };

  return (
    <div className="mi-negocio-component">
      {/* Progress Bar */}
      <div className="progress-container">
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progreso}%` }}></div>
        </div>
        <div className="progress-text">
          Paso {paso} de {totalPasos} • {Math.round(progreso)}% completado
        </div>
      </div>

      {/* Steps Indicator */}
      <div className="steps-indicator">
        {[
          { num: 1, label: "Información Básica", icon: <Building2 size={20} /> },
          { num: 2, label: "Herramientas", icon: <LayoutGrid size={20} /> },
          { num: 3, label: "Accesos", icon: <Lock size={20} /> },
          { num: 4, label: "Automatizaciones", icon: <ClipboardList size={20} /> },
        ].map((step, index) => (
          <div key={step.num} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            {index > 0 && <div className="step-line"></div>}
            <div className={`step ${paso >= step.num ? "active" : ""}`}>
              <div className="step-number">
                {paso > step.num ? <Check size={20} /> : step.icon}
              </div>
              <div className="step-label">{step.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit} autoComplete="off">
        <div className="paso-content">
          {/* PASO 1: Información Básica */}
          {paso === 1 && (
            <div className="paso-wrapper">
              <h2>Información Básica</h2>
              <p className="paso-description">
                Cuéntanos sobre tu negocio y cómo contactarte
              </p>

              <div className="form-group">
                <label>Nombre del Negocio <span className="required">*</span></label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.nombreNegocio}
                  onChange={(e) => handleInputChange('nombreNegocio', e.target.value)}
                  placeholder="Ej: Tienda La Favorita"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Industria/Sector <span className="required">*</span></label>
                  <select
                    className="form-select"
                    value={formData.industria}
                    onChange={(e) => handleInputChange('industria', e.target.value)}
                  >
                    <option value="">Selecciona una industria</option>
                    <option value="retail">Retail / Tienda física</option>
                    <option value="ecommerce">E-commerce / Tienda en línea</option>
                    <option value="restaurante">Restaurante / Food & Beverage</option>
                    <option value="servicios-profesionales">Servicios Profesionales (Abogados, Contadores, etc.)</option>
                    <option value="salud">Salud / Clínicas / Farmacias</option>
                    <option value="educacion">Educación / Academia / Cursos</option>
                    <option value="tecnologia">Tecnología / Software</option>
                    <option value="belleza">Belleza / Spa / Peluquería</option>
                    <option value="construccion">Construcción / Arquitectura</option>
                    <option value="bienes-raices">Bienes Raíces / Inmobiliaria</option>
                    <option value="transporte">Transporte / Logística</option>
                    <option value="turismo">Turismo / Hotelería</option>
                    <option value="financiero">Servicios Financieros / Seguros</option>
                    <option value="manufactura">Manufactura / Producción</option>
                    <option value="agricultura">Agricultura / Agro</option>
                    <option value="marketing">Marketing / Publicidad</option>
                    <option value="fitness">Fitness / Gimnasio</option>
                    <option value="entretenimiento">Entretenimiento / Eventos</option>
                    <option value="automotriz">Automotriz / Taller</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>¿A qué se dedica? <span className="required">*</span></label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.dedicacion}
                    onChange={(e) => handleInputChange('dedicacion', e.target.value)}
                    placeholder="Ej: Venta de ropa al por menor"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Objetivo Principal <span className="required">*</span></label>
                <textarea
                  className="form-textarea"
                  value={formData.objetivo}
                  onChange={(e) => handleInputChange('objetivo', e.target.value)}
                  placeholder="¿Qué quieres lograr con automatizaciones?"
                  rows={3}
                />
              </div>

              <div className="form-section">
                <h3>Información de Contacto</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Nombre Completo <span className="required">*</span></label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.contactoNombre}
                      onChange={(e) => handleInputChange('contactoNombre', e.target.value)}
                      placeholder="Juan Pérez"
                    />
                  </div>

                  <div className="form-group">
                    <label>Cargo <span className="required">*</span></label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.contactoCargo}
                      onChange={(e) => handleInputChange('contactoCargo', e.target.value)}
                      placeholder="Ej: Gerente General"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Email <span className="required">*</span></label>
                    <input
                      type="email"
                      className="form-input"
                      value={formData.contactoEmail}
                      onChange={(e) => handleInputChange('contactoEmail', e.target.value)}
                      placeholder="juan@empresa.com"
                    />
                    <small style={{ color: '#666', fontSize: '0.875rem' }}>
                      Formato: usuario@dominio.com
                    </small>
                  </div>

                  <div className="form-group">
                    <label>Teléfono <span className="required">*</span></label>
                    <input
                      type="tel"
                      className="form-input"
                      value={formData.contactoTelefono}
                      onChange={(e) => handleInputChange('contactoTelefono', e.target.value)}
                      placeholder="+507 6000-0000"
                    />
                    <small style={{ color: '#666', fontSize: '0.875rem' }}>
                      Incluye código de país (ej: +507)
                    </small>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PASO 2: Herramientas */}
          {paso === 2 && (
            <div className="paso-wrapper">
              <h2>Herramientas que Usas</h2>
              <p className="paso-description">
                Selecciona las herramientas y plataformas que utiliza tu negocio actualmente
              </p>

              <div className="herramientas-section">
                <h3 className="section-header"><Mail size={20} /> Email y Comunicación</h3>
                <div className="checkbox-grid">
                  {['Gmail', 'Outlook', 'Yahoo Mail', 'iCloud Mail', 'Zoho Mail', 'ProtonMail', 'Otro'].map((tool) => (
                    <label key={tool} className="checkbox-card">
                      <input
                        type="checkbox"
                        checked={formData.herramientasEmail.includes(tool)}
                        onChange={() => handleCheckboxChange('herramientasEmail', tool)}
                      />
                      <span>{tool}</span>
                    </label>
                  ))}
                </div>
                {formData.herramientasEmail.includes('Otro') && (
                  <div className="form-group" style={{ marginTop: '12px' }}>
                    <label>¿Qué otra herramienta de Email usas? <span className="required">*</span></label>
                    <input
                      type="text"
                      className="form-input"
                      value={otroEmail}
                      onChange={(e) => setOtroEmail(e.target.value)}
                      placeholder="Ej: Thunderbird, AOL Mail, etc."
                    />
                  </div>
                )}
              </div>

              <div className="herramientas-section">
                <h3 className="section-header"><ShoppingCart size={20} /> Ventas y E-commerce</h3>
                <div className="checkbox-grid">
                  {['Shopify', 'WooCommerce', 'Magento', 'PrestaShop', 'WhatsApp Business', 'Telegram', 'Mercado Libre', 'Amazon', 'eBay', 'Etsy', 'Otro'].map((tool) => (
                    <label key={tool} className="checkbox-card">
                      <input
                        type="checkbox"
                        checked={formData.herramientasVentas.includes(tool)}
                        onChange={() => handleCheckboxChange('herramientasVentas', tool)}
                      />
                      <span>{tool}</span>
                    </label>
                  ))}
                </div>
                {formData.herramientasVentas.includes('Otro') && (
                  <div className="form-group" style={{ marginTop: '12px' }}>
                    <label>¿Qué otra herramienta de Ventas usas? <span className="required">*</span></label>
                    <input
                      type="text"
                      className="form-input"
                      value={otroVentas}
                      onChange={(e) => setOtroVentas(e.target.value)}
                      placeholder="Ej: Tu propia plataforma, otro marketplace, etc."
                    />
                  </div>
                )}
              </div>

              <div className="herramientas-section">
                <h3 className="section-header"><LayoutGrid size={20} /> Organización y Productividad</h3>
                <div className="checkbox-grid">
                  {['Google Sheets', 'Excel', 'Airtable', 'Notion', 'Trello', 'Asana', 'Monday.com', 'ClickUp', 'Jira', 'Google Drive', 'Dropbox', 'OneDrive', 'Otro'].map((tool) => (
                    <label key={tool} className="checkbox-card">
                      <input
                        type="checkbox"
                        checked={formData.herramientasOrganizacion.includes(tool)}
                        onChange={() => handleCheckboxChange('herramientasOrganizacion', tool)}
                      />
                      <span>{tool}</span>
                    </label>
                  ))}
                </div>
                {formData.herramientasOrganizacion.includes('Otro') && (
                  <div className="form-group" style={{ marginTop: '12px' }}>
                    <label>¿Qué otra herramienta de Organización usas? <span className="required">*</span></label>
                    <input
                      type="text"
                      className="form-input"
                      value={otroOrganizacion}
                      onChange={(e) => setOtroOrganizacion(e.target.value)}
                      placeholder="Ej: Basecamp, Smartsheet, etc."
                    />
                  </div>
                )}
              </div>

              <div className="herramientas-section">
                <h3 className="section-header"><CreditCard size={20} /> Pagos y Facturación</h3>
                <div className="checkbox-grid">
                  {['Yappy', 'PayPal', 'Mercado Pago', 'Stripe', 'Square', 'Clover', 'QuickBooks', 'Xero', 'FreshBooks', 'Otro'].map((tool) => (
                    <label key={tool} className="checkbox-card">
                      <input
                        type="checkbox"
                        checked={formData.herramientasPagos.includes(tool)}
                        onChange={() => handleCheckboxChange('herramientasPagos', tool)}
                      />
                      <span>{tool}</span>
                    </label>
                  ))}
                </div>
                {formData.herramientasPagos.includes('Otro') && (
                  <div className="form-group" style={{ marginTop: '12px' }}>
                    <label>¿Qué otra herramienta de Pagos usas? <span className="required">*</span></label>
                    <input
                      type="text"
                      className="form-input"
                      value={otroPagos}
                      onChange={(e) => setOtroPagos(e.target.value)}
                      placeholder="Ej: Transfiya, ACH, otro sistema de pagos, etc."
                    />
                  </div>
                )}
              </div>

              <div className="herramientas-section">
                <h3 className="section-header"><Share2 size={20} /> Redes Sociales y Marketing</h3>
                <div className="checkbox-grid">
                  {['Facebook', 'Instagram', 'TikTok', 'Twitter/X', 'LinkedIn', 'YouTube', 'WhatsApp', 'Mailchimp', 'HubSpot', 'Google Ads', 'Facebook Ads', 'Otro'].map((tool) => (
                    <label key={tool} className="checkbox-card">
                      <input
                        type="checkbox"
                        checked={formData.herramientasSocial.includes(tool)}
                        onChange={() => handleCheckboxChange('herramientasSocial', tool)}
                      />
                      <span>{tool}</span>
                    </label>
                  ))}
                </div>
                {formData.herramientasSocial.includes('Otro') && (
                  <div className="form-group" style={{ marginTop: '12px' }}>
                    <label>¿Qué otra herramienta de Redes Sociales usas? <span className="required">*</span></label>
                    <input
                      type="text"
                      className="form-input"
                      value={otroSocial}
                      onChange={(e) => setOtroSocial(e.target.value)}
                      placeholder="Ej: Pinterest, Snapchat, otra plataforma, etc."
                    />
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>¿Usas otras herramientas que no están en la lista?</label>
                <textarea
                  className="form-textarea"
                  value={formData.herramientasOtras}
                  onChange={(e) => handleInputChange('herramientasOtras', e.target.value)}
                  placeholder="Escribe aquí el nombre de otras herramientas, separadas por comas..."
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* PASO 3: Accesos */}
          {paso === 3 && (
            <div className="paso-wrapper">
              <h2>Información de Acceso</h2>
              <p className="paso-description">
                Ayúdanos a entender cómo accedes a tus herramientas para poder conectarlas
              </p>

              <div className="info-box">
                <div className="info-icon"><Lock size={24} /></div>
                <div>
                  <strong>Tu información está segura</strong>
                  <p>
                    Solo usaremos esta información para conectar tus herramientas.
                    Tu seguridad es nuestra prioridad y nunca compartiremos tus datos.
                  </p>
                </div>
              </div>

              {formData.infoAccesos.map((acceso, index) => (
                <div key={index} className="acceso-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3>{acceso.herramienta}</h3>
                  </div>

                  <div className="form-group">
                    <label>¿Cómo prefieres darnos acceso? <span className="required">*</span></label>
                    <select
                      className="form-select"
                      value={acceso.tipoAcceso}
                      onChange={(e) => actualizarAcceso(index, 'tipoAcceso', e.target.value)}
                    >
                      <option value="">Selecciona una opción...</option>
                      <option value="compartir">Puedo compartir mi usuario y contraseña</option>
                      <option value="crear">Pueden crear una cuenta nueva para esto</option>
                    </select>
                  </div>

                  {acceso.tipoAcceso && (
                    <>
                      {acceso.tipoAcceso === 'crear' ? (
                        <div className="info-message" style={{
                          background: '#eef2ff',
                          border: '1px solid #c7d2fe',
                          borderRadius: '8px',
                          padding: '12px 16px',
                          marginTop: '12px',
                          color: '#4338ca',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          <Check size={16} />
                          <p style={{ margin: 0 }}>
                            Perfecto, crearemos una cuenta nueva para esta herramienta. No necesitas proporcionar credenciales.
                          </p>
                        </div>
                      ) : (
                        <>
                          <div className="form-group">
                            <label>Usuario o Email <span className="required">*</span></label>
                            <input
                              type="text"
                              className="form-input"
                              value={acceso.cuenta}
                              onChange={(e) => actualizarAcceso(index, 'cuenta', e.target.value)}
                              placeholder="Ej: miusuario@gmail.com o +507 6000-0000"
                            />
                          </div>

                          <div className="form-group">
                            <label>Contraseña <span className="required">*</span></label>
                            <input
                              type="password"
                              className="form-input"
                              value={acceso.contrasena}
                              onChange={(e) => actualizarAcceso(index, 'contrasena', e.target.value)}
                              placeholder="Ingresa la contraseña"
                            />
                            <small style={{ color: 'var(--text-muted)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Lock size={12} /> Esta información está encriptada y segura
                            </small>
                          </div>
                        </>
                      )}

                      <div className="form-group">
                        <label>Notas o información adicional</label>
                        <textarea
                          className="form-textarea"
                          value={acceso.notasAcceso}
                          onChange={(e) => actualizarAcceso(index, 'notasAcceso', e.target.value)}
                          placeholder="Ej: Solo tengo acceso de lunes a viernes, La cuenta la maneja mi socio, etc."
                          rows={2}
                        />
                      </div>
                    </>
                  )}
                </div>
              ))}

              {formData.infoAccesos.length === 0 && (
                <div className="empty-state">
                  <p>Las herramientas que seleccionaste en el paso anterior se cargarán automáticamente aquí.</p>
                </div>
              )}
            </div>
          )}

          {/* PASO 4: Automatizaciones Deseadas */}
          {paso === 4 && (
            <div className="paso-wrapper">
              <h2>Automatizaciones Deseadas</h2>
              <p className="paso-description">
                Cuéntanos qué procesos quieres automatizar y tus expectativas
              </p>

              <div className="form-group">
                <label>¿Cómo manejas tus procesos actualmente? <span className="required">*</span></label>
                <textarea
                  className="form-textarea"
                  value={formData.procesosActuales}
                  onChange={(e) => handleInputChange('procesosActuales', e.target.value)}
                  placeholder="Ej: Anoto pedidos en cuaderno, luego los paso a Excel manualmente..."
                  rows={4}
                />
              </div>

              <div className="form-group">
                <label>¿Qué te gustaría automatizar? <span className="required">*</span></label>
                <textarea
                  className="form-textarea"
                  value={formData.expectativas}
                  onChange={(e) => handleInputChange('expectativas', e.target.value)}
                  placeholder="Ej: Que los pedidos de WhatsApp se guarden automáticamente en Google Sheets..."
                  rows={4}
                />
              </div>

              <div className="form-group">
                <label>¿Cuál es tu principal dolor de cabeza? <span className="required">*</span></label>
                <textarea
                  className="form-textarea"
                  value={formData.puntosDolor}
                  onChange={(e) => handleInputChange('puntosDolor', e.target.value)}
                  placeholder="Ej: Pierdo mucho tiempo copiando datos manualmente y a veces se me olvidan pedidos..."
                  rows={4}
                />
              </div>

              <div className="form-group">
                <label>Notas Adicionales</label>
                <textarea
                  className="form-textarea"
                  value={formData.notasAdicionales}
                  onChange={(e) => handleInputChange('notasAdicionales', e.target.value)}
                  placeholder="Cualquier otra información que quieras compartir..."
                  rows={3}
                />
              </div>

              <div className="final-info-box">
                <div className="info-icon"><ClipboardList size={24} /></div>
                <div>
                  <strong>Revisión Final</strong>
                  <p>
                    Al enviar este formulario, nuestro equipo revisará tu información y se pondrá en contacto
                    contigo en un plazo de 24-48 horas para discutir los siguientes pasos.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="navigation-buttons">
          {paso > 1 && (
            <button
              type="button"
              onClick={pasoAnterior}
              className="btn-secondary"
              disabled={enviando}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ArrowLeft size={16} /> Anterior
              </span>
            </button>
          )}
          {paso < totalPasos ? (
            <button type="button" onClick={siguientePaso} className="btn-primary" disabled={enviando}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                Continuar <ArrowRight size={14} />
              </span>
            </button>
          ) : (
            <button type="submit" className="btn-primary" disabled={enviando}>
              {enviando ? "Enviando..." : <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>Enviar <Check size={16} /></span>}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default MiNegocioComponent;