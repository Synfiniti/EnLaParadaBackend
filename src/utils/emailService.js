import nodemailer from 'nodemailer';

export const sendVerificationEmail = async (toEmail, verificationCode) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail', // o el que uses
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: `"En La Parada" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: 'Tu código de verificación',
      text: `Tu código de verificación es: ${verificationCode}`,
      html: `<p>Tu código de verificación es: <strong>${verificationCode}</strong></p>`,
    });

    console.log('Correo enviado:', info.messageId);
  } catch (error) {
    console.error('Error al enviar el correo:', error);
    throw error;
  }
};
