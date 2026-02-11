import { NextResponse } from 'next/server';
import { getPayloadToken, getPayloadUrl } from '../payload-auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const token = await getPayloadToken();

    const response = await fetch(`${getPayloadUrl()}/api/content/generate-article`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `JWT ${token}`,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
