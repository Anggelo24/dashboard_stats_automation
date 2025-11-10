# Configuración de Email para Tickets de Soporte

Este documento explica cómo configurar el sistema de email para que los tickets de soporte lleguen a **Soporte@tuinity.lat**

## 📧 Configuración Requerida

El backend usa **Nodemailer** para enviar emails. Necesitas configurar las siguientes variables en tu archivo `.env`:

```env
# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=tu-email@gmail.com
EMAIL_PASSWORD=tu_app_password_aqui
```

## 🔐 Usando Gmail (Recomendado)

Si vas a usar Gmail para enviar los emails, **NO uses tu contraseña normal**. Debes crear una "App Password" (Contraseña de Aplicación):

### Pasos para crear un App Password en Gmail:

1. **Activa la verificación en 2 pasos** en tu cuenta de Google:
   - Ve a [myaccount.google.com](https://myaccount.google.com)
   - Click en "Seguridad" → "Verificación en dos pasos"
   - Sigue los pasos para activarla

2. **Genera una App Password**:
   - Ve a [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
   - Selecciona "Correo" como la app
   - Selecciona "Otro (nombre personalizado)" como dispositivo
   - Escribe "Tuinity Dashboard"
   - Click en "Generar"
   - **Copia la contraseña de 16 caracteres** que te muestra

3. **Agrega la App Password a tu .env**:
   ```env
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_SECURE=false
   EMAIL_USER=tu-email@gmail.com
   EMAIL_PASSWORD=xxxx xxxx xxxx xxxx  # La contraseña de 16 caracteres
   ```

## 📮 Usando Soporte@tuinity.lat directamente

Si quieres enviar desde **Soporte@tuinity.lat**:

```env
EMAIL_HOST=smtp.tuinity.lat  # o el servidor SMTP que uses
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=Soporte@tuinity.lat
EMAIL_PASSWORD=la_contraseña_del_correo
```

Necesitarás:
- El servidor SMTP de tu proveedor de email
- Las credenciales de Soporte@tuinity.lat
- El puerto correcto (587 para TLS, 465 para SSL)

## 🔧 Configuración Completa del .env

Tu archivo `.env` completo debe verse así:

```env
# Backend API URL
VITE_API_URL=http://localhost:3001/api

# Google Sheets Configuration
VITE_GOOGLE_SHEETS_URL=https://script.google.com/your-url

# Client Branding
VITE_LOGO_URL=https://your-logo-url.com/logo.png
VITE_CLIENT_NAME=Fluffy
VITE_CLIENT_ID=cliente_fluffy_001

# N8N Configuration (Frontend)
VITE_N8N_API_URL=https://your-n8n-instance.com
VITE_N8N_API_KEY=your_api_key

# Backend Server
PORT=3001
FRONTEND_URL=http://localhost:5173

# N8N Backend Configuration
N8N_BASE_URL=https://your-n8n-instance.com/api/v1
N8N_API_KEY=your_api_key

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=tu-email@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx
```

## ✅ Verificar que funciona

1. Inicia el backend:
   ```bash
   cd backend
   npm start
   ```

2. En el dashboard, ve a la sección de **Soporte**

3. Llena el formulario y envía un ticket de prueba

4. Revisa que el email llegue a **Soporte@tuinity.lat**

## 🚨 Solución de Problemas

### "Error al enviar el ticket"
- Verifica que las credenciales en `.env` sean correctas
- Asegúrate de usar una App Password si es Gmail
- Revisa que el backend esté corriendo

### "Authentication failed"
- La contraseña es incorrecta
- Para Gmail, debes usar App Password, no tu contraseña normal
- Verifica que la verificación en 2 pasos esté activa

### "Connection timeout"
- Verifica el puerto (587 para TLS, 465 para SSL)
- Si usas puerto 465, cambia `EMAIL_SECURE=true`
- Revisa tu firewall/antivirus

## 📝 Notas Importantes

1. **Nunca subas tu `.env` a Git** - Está en `.gitignore` por seguridad
2. **Usa App Password** para Gmail, no tu contraseña personal
3. Los tickets incluyen: nombre, email, categoría, prioridad, asunto y mensaje
4. El formato del email es profesional con HTML
5. Los emails se envían a **Soporte@tuinity.lat** automáticamente

## 🔒 Seguridad

- Las credenciales se almacenan solo en variables de entorno
- Nunca se exponen al frontend
- El backend valida todos los campos antes de enviar
- Se usa conexión TLS/SSL para encriptar el envío
