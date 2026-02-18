import { NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  try {
    const { email, userType } = await request.json();

    // Validate email
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required.' },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail.includes('@') || !trimmedEmail.includes('.')) {
      return NextResponse.json(
        { error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    // Validate user type
    const validTypes = ['worker', 'homeowner'];
    if (!userType || !validTypes.includes(userType)) {
      return NextResponse.json(
        { error: 'Please select whether you\'re a worker or homeowner.' },
        { status: 400 }
      );
    }

    const supabase = createSupabaseAdmin();

    // Insert into the waitlist table
    const { error } = await supabase
      .from('waitlist')
      .insert({ email: trimmedEmail, user_type: userType });

    // Handle duplicate email (Postgres unique constraint violation)
    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'This email is already on the waitlist.' },
          { status: 409 }
        );
      }
      console.error('[Waitlist] Supabase error:', error);
      return NextResponse.json(
        { error: 'Something went wrong. Please try again.' },
        { status: 500 }
      );
    }

    console.log(`[Waitlist] New signup: ${trimmedEmail} (${userType})`);

    return NextResponse.json({
      success: true,
      message: "You're on the list!",
    });
  } catch (error) {
    console.error('[Waitlist] Error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const supabase = createSupabaseAdmin();

    const { count, error } = await supabase
      .from('waitlist')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('[Waitlist] Count error:', error);
      return NextResponse.json({ count: 0 });
    }

    return NextResponse.json({ count: count ?? 0 });
  } catch {
    return NextResponse.json({ count: 0 });
  }
}
