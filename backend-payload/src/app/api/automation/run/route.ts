import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}))
  const { type } = body as { type?: string }

  return NextResponse.json({
    success: true,
    message: `Started ${type || 'full'} automation`
  })
}
