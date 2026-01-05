import { NextRequest, NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email and code are required' },
        { status: 400 }
      );
    }

    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Find verification code
    const { data: verificationData, error: findError } = await supabaseAdmin
      .from('verification_codes')
      .select('*')
      .eq('email', email)
      .eq('code', code)
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (findError || !verificationData) {
      return NextResponse.json(
        { error: 'Invalid or expired verification code' },
        { status: 400 }
      );
    }

    // Decrypt password
    const crypto = require('crypto');
    const algorithm = 'aes-256-cbc';
    
    // Generate decryption key - must match the encryption key generation
    let key: Buffer;
    if (process.env.ENCRYPTION_KEY) {
      try {
        key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex').slice(0, 32);
      } catch {
        key = crypto.createHash('sha256').update(process.env.ENCRYPTION_KEY).digest().slice(0, 32);
      }
    } else {
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
      key = crypto.createHash('sha256').update(serviceKey).digest().slice(0, 32);
    }
    
    const [ivHex, encryptedPassword] = verificationData.password_hash.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decryptedPassword = decipher.update(encryptedPassword, 'hex', 'utf8');
    decryptedPassword += decipher.final('utf8');

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: decryptedPassword,
      email_confirm: true, // Auto-confirm email since we verified via code
    });

    if (authError || !authData.user) {
      console.error('Error creating user:', authError);
      return NextResponse.json(
        { error: 'Failed to create user account' },
        { status: 500 }
      );
    }

    // Create user profile
    const { error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .insert({
        id: authData.user.id,
        email: email,
        subscription_tier: 'free',
      });

    if (profileError) {
      console.error('Error creating user profile:', profileError);
      // Rollback: delete the auth user if profile creation fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json(
        { error: 'Failed to create user profile' },
        { status: 500 }
      );
    }

    // Mark verification code as used
    await supabaseAdmin
      .from('verification_codes')
      .update({ used: true })
      .eq('id', verificationData.id);

    return NextResponse.json({ success: true, userId: authData.user.id });
  } catch (error) {
    console.error('Error in verify-code:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

