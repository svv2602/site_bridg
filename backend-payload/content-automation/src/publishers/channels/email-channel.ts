/**
 * Email Notification Channel
 *
 * Sends notifications via SMTP using nodemailer.
 * Only loaded when SMTP_HOST is configured.
 */

import { ENV } from "../../config/env.js";
import type { NotificationPayload, NotificationType } from "../telegram-bot.js";
import type { NotificationChannel } from "../notification-service.js";
import { createLogger } from "../../utils/logger.js";

const logger = createLogger("EmailChannel");

// Subject prefix by notification type
const SUBJECT_PREFIX: Record<NotificationType, string> = {
  new_content: "[Контент]",
  error: "[Помилка]",
  weekly_summary: "[Звіт]",
  info: "[Інфо]",
};

/**
 * Strip HTML tags for plain text fallback
 */
function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

/**
 * Build HTML email body with Bridgestone branding
 */
function buildHtmlEmail(payload: NotificationPayload): string {
  const buttonsHtml = payload.buttons?.length
    ? `<div style="margin-top: 16px;">${payload.buttons
        .map(
          (btn) =>
            `<a href="${btn.url}" style="display:inline-block;padding:8px 16px;background:#E31837;color:#fff;text-decoration:none;border-radius:4px;margin-right:8px;">${btn.text}</a>`
        )
        .join("")}</div>`
    : "";

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
  <div style="border-bottom:3px solid #E31837;padding-bottom:12px;margin-bottom:20px;">
    <strong style="font-size:18px;color:#1a1a1a;">Bridgestone Ukraine</strong>
    <span style="color:#666;font-size:14px;margin-left:8px;">Content Automation</span>
  </div>
  <h2 style="color:#1a1a1a;margin:0 0 12px;">${payload.title}</h2>
  <div style="color:#333;font-size:14px;line-height:1.6;">
    ${payload.body.replace(/\n/g, "<br>")}
  </div>
  ${buttonsHtml}
  <div style="margin-top:24px;padding-top:12px;border-top:1px solid #eee;color:#999;font-size:12px;">
    Автоматичне повідомлення від системи автоматизації Bridgestone Ukraine
  </div>
</body>
</html>`;
}

// Lazy-loaded transporter
let transporter: unknown = null;

async function getTransporter(): Promise<unknown> {
  if (transporter) return transporter;

  const nodemailer = await import("nodemailer");
  transporter = nodemailer.default.createTransport({
    host: ENV.SMTP_HOST,
    port: parseInt(ENV.SMTP_PORT, 10),
    secure: parseInt(ENV.SMTP_PORT, 10) === 465,
    auth: {
      user: ENV.SMTP_USER,
      pass: ENV.SMTP_PASS,
    },
  });

  return transporter;
}

async function sendEmail(payload: NotificationPayload): Promise<{ success: boolean; error?: string }> {
  const recipients = ENV.NOTIFY_EMAILS.split(",").map((e) => e.trim()).filter(Boolean);
  if (recipients.length === 0) {
    return { success: false, error: "No recipients configured" };
  }

  try {
    const transport = await getTransporter() as { sendMail: (opts: unknown) => Promise<unknown> };
    const subject = `${SUBJECT_PREFIX[payload.type]} ${payload.title}`;
    const html = buildHtmlEmail(payload);
    const text = stripHtml(html);

    await transport.sendMail({
      from: ENV.SMTP_FROM || ENV.SMTP_USER,
      to: recipients.join(", "),
      subject,
      text,
      html,
    });

    logger.info("Email sent", { recipients: recipients.length, subject });
    return { success: true };
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    logger.error("Email send failed", { error });
    return { success: false, error };
  }
}

export function createEmailChannel(): NotificationChannel {
  return {
    name: "email",
    isEnabled() {
      return !!(ENV.SMTP_HOST && ENV.SMTP_USER && ENV.NOTIFY_EMAILS);
    },
    send: sendEmail,
  };
}
