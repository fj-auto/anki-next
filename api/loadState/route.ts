// app/api/loadState/route.ts
import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'data', 'ankiState.json');
    const data = await readFile(filePath, 'utf8');
    const parsedData = JSON.parse(data);

    // 确保日期格式一致
    if (parsedData.stats && parsedData.stats.lastReviewDate) {
      parsedData.stats.lastReviewDate = formatDate(new Date(parsedData.stats.lastReviewDate));
    }

    Object.values(parsedData.decks).forEach((deck: any) => {
      deck.cards.forEach((card: any) => {
        if (card.nextReview) {
          card.nextReview = formatDate(new Date(card.nextReview));
        }
        if (card.lastReview) {
          card.lastReview = formatDate(new Date(card.lastReview));
        }
      });
    });

    return NextResponse.json(parsedData);
  } catch (error) {
    console.error('Error loading state:', error);
    return NextResponse.json({ error: 'Failed to load state' }, { status: 500 });
  }
}
