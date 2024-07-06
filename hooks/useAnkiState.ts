// file: hooks/useAnkiState.ts
import { useReducer, useEffect } from 'react';
import { AnkiState, AnkiAction, Deck, AnkiCard, Settings, Stats } from '../types';

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]; // 返回 "YYYY-MM-DD" 格式
}

function parseDate(dateString: string): Date {
  return new Date(dateString + 'T00:00:00Z');
}
const initialState: AnkiState = {
  decks: {
    General: {
      name: 'General',
      cards: [
        {
          id: 1,
          front: '苹果',
          back: 'Apple',
          interval: 1,
          ease: 2.5,
          reviews: 0,
          nextReview: parseDate(formatDate(new Date())),
          lastReview: null,
        },
        {
          id: 2,
          front: '香蕉',
          back: 'Banana',
          interval: 1,
          ease: 2.5,
          reviews: 0,
          nextReview: parseDate(formatDate(new Date())),
          lastReview: null,
        },
        {
          id: 3,
          front: '橙子',
          back: 'Orange',
          interval: 1,
          ease: 2.5,
          reviews: 0,
          nextReview: parseDate(formatDate(new Date())),
          lastReview: null,
        },
      ],
    },
  },
  settings: {
    newCardsPerDay: 20,
    reviewsPerDay: 200,
    easeBonus: 1.3,
    intervalModifier: 1,
    maxInterval: 36500,
  },
  stats: {
    totalReviews: 0,
    correctReviews: 0,
    averageEase: 2.5,
    streakDays: 0,
    lastReviewDate: null,
  },
};

function ankiReducer(state: AnkiState, action: AnkiAction): AnkiState {
  switch (action.type) {
    case 'UPDATE_CARD':
      return {
        ...state,
        decks: {
          ...state.decks,
          [action.payload.deckName]: {
            ...state.decks[action.payload.deckName],
            cards: state.decks[action.payload.deckName].cards.map(card =>
              card.id === action.payload.cardId ? { ...card, ...action.payload.updates } : card,
            ),
          },
        },
      };
    case 'ADD_CARD':
      return {
        ...state,
        decks: {
          ...state.decks,
          [action.payload.deckName]: {
            ...state.decks[action.payload.deckName],
            cards: [...state.decks[action.payload.deckName].cards, action.payload.card],
          },
        },
      };
    case 'ADD_DECK':
      return {
        ...state,
        decks: {
          ...state.decks,
          [action.payload.name]: {
            name: action.payload.name,
            cards: [],
          },
        },
      };
    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: {
          ...state.settings,
          ...action.payload,
        },
      };
    case 'UPDATE_STATS':
      return {
        ...state,
        stats: {
          ...state.stats,
          ...action.payload,
        },
      };
    case 'LOAD_STATE':
      return action.payload;
    default:
      return state;
  }
}

export function useAnkiState() {
  const [state, dispatch] = useReducer(ankiReducer, initialState);

  useEffect(() => {
    const loadState = async () => {
      const response = await fetch('/api/loadState');
      if (response.ok) {
        const savedState = await response.json();
        if (savedState) {
          Object.keys(savedState.decks).forEach(deckName => {
            savedState.decks[deckName].cards.forEach((card: AnkiCard) => {
              card.nextReview = parseDate(formatDate(new Date(card.nextReview)));
              card.lastReview = card.lastReview
                ? parseDate(formatDate(new Date(card.lastReview)))
                : null;
            });
          });
          if (savedState.stats.lastReviewDate) {
            savedState.stats.lastReviewDate = parseDate(
              formatDate(new Date(savedState.stats.lastReviewDate)),
            );
          }
          dispatch({ type: 'LOAD_STATE', payload: savedState });
        }
      }
    };
    loadState();
  }, []);

  useEffect(() => {
    const saveState = async () => {
      const stateToSave = {
        ...state,
        decks: Object.fromEntries(
          Object.entries(state.decks).map(([deckName, deck]) => [
            deckName,
            {
              ...deck,
              cards: deck.cards.map(card => ({
                ...card,
                nextReview: formatDate(card.nextReview),
                lastReview: card.lastReview ? formatDate(card.lastReview) : null,
              })),
            },
          ]),
        ),
        stats: {
          ...state.stats,
          lastReviewDate: state.stats.lastReviewDate
            ? formatDate(state.stats.lastReviewDate)
            : null,
        },
      };

      await fetch('/api/saveState', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(stateToSave),
      });
    };
    saveState();
  }, [state]);

  const addCard = (deckName: string, front: string, back: string) => {
    const newCard: AnkiCard = {
      id: Date.now(),
      front,
      back,
      interval: 1,
      ease: 2.5,
      reviews: 0,
      nextReview: parseDate(formatDate(new Date())),
      lastReview: null,
    };
    dispatch({ type: 'ADD_CARD', payload: { deckName, card: newCard } });
  };

  const addDeck = (name: string) => {
    if (name && !state.decks[name]) {
      dispatch({ type: 'ADD_DECK', payload: { name } });
    }
  };

  const updateCard = (deckName: string, cardIndex: number, difficulty: string) => {
    const { easeBonus, intervalModifier, maxInterval } = state.settings;
    const card = state.decks[deckName].cards[cardIndex];
    let { interval, ease, reviews } = card;

    switch (difficulty) {
      case 'again':
        interval = 1;
        ease = Math.max(1.3, ease - 0.2);
        break;
      case 'hard':
        interval *= 1.2 * intervalModifier;
        ease = Math.max(1.3, ease - 0.15);
        break;
      case 'good':
        interval *= ease * intervalModifier;
        break;
      case 'easy':
        interval *= ease * easeBonus * intervalModifier;
        ease += 0.15;
        break;
    }

    interval = Math.min(interval, maxInterval);
    reviews += 1;

    const updates = {
      interval,
      ease,
      reviews,
      nextReview: parseDate(formatDate(new Date(Date.now() + interval * 24 * 60 * 60 * 1000))),
      lastReview: parseDate(formatDate(new Date())),
    };

    dispatch({ type: 'UPDATE_CARD', payload: { deckName, cardId: card.id, updates } });
    dispatch({
      type: 'UPDATE_STATS',
      payload: {
        totalReviews: state.stats.totalReviews + 1,
        correctReviews:
          difficulty !== 'again' ? state.stats.correctReviews + 1 : state.stats.correctReviews,
        averageEase:
          (state.stats.averageEase * state.stats.totalReviews + ease) /
          (state.stats.totalReviews + 1),
        lastReviewDate: parseDate(formatDate(new Date())),
        streakDays: calculateStreak(state.stats.lastReviewDate, state.stats.streakDays),
      },
    });
  };

  const updateSettings = (newSettings: Settings) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: newSettings });
  };

  const calculateStreak = (lastReviewDate: Date | null, currentStreak: number): number => {
    if (!lastReviewDate) return 1;
    const today = formatDate(new Date());
    const lastReview = formatDate(lastReviewDate);
    const diffDays =
      (new Date(today).getTime() - new Date(lastReview).getTime()) / (1000 * 60 * 60 * 24);
    if (diffDays === 0) return currentStreak;
    if (diffDays === 1) return currentStreak + 1;
    return 1;
  };

  return { state, dispatch, addCard, addDeck, updateCard, updateSettings };
}
