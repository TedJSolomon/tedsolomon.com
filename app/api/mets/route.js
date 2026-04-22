import { NextResponse } from 'next/server';
import { fetchMets } from '../../lib/mets';

export const revalidate = 1800; // 30 min

export async function GET() {
  const data = await fetchMets();
  if (data.error) {
    return NextResponse.json({ error: data.error }, { status: 500 });
  }
  return NextResponse.json(data);
}
