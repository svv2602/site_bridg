import { NextRequest, NextResponse } from 'next/server';
import { contactFormSchema, type ContactFormData } from '@/lib/schemas/contact';
import { createRateLimiter } from '@/lib/rate-limit';

// Rate limiter: max 5 contact form submissions per 15 minutes per IP
const contactLimiter = createRateLimiter({ maxRequests: 5, windowMs: 15 * 60 * 1000 });

interface ContactFormPayload extends ContactFormData {
  _loadedAt?: number;
  _hp_website?: string;
  consent?: boolean;
}

/**
 * Bot detection: verify the form was loaded at least MIN_SUBMIT_TIME_MS ago
 * and no more than MAX_SUBMIT_TIME_MS ago. Bots submit forms instantly,
 * while legitimate users need at least a few seconds to fill in the fields.
 */
const MIN_SUBMIT_TIME_MS = 3_000;     // 3 seconds
const MAX_SUBMIT_TIME_MS = 30 * 60_000; // 30 minutes

const PAYLOAD_URL = process.env.NEXT_PUBLIC_PAYLOAD_URL || 'http://localhost:3001';
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const CONTACT_EMAIL = process.env.CONTACT_EMAIL || 'info@bridgestone.org.ua';

const SUBJECT_LABELS: Record<string, string> = {
  'tyre-selection': 'Підбір шин',
  'find-dealer': 'Де купити',
  'warranty': 'Гарантія',
  'other': 'Інше',
};

async function saveToPayload(data: ContactFormData): Promise<boolean> {
  try {
    const response = await fetch(`${PAYLOAD_URL}/api/contact-submissions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: data.name,
        phone: data.phone,
        email: data.email,
        subject: data.subject || 'other',
        message: data.message,
        status: 'new',
      }),
    });

    if (!response.ok) {
      console.error('Failed to save to Payload CMS:', response.status);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error saving to Payload CMS:', error);
    return false;
  }
}

async function sendTelegramNotification(data: ContactFormData): Promise<boolean> {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.log('Telegram not configured, skipping notification');
    return true;
  }

  try {
    const subjectLabel = SUBJECT_LABELS[data.subject || 'other'] || data.subject || 'Інше';
    const message = `🔔 <b>Нове звернення з сайту</b>

👤 <b>Ім'я:</b> ${escapeHtml(data.name)}
📞 <b>Телефон:</b> ${escapeHtml(data.phone)}
📧 <b>Email:</b> ${escapeHtml(data.email)}
📋 <b>Тема:</b> ${escapeHtml(subjectLabel)}

💬 <b>Повідомлення:</b>
${escapeHtml(data.message)}`;

    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: 'HTML',
        }),
      }
    );

    if (!response.ok) {
      console.error('Failed to send Telegram notification:', response.status);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error sending Telegram notification:', error);
    return false;
  }
}

/**
 * Escape HTML special characters to prevent XSS in email templates and Telegram messages.
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

async function sendEmailNotification(data: ContactFormData): Promise<boolean> {
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.log('SMTP not configured, skipping email notification');
    return true;
  }

  try {
    // Dynamic import to avoid issues when nodemailer is not installed
    // @ts-expect-error - nodemailer types may not be installed
    const nodemailer = await import('nodemailer').catch(() => null);
    if (!nodemailer) {
      console.log('Nodemailer not installed, skipping email notification');
      return true;
    }

    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: parseInt(SMTP_PORT || '587'),
      secure: SMTP_PORT === '465',
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });

    const subjectLabel = SUBJECT_LABELS[data.subject || 'other'] || data.subject || 'Інше';

    await transporter.sendMail({
      from: `"Bridgestone Ukraine" <${SMTP_USER}>`,
      to: CONTACT_EMAIL,
      subject: `Нове звернення: ${subjectLabel}`,
      html: `
        <h2>Нове звернення з сайту Bridgestone</h2>
        <table style="border-collapse: collapse; width: 100%; max-width: 600px;">
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd; background: #f5f5f5;"><strong>Ім'я:</strong></td>
            <td style="padding: 10px; border: 1px solid #ddd;">${escapeHtml(data.name)}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd; background: #f5f5f5;"><strong>Телефон:</strong></td>
            <td style="padding: 10px; border: 1px solid #ddd;"><a href="tel:${escapeHtml(data.phone)}">${escapeHtml(data.phone)}</a></td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd; background: #f5f5f5;"><strong>Email:</strong></td>
            <td style="padding: 10px; border: 1px solid #ddd;"><a href="mailto:${escapeHtml(data.email)}">${escapeHtml(data.email)}</a></td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd; background: #f5f5f5;"><strong>Тема:</strong></td>
            <td style="padding: 10px; border: 1px solid #ddd;">${escapeHtml(subjectLabel)}</td>
          </tr>
        </table>
        <h3>Повідомлення:</h3>
        <div style="padding: 15px; background: #f9f9f9; border: 1px solid #ddd; border-radius: 4px;">
          ${escapeHtml(data.message).replace(/\n/g, '<br>')}
        </div>
        <p style="color: #666; font-size: 12px; margin-top: 20px;">
          Відправлено з сайту bridgestone.org.ua
        </p>
      `,
    });

    return true;
  } catch (error) {
    console.error('Error sending email notification:', error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: max 5 requests per 15 minutes per IP
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1';
    if (!contactLimiter.check(ip)) {
      return NextResponse.json(
        { error: 'Забагато запитів. Спробуйте через декілька хвилин.' },
        { status: 429 }
      );
    }

    const rawData: ContactFormPayload = await request.json();

    // Honeypot check: if the hidden field is filled, it's a bot
    if (rawData._hp_website) {
      // Silently accept to avoid tipping off the bot
      console.warn('Bot detection: honeypot field filled', {
        ip: request.headers.get('x-forwarded-for') || 'unknown',
      });
      return NextResponse.json({
        success: true,
        message: 'Ваше повідомлення успішно надіслано',
      });
    }

    // GDPR consent check
    if (rawData.consent !== true) {
      return NextResponse.json(
        { error: 'Необхідна згода на обробку персональних даних' },
        { status: 400 }
      );
    }

    // Server-side validation with the same Zod schema as client
    const parseResult = contactFormSchema.safeParse({
      name: rawData.name,
      phone: rawData.phone,
      email: rawData.email,
      subject: rawData.subject,
      message: rawData.message,
    });

    if (!parseResult.success) {
      const firstError = parseResult.error.issues[0];
      return NextResponse.json(
        { error: firstError?.message || 'Невірні дані форми' },
        { status: 400 }
      );
    }

    const data = parseResult.data;

    // Bot detection: timestamp-based check
    // If _loadedAt is missing, it's either a bot or an old client — reject gracefully
    if (rawData._loadedAt) {
      const now = Date.now();
      const elapsed = now - rawData._loadedAt;

      if (elapsed < MIN_SUBMIT_TIME_MS) {
        console.warn('Bot detection: form submitted too quickly', {
          elapsed,
          ip: request.headers.get('x-forwarded-for') || 'unknown',
        });
        return NextResponse.json(
          { error: 'Форму надіслано занадто швидко. Будь ласка, спробуйте ще раз.' },
          { status: 400 }
        );
      }

      if (elapsed > MAX_SUBMIT_TIME_MS) {
        console.warn('Bot detection: form timestamp too old', {
          elapsed,
          ip: request.headers.get('x-forwarded-for') || 'unknown',
        });
        return NextResponse.json(
          { error: 'Сесія форми закінчилася. Будь ласка, оновіть сторінку та спробуйте ще раз.' },
          { status: 400 }
        );
      }
    }

    // Structured log for contact submission
    console.log(JSON.stringify({
      level: 'info',
      event: 'contact_form_submission',
      timestamp: new Date().toISOString(),
      data: { name: data.name, phone: data.phone, email: data.email, subject: data.subject || 'other' },
    }));

    // Execute all notifications in parallel
    const [savedToDb, telegramSent, emailSent] = await Promise.all([
      saveToPayload(data),
      sendTelegramNotification(data),
      sendEmailNotification(data),
    ]);

    // Structured log for processing results
    console.log(JSON.stringify({
      level: 'info',
      event: 'contact_form_result',
      timestamp: new Date().toISOString(),
      data: { savedToDb, telegramSent, emailSent },
    }));

    // If database save failed, report error to the user
    if (!savedToDb) {
      console.error('Contact form: failed to save to database');
      return NextResponse.json(
        { error: 'Не вдалося зберегти повідомлення. Будь ласка, спробуйте пізніше.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Ваше повідомлення успішно надіслано',
    });
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Помилка сервера. Спробуйте пізніше.' },
      { status: 500 }
    );
  }
}
