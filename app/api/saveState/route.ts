// file: app/api/saveState/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const filePath = path.join(process.cwd(), 'data', 'ankiState.json');
    await writeFile(filePath, JSON.stringify(data, null, 2));
    return NextResponse.json({ message: 'State saved successfully' });
  } catch (error) {
    console.error('Error saving state:', error);
    return NextResponse.json({ error: 'Failed to save state' }, { status: 500 });
  }
}
