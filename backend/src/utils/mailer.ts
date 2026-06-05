import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendOtpEmail = async (to: string, code: string): Promise<void> => {
  await transporter.sendMail({
    from: `"Toyxona" <${process.env.SMTP_USER}>`,
    to,
    subject: 'Tasdiqlash kodi (OTP)',
    html: `
      <div style="font-family: sans-serif;">
        <h2>Tizimga kirish kodi</h2>
        <p>Sizning bir martalik kodingiz:</p>
        <h1 style="letter-spacing: 4px;">${code}</h1>
        <p>Kod 10 daqiqa amal qiladi.</p>
      </div>`,
  });
  console.log(`[OTP] ${to} uchun kod: ${code}`);
};
