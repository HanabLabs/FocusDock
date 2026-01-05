import { NextRequest, NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { sendVerificationEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Check if user already exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = existingUsers.users.find((u) => u.email === email);

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    // Generate 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Store verification code temporarily (expires in 10 minutes)
    // Note: Store password encrypted or use a secure temporary storage
    // For security, we'll encrypt the password before storing
    const crypto = require('crypto');
    const algorithm = 'aes-256-cbc';
    
    // Generate encryption key - use ENCRYPTION_KEY if set, otherwise derive from SUPABASE_SERVICE_ROLE_KEY
    let key: Buffer;
    if (process.env.ENCRYPTION_KEY) {
      // If ENCRYPTION_KEY is provided as hex, use it directly
      try {
        key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex').slice(0, 32);
      } catch {
        // If not hex, use it as a string and hash it
        key = crypto.createHash('sha256').update(process.env.ENCRYPTION_KEY).digest().slice(0, 32);
      }
    } else {
      // Derive key from SUPABASE_SERVICE_ROLE_KEY
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
      key = crypto.createHash('sha256').update(serviceKey).digest().slice(0, 32);
    }
    
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encryptedPassword = cipher.update(password, 'utf8', 'hex');
    encryptedPassword += cipher.final('hex');
    const encryptedPasswordWithIv = iv.toString('hex') + ':' + encryptedPassword;

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    const { error: insertError } = await supabaseAdmin
      .from('verification_codes')
      .insert({
        email,
        password_hash: encryptedPasswordWithIv, // Encrypted password
        code: verificationCode,
        expires_at: expiresAt.toISOString(),
      });

    if (insertError) {
      console.error('Error storing verification code:', insertError);
      // Check if table doesn't exist
      if (insertError.code === '42P01' || insertError.message?.includes('does not exist')) {
        return NextResponse.json(
          { error: 'Database table not found. Please run the verification_codes table migration.' },
          { status: 500 }
        );
      }
      return NextResponse.json(
        { error: `Failed to generate verification code: ${insertError.message}` },
        { status: 500 }
      );
    }

    // Send verification code via email
    try {
      await sendVerificationEmail({
        to: email,
        code: verificationCode,
      });
    } catch (error) {
      console.error('Error sending verification email:', error);
      // Continue even if email fails - code is stored in database
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error in send-verification-code:', error);
    return NextResponse.json(
      { error: `Internal server error: ${error?.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
}

