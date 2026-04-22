import { NextResponse } from 'next/server';
import { fetchWeather } from '../../lib/weather';

export const revalidate = 600; // 10 min

export async function GET() {
  const data = await fetchWeather();
  if (data.error) {
    return NextResponse.json({ error: data.error }, { status: 500 });
  }
  return NextResponse.json(data);
}
