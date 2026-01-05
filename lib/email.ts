/**
 * Send verification code email using Resend
 */

interface SendVerificationEmailParams {
  to: string;
  code: string;
}

export async function sendVerificationEmail({ to, code }: SendVerificationEmailParams): Promise<void> {
  const resendApiKey = process.env.RESEND_API_KEY;
  
  // In development, log the code even if RESEND_API_KEY is set
  if (process.env.NODE_ENV === 'development') {
    console.log('='.repeat(50));
    console.log('VERIFICATION CODE EMAIL (Development Mode)');
    console.log('='.repeat(50));
    console.log(`To: ${to}`);
    console.log(`Code: ${code}`);
    if (!resendApiKey) {
      console.log('RESEND_API_KEY not set - email will not be sent');
    }
    console.log('='.repeat(50));
    
    // In development, don't send email even if API key is set (to avoid sending test emails)
    if (!process.env.ALLOW_EMAIL_IN_DEV) {
      return;
    }
  }
  
  if (!resendApiKey) {
    console.warn('RESEND_API_KEY not set. Email not sent. Code:', code);
    throw new Error('RESEND_API_KEY environment variable is not set');
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
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
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText };
      }
      
      console.error('Failed to send email via Resend:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
      });
      
      throw new Error(`Resend API error (${response.status}): ${errorData.message || errorText}`);
    }

    const data = await response.json();
    console.log('Email sent successfully via Resend:', {
      emailId: data.id,
      to: to,
    });
  } catch (error: any) {
    console.error('Error sending verification email:', {
      error: error.message,
      stack: error.stack,
      to: to,
    });
    // Re-throw the error so the calling code can handle it
    throw error;
  }
}

