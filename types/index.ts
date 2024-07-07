// file: types/index.ts

export interface AnkiCard {
  id: number;
  front: string;
  back: string;
  interval: number;
  ease: number;
  reviews: number;
  nextReview: Date;
  lastReview: Date | null;
}

export interface Deck {
  name: string;
  cards: AnkiCard[];
}

export interface Settings {
  newCardsPerDay: number;
  reviewsPerDay: number;
  easeBonus: number;
  intervalModifier: number;
  maxInterval: number;
}

export interface Stats {
  totalReviews: number;
  correctReviews: number;
  averageEase: number;
  streakDays: number;
  lastReviewDate: Date | null;
}

export interface DailyProgress {
  newCardsLearned: number;
  reviewsDone: number;
  date: string;
}

export interface AnkiState {
  decks: { [key: string]: Deck };
  settings: Settings;
  stats: Stats;
  dailyProgress: DailyProgress;
}

export type AnkiAction =
  | {
      type: 'UPDATE_CARD';
      payload: { deckName: string; cardId: number; updates: Partial<AnkiCard> };
    }
  | { type: 'ADD_CARD'; payload: { deckName: string; card: AnkiCard } }
  | { type: 'ADD_DECK'; payload: { name: string } }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<Settings> }
  | { type: 'UPDATE_STATS'; payload: Partial<Stats> }
  | { type: 'UPDATE_DAILY_PROGRESS'; payload: Partial<DailyProgress> }
  | { type: 'RESET_DAILY_PROGRESS' }
  | { type: 'LOAD_STATE'; payload: AnkiState };

export interface ChartData {
  date?: string;
  reviews?: number;
  ease?: number;
  count?: number;
}
