import { NextRequest, NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

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
    // Use ENCRYPTION_KEY if set, otherwise use a portion of SUPABASE_SERVICE_ROLE_KEY as fallback
    const encryptionKey = process.env.ENCRYPTION_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY?.slice(0, 64) || crypto.randomBytes(32).toString('hex');
    const key = Buffer.from(encryptionKey.slice(0, 64), 'hex').slice(0, 32); // Ensure 32 bytes for AES-256
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
      return NextResponse.json(
        { error: 'Failed to generate verification code' },
        { status: 500 }
      );
    }

    // Send verification code via email
    // TODO: Implement email sending service (e.g., Resend, SendGrid, etc.)
    // For now, we'll log the code in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Verification code for', email, ':', verificationCode);
    }

    // In production, send email here
    // await sendVerificationEmail(email, verificationCode);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in send-verification-code:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

