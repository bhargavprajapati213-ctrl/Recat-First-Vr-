import nodemailer from 'nodemailer';

// Email is optional: without SMTP settings, submissions are only saved to disk.
const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_FROM, MAIL_TO } = process.env;

export const mailEnabled = Boolean(SMTP_HOST && MAIL_TO);

const transporter = mailEnabled
  ? nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT) || 587,
      secure: Number(SMTP_PORT) === 465,
      auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
    })
  : null;

export async function sendNotification(s) {
  if (!transporter) return false;
  const lines = [
    `Topic:   ${s.topic}`,
    `Name:    ${s.name}`,
    `Email:   ${s.email}`,
    s.company ? `Company: ${s.company}` : null,
    s.phone ? `Phone:   ${s.phone}` : null,
    '',
    s.message,
    '',
    `— received ${s.createdAt} (id ${s.id})`,
  ].filter((l) => l !== null);

  await transporter.sendMail({
    from: MAIL_FROM || SMTP_USER,
    to: MAIL_TO,
    replyTo: s.email,
    subject: `New ${s.topic} enquiry from ${s.name}${s.company ? ` (${s.company})` : ''}`,
    text: lines.join('\n'),
  });
  return true;
}
