import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Save work session to database
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { startedAt, endedAt, durationMinutes } = body;

    if (!startedAt || !endedAt || durationMinutes === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Calculate date from startedAt
    const date = new Date(startedAt).toISOString().split('T')[0];

    // Insert work session
    const { error: insertError } = await supabase
      .from('work_sessions')
      .insert({
        user_id: user.id,
        date,
        duration_minutes: Math.round(durationMinutes),
        started_at: new Date(startedAt).toISOString(),
        ended_at: new Date(endedAt).toISOString(),
      });

    if (insertError) {
      console.error('Failed to insert work session:', insertError);
      return NextResponse.json(
        { error: 'Failed to save work session' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Save work session error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save work session' },
      { status: 500 }
    );
  }
}

