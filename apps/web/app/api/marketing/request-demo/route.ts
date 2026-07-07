import { NextResponse } from 'next/server';

import { getSupabaseServerClient } from '@kit/supabase/server-client';

import { SubmitDemoRequestSchema } from '~/lib/kinder/marketing/schemas/request-demo.schema';

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  const parsed = SubmitDemoRequestSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, message: 'Invalid form data' },
      { status: 400 },
    );
  }

  const client = getSupabaseServerClient();

  const { error } = await client.from('demo_requests').insert({
    school_name: parsed.data.schoolName,
    email: parsed.data.email,
    phone: parsed.data.phone,
    message: parsed.data.message,
  });

  if (error) {
    console.error('[request-demo] submit failed', error);

    return NextResponse.json(
      { ok: false, message: 'Failed to submit request' },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
