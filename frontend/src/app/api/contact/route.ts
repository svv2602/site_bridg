import { NextRequest, NextResponse } from 'next/server';

interface ContactFormData {
  name: string;
  phone: string;
  email: string;
  subject?: string;
  message: string;
}

const PAYLOAD_URL = process.env.NEXT_PUBLIC_PAYLOAD_URL || 'http://localhost:3001';
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const CONTACT_EMAIL = process.env.CONTACT_EMAIL || 'info@bridgestone.ua';

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
    const subjectLabel = SUBJECT_LABELS[data.subject || 'other'] || data.subject;
    const message = `🔔 *Нове звернення з сайту*

👤 *Ім'я:* ${escapeMarkdown(data.name)}
📞 *Телефон:* ${escapeMarkdown(data.phone)}
📧 *Email:* ${escapeMarkdown(data.email)}
📋 *Тема:* ${escapeMarkdown(subjectLabel)}

💬 *Повідомлення:*
${escapeMarkdown(data.message)}`;

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
          parse_mode: 'Markdown',
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

function escapeMarkdown(text: string): string {
  return text.replace(/[_*[\]()~`>#+=|{}.!-]/g, '\\$&');
}

async function sendEmailNotification(data: ContactFormData): Promise<boolean> {
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.log('SMTP not configured, skipping email notification');
    return true;
  }

  try {
    // Dynamic import to avoid issues when nodemailer is not installed
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

    const subjectLabel = SUBJECT_LABELS[data.subject || 'other'] || data.subject;

    await transporter.sendMail({
      from: `"Bridgestone Ukraine" <${SMTP_USER}>`,
      to: CONTACT_EMAIL,
      subject: `Нове звернення: ${subjectLabel}`,
      html: `
        <h2>Нове звернення з сайту Bridgestone</h2>
        <table style="border-collapse: collapse; width: 100%; max-width: 600px;">
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd; background: #f5f5f5;"><strong>Ім'я:</strong></td>
            <td style="padding: 10px; border: 1px solid #ddd;">${data.name}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd; background: #f5f5f5;"><strong>Телефон:</strong></td>
            <td style="padding: 10px; border: 1px solid #ddd;"><a href="tel:${data.phone}">${data.phone}</a></td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd; background: #f5f5f5;"><strong>Email:</strong></td>
            <td style="padding: 10px; border: 1px solid #ddd;"><a href="mailto:${data.email}">${data.email}</a></td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd; background: #f5f5f5;"><strong>Тема:</strong></td>
            <td style="padding: 10px; border: 1px solid #ddd;">${subjectLabel}</td>
          </tr>
        </table>
        <h3>Повідомлення:</h3>
        <div style="padding: 15px; background: #f9f9f9; border: 1px solid #ddd; border-radius: 4px;">
          ${data.message.replace(/\n/g, '<br>')}
        </div>
        <p style="color: #666; font-size: 12px; margin-top: 20px;">
          Відправлено з сайту bridgestone.ua
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
    const data: ContactFormData = await request.json();

    // Validate required fields
    if (!data.name || !data.phone || !data.email || !data.message) {
      return NextResponse.json(
        { error: 'Будь ласка, заповніть всі обов\'язкові поля' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return NextResponse.json(
        { error: 'Невірний формат електронної пошти' },
        { status: 400 }
      );
    }

    // Log the contact request
    console.log('Contact form submission:', {
      timestamp: new Date().toISOString(),
      name: data.name,
      phone: data.phone,
      email: data.email,
      subject: data.subject || 'other',
    });

    // Execute all notifications in parallel
    const [savedToDb, telegramSent, emailSent] = await Promise.all([
      saveToPayload(data),
      sendTelegramNotification(data),
      sendEmailNotification(data),
    ]);

    // Log results
    console.log('Contact form processing results:', {
      savedToDb,
      telegramSent,
      emailSent,
    });

    // Return success even if some notifications failed
    // The main thing is that we received the submission
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
