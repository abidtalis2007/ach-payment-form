import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    const { error } = await supabase.from('ach_submissions').insert({
      company_name: data.company_name,
      contact_name: data.contact_name,
      email: data.email,
      phone: data.phone,
      bank_name: data.bank_name,
      account_holder_name: data.account_holder_name,
      account_type: data.account_type,
      routing_number: data.routing_number,
      account_number: data.account_number,
      signature_name: data.signature_name,
    });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Submit error:', err);
    return NextResponse.json({ error: 'Failed to submit' }, { status: 500 });
  }
}
