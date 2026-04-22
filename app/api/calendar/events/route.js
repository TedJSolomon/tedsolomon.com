import { NextResponse } from 'next/server';
import { fetchCalendarEvents } from '../../../lib/calendar';

export const dynamic = 'force-dynamic';

export async function GET() {
  const data = await fetchCalendarEvents();
  return NextResponse.json(data);
}
