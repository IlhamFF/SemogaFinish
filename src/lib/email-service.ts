
import nodemailer from 'nodemailer';
import { APP_NAME } from './constants';

interface MailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

// Konfigurasi transporter Nodemailer
// Anda HARUS mengisi variabel lingkungan ini di file .env.local atau konfigurasi server Anda
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: Number(process.env.EMAIL_SERVER_PORT || 587), // Port umum untuk SMTP (587 untuk TLS, 465 untuk SSL)
  secure: (process.env.EMAIL_SERVER_PORT === '465'), // true untuk port 465, false untuk port lain
  auth: {
    user: process.env.EMAIL_SERVER_USER, // User SMTP Anda
    pass: process.env.EMAIL_SERVER_PASSWORD, // Password SMTP Anda
  },
  // Aktifkan ini jika server SMTP Anda menggunakan sertifikat self-signed
  // tls: {
  //   rejectUnauthorized: false 
  // }
});

const defaultEmailFrom = process.env.EMAIL_FROM || `noreply@${(process.env.NEXT_PUBLIC_APP_URL || "example.com").replace(/^https?:\/\//, '')}`;

/**
 * Mengirim email.
 * @param mailOptions Opsi email (to, subject, html, text)
 */
async function sendMail({ to, subject, html, text }: MailOptions): Promise<void> {
  try {
    const info = await transporter.sendMail({
      from: `"${APP_NAME}" <${defaultEmailFrom}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>?/gm, ''), // Membuat versi teks biasa jika tidak disediakan
    });
    console.log('Email terkirim: %s', info.messageId);
    // Anda bisa menyimpan info.messageId jika perlu untuk pelacakan
  } catch (error) {
    console.error('Error mengirim email:', error);
    // Pertimbangkan untuk melempar error ini agar bisa ditangani di level API
    // atau mengimplementasikan sistem retry/logging yang lebih canggih
    throw new Error(`Gagal mengirim email ke ${to}: ${(error as Error).message}`);
  }
}

/**
 * Mengirim email verifikasi akun.
 * @param to Alamat email penerima
 * @param name Nama pengguna (opsional)
 * @param verificationLink Tautan verifikasi
 */
export async function sendVerificationEmail(to: string, name: string | null | undefined, verificationLink: string): Promise<void> {
  const subject = `Verifikasi Email Anda untuk ${APP_NAME}`;
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2 style="color: #333;">Selamat Datang di ${APP_NAME}, ${name || 'Pengguna Baru'}!</h2>
      <p>Terima kasih telah mendaftar. Silakan klik tautan di bawah ini untuk memverifikasi alamat email Anda:</p>
      <p style="margin: 20px 0;">
        <a href="${verificationLink}" 
           style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          Verifikasi Email Saya
        </a>
      </p>
      <p>Jika Anda tidak bisa mengklik tombol di atas, salin dan tempel URL berikut ke browser Anda:</p>
      <p><a href="${verificationLink}">${verificationLink}</a></p>
      <p>Jika Anda tidak mendaftar untuk akun ini, Anda bisa mengabaikan email ini.</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="font-size: 0.9em; color: #777;">Email ini dikirim secara otomatis. Mohon jangan membalas email ini.</p>
    </div>
  `;

  await sendMail({
    to,
    subject,
    html: htmlContent,
  });
}

/**
 * Mengirim email reset kata sandi.
 * @param to Alamat email penerima
 * @param resetLink Tautan reset kata sandi
 */
export async function sendPasswordResetEmail(to: string, resetLink: string): Promise<void> {
  const subject = `Reset Kata Sandi Akun ${APP_NAME} Anda`;
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2 style="color: #333;">Permintaan Reset Kata Sandi</h2>
      <p>Kami menerima permintaan untuk mereset kata sandi akun Anda di ${APP_NAME}.</p>
      <p>Silakan klik tautan di bawah ini untuk membuat kata sandi baru:</p>
      <p style="margin: 20px 0;">
        <a href="${resetLink}" 
           style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          Reset Kata Sandi
        </a>
      </p>
      <p>Tautan ini akan kedaluwarsa dalam 1 jam.</p>
      <p>Jika Anda tidak meminta reset kata sandi, abaikan email ini.</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="font-size: 0.9em; color: #777;">Email ini dikirim secara otomatis. Mohon jangan membalas email ini.</p>
    </div>
  `;

  await sendMail({
    to,
    subject,
    html: htmlContent,
  });
}
