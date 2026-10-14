import { NextResponse } from 'next/server';

export async function GET() {
  // Streams .sqlite or .json export download
  return NextResponse.json({ message: 'Backup endpoint' });
}
