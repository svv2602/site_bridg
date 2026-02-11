import { NextResponse } from 'next/server';
import { getPayloadToken, getPayloadUrl } from '../../payload-auth';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = await getPayloadToken();

    const response = await fetch(`${getPayloadUrl()}/api/content/job/${id}`, {
      headers: {
        Authorization: `JWT ${token}`,
      },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
