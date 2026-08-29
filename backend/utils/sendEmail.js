import nodemailer from 'nodemailer';
import colors from 'colors';

let transporter = null;
let warned = false;

const getTransporter = () => {
  if (transporter) return transporter;

  const { EMAIL_HOST, EMAIL_USER, EMAIL_PASS } = process.env;
  if (!EMAIL_HOST || !EMAIL_USER || !EMAIL_PASS) {
    if (!warned) {
      console.warn('WARNING: Email not configured (EMAIL_HOST/EMAIL_USER/EMAIL_PASS) — emails will be skipped.'.yellow.bold);
      warned = true;
    }
    return null;
  }

  const port = Number(process.env.EMAIL_PORT) || 587;
  transporter = nodemailer.createTransport({
    host: EMAIL_HOST,
    port,
    secure: port === 465, // 465 = implicit TLS, 587 = STARTTLS
    auth: { user: EMAIL_USER, pass: EMAIL_PASS },
  });

  return transporter;
};

/**
 * Send an email. Never throws — a failed send is logged and returned as
 * { error }, so it can't break the request that triggered it.
 */
export const sendEmail = async ({ to, subject, html, text, replyTo }) => {
  const tx = getTransporter();
  if (!tx) return { skipped: true };

  const from = process.env.EMAIL_FROM || `Kobac Electronics <${process.env.EMAIL_USER}>`;

  try {
    const info = await tx.sendMail({
      from,
      to,
      replyTo,
      subject,
      html,
      text: text || html?.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(),
    });
    return { messageId: info.messageId };
  } catch (err) {
    console.error(`Email failed [${subject}] -> ${to}: ${err.message}`.red);
    return { error: err.message };
  }
};

export default sendEmail;
