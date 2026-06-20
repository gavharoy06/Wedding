// utils/email.ts (yoki sizda qaysi fayl bo'lsa)

export const sendOtpEmail = async (to: string, code: string): Promise<void> => {
  // 1. Agar .env da pochta sozlamalari bo'lsa va loyiha real serverda (production) bo'lsa, haqiqiy yuboradi
  if (process.env.NODE_ENV === 'production' && process.env.SMTP_USER) {
    try {
      const nodemailer = require('nodemailer');
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from: `"Toyxona" <${process.env.SMTP_USER}>`,
        to,
        subject: 'Tasdiqlash kodi (OTP)',
        html: `<h2>Sizning kodingiz: ${code}</h2>`,
      });
      return;
    } catch (error) {
      console.error("Haqiqiy email yuborishda xato, feyk rejimga o'tildi:", error);
    }
  }

  // 2. Aks holda (development rejimida) shunchaki terminalga chiqaradi (Feyk rejim)
  console.log(`\n==========================================`);
  console.log(`📧 [KIMGA]: ${to}`);
  console.log(`🔑 [KOD (OTP)]: ${code}`);
  console.log(`==========================================\n`);
};