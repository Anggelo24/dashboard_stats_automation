// api/support/ticket.js
// Vercel Serverless Function for sending support tickets via email

const nodemailer = require('nodemailer');

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { nombre, email, asunto, prioridad, categoria, mensaje } = req.body;

    // Validate required fields
    if (!nombre || !email || !asunto || !mensaje) {
      return res.status(400).json({
        success: false,
        error: 'Todos los campos son requeridos'
      });
    }

    // Email Configuration
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    // Create email content
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'Soporte@tuinity.lat',
      subject: `[${categoria.toUpperCase()}] [${prioridad.toUpperCase()}] ${asunto}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #6366f1; border-bottom: 2px solid #6366f1; padding-bottom: 10px;">
            Nuevo Ticket de Soporte
          </h2>

          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Nombre:</strong> ${nombre}</p>
            <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
            <p style="margin: 5px 0;"><strong>Categoría:</strong> ${categoria}</p>
            <p style="margin: 5px 0;"><strong>Prioridad:</strong> ${prioridad}</p>
          </div>

          <div style="margin: 20px 0;">
            <h3 style="color: #333;">Asunto:</h3>
            <p style="color: #666;">${asunto}</p>
          </div>

          <div style="margin: 20px 0;">
            <h3 style="color: #333;">Descripción:</h3>
            <p style="color: #666; white-space: pre-line;">${mensaje}</p>
          </div>

          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">

          <p style="color: #999; font-size: 12px; text-align: center;">
            Este ticket fue enviado desde el Dashboard de Tuinity
          </p>
        </div>
      `,
      text: `
Nuevo Ticket de Soporte

Nombre: ${nombre}
Email: ${email}
Categoría: ${categoria}
Prioridad: ${prioridad}

Asunto: ${asunto}

Descripción:
${mensaje}

---
Este ticket fue enviado desde el Dashboard de Tuinity
      `
    };

    // Send email
    await transporter.sendMail(mailOptions);

    res.status(200).json({
      success: true,
      message: 'Ticket enviado exitosamente'
    });
  } catch (error) {
    console.error('Error sending support ticket:', error);
    res.status(500).json({
      success: false,
      error: 'Error al enviar el ticket. Por favor intente nuevamente.'
    });
  }
}
