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
    requireTLS: port === 587,
    auth: { user: EMAIL_USER, pass: EMAIL_PASS },
    // Keep a stuck SMTP server from holding a request open for long.
    connectionTimeout: 7000,
    greetingTimeout: 7000,
    socketTimeout: 10000,
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

/**
 * Fire a transactional email tied to a request.
 * - production: awaited, so a serverless function isn't frozen before the
 *   mail is flushed (work after res.json() can otherwise be dropped).
 * - development: fire-and-forget, so a slow SMTP call — or a `node --watch`
 *   restart mid-send — can't turn into an ECONNRESET on the client.
 */
export const queueEmail = (opts) => {
  if (process.env.NODE_ENV === 'production') {
    return sendEmail(opts);
  }
  sendEmail(opts).catch(() => {});
  return Promise.resolve({ queued: true });
};

export default sendEmail;
