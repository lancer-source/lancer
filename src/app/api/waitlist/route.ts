import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'waitlist.json');

/**
 * Read the current waitlist from the JSON file.
 * For production, swap this out for a database (DynamoDB, Supabase, etc.)
 */
function getWaitlist(): string[] {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch {
    // If file is corrupted, start fresh
  }
  return [];
}

/**
 * Save the waitlist to the JSON file.
 * Creates the data directory if it doesn't exist.
 */
function saveWaitlist(emails: string[]) {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(DATA_FILE, JSON.stringify(emails, null, 2));
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required.' },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();

    // Basic email validation
    if (!trimmedEmail.includes('@') || !trimmedEmail.includes('.')) {
      return NextResponse.json(
        { error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    const waitlist = getWaitlist();

    // Check for duplicates
    if (waitlist.includes(trimmedEmail)) {
      return NextResponse.json(
        { error: 'This email is already on the waitlist.' },
        { status: 409 }
      );
    }

    waitlist.push(trimmedEmail);
    saveWaitlist(waitlist);

    console.log(
      `[Waitlist] New signup: ${trimmedEmail} (Total: ${waitlist.length})`
    );

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
    const waitlist = getWaitlist();
    return NextResponse.json({
      count: waitlist.length,
    });
  } catch {
    return NextResponse.json({ count: 0 });
  }
}
