import { NextRequest, NextResponse } from 'next/server';

interface ContactFormData {
  name: string;
  phone: string;
  email: string;
  subject?: string;
  message: string;
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

    // Log the contact request (in production, this would be sent to email/CRM/database)
    console.log('Contact form submission:', {
      timestamp: new Date().toISOString(),
      name: data.name,
      phone: data.phone,
      email: data.email,
      subject: data.subject || 'Не вказано',
      message: data.message.substring(0, 100) + (data.message.length > 100 ? '...' : ''),
    });

    // In production, you might want to:
    // 1. Send email notification
    // 2. Save to database
    // 3. Forward to CRM
    // 4. Send to Telegram bot

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 500));

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
