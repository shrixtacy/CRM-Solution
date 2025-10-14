import { createClient } from '@supabase/supabase-js'
import { NextResponse } from "next/server";

const supabaseUrl = process.env.SUPABASE_URL || 'https://cekhahbluzicilrtkyvz.supabase.co'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNla2hhaGJsdXppY2lscnRreXZ6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDI3NDk5MSwiZXhwIjoyMDc1ODUwOTkxfQ.Bh_Z1r5iFZICmSfnWYwYVyIFniebejg12oy_7HIQ1gE'

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Email validation regex
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    // Validate email format
    if (!emailRegex.test(email)) {
      return NextResponse.json({ message: "Invalid email format" }, { status: 400 });
    }

    // Check if the email already exists in the waitlist
    const { data: existingUser, error: checkError } = await supabase
      .from('waitlist_users')
      .select('*')
      .eq('email', email);

    if (checkError) {
      console.error('Error checking existing user:', checkError);
      return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }

    if (existingUser && existingUser.length > 0) {
      return NextResponse.json({ message: "Email already on the waitlist" }, { status: 400 });
    }

    // Insert the new email into the waitlist table
    const { error: insertError } = await supabase
      .from('waitlist_users')
      .insert({ email });

    if (insertError) {
      console.error('Error inserting user:', insertError);
      return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }

    return NextResponse.json({ message: "Email added to waitlist successfully" }, { status: 201 });
  } catch (error) {
    console.error("Error adding email to waitlist:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
