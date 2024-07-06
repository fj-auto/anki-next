// file: app/api/loadState/route.ts
import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';
import { formatDate, parseDate } from '@/utils/dateUtils';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'data', 'ankiState.json');
    const data = await readFile(filePath, 'utf8');

    console.log('Raw data:', data); // Log raw data for debugging

    let parsedData;
    try {
      parsedData = JSON.parse(data);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return NextResponse.json({ error: 'Invalid JSON data' }, { status: 500 });
    }

    // Ensure date formats are consistent
    Object.values(parsedData.decks).forEach((deck: any) => {
      deck.cards.forEach((card: any) => {
        if (card.nextReview) {
          card.nextReview = formatDate(parseDate(card.nextReview));
        }
        if (card.lastReview) {
          card.lastReview = formatDate(parseDate(card.lastReview));
        }
      });
    });

    if (parsedData.stats && parsedData.stats.lastReviewDate) {
      parsedData.stats.lastReviewDate = formatDate(parseDate(parsedData.stats.lastReviewDate));
    }

    return NextResponse.json(parsedData);
  } catch (error) {
    console.error('Error loading state:', error);
    return NextResponse.json({ error: 'Failed to load state' }, { status: 500 });
  }
}
