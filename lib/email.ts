/**
 * Send verification code email using Resend
 */

interface SendVerificationEmailParams {
  to: string;
  code: string;
}

export async function sendVerificationEmail({ to, code }: SendVerificationEmailParams): Promise<void> {
  // In development, just log the code (no email sent)
  if (process.env.NODE_ENV === 'development') {
    console.log('='.repeat(50));
    console.log('VERIFICATION CODE EMAIL (Development Mode)');
    console.log('='.repeat(50));
    console.log(`To: ${to}`);
    console.log(`Code: ${code}`);
    console.log('='.repeat(50));
    return;
  }

  // In production, use Resend to send email
  const resendApiKey = process.env.RESEND_API_KEY;
  
  if (!resendApiKey) {
    console.warn('RESEND_API_KEY not set. Email not sent. Code:', code);
    return;
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL || 'FocusDock <noreply@hanablabs.info>',
        to: [to],
        subject: 'FocusDock Verification Code',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 28px;">FocusDock</h1>
              </div>
              <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
                <h2 style="color: #1f2937; margin-top: 0;">Verification Code</h2>
                <p style="color: #4b5563;">Your verification code is:</p>
                <div style="background: white; border: 2px dashed #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
                  <div style="font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 8px;">${code}</div>
                </div>
                <p style="color: #6b7280; font-size: 14px;">This code will expire in 10 minutes.</p>
                <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">If you didn't request this code, you can safely ignore this email.</p>
              </div>
            </body>
          </html>
        `,
        text: `Your FocusDock verification code is: ${code}\n\nThis code will expire in 10 minutes.\n\nIf you didn't request this code, you can safely ignore this email.`,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Failed to send email via Resend:', errorData);
      throw new Error(`Resend API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Email sent successfully via Resend:', data.id);
  } catch (error) {
    console.error('Error sending email:', error);
    // Don't throw - log the code so it can be retrieved manually if needed
    console.log('Verification code (fallback):', code);
  }
}

