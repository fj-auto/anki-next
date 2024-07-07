// file: hooks/useAnkiState.ts
import { useReducer, useEffect, useCallback } from 'react';
import { AnkiState, AnkiAction, AnkiCard, Settings, DailyProgress } from '../types';
import { formatDate, parseDate, getCurrentDate } from '../utils/dateUtils';

const initialState: AnkiState = {
  decks: {
    General: {
      name: 'General',
      cards: [],
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
  dailyProgress: {
    newCardsLearned: 0,
    reviewsDone: 0,
    date: getCurrentDate(),
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
    case 'UPDATE_DAILY_PROGRESS':
      return {
        ...state,
        dailyProgress: {
          ...state.dailyProgress,
          ...action.payload,
        },
      };
    case 'RESET_DAILY_PROGRESS':
      return {
        ...state,
        dailyProgress: {
          newCardsLearned: 0,
          reviewsDone: 0,
          date: getCurrentDate(),
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

  const checkDailyCompletion = useCallback(() => {
    const isNewCardsCompleted =
      state.dailyProgress.newCardsLearned >= state.settings.newCardsPerDay;
    const isReviewsCompleted = state.dailyProgress.reviewsDone >= state.settings.reviewsPerDay;
    return isNewCardsCompleted && isReviewsCompleted;
  }, [state.dailyProgress, state.settings]);

  useEffect(() => {
    const loadState = async () => {
      try {
        const response = await fetch('/api/loadState');
        if (response.ok) {
          const savedState = await response.json();
          if (savedState) {
            Object.keys(savedState.decks).forEach(deckName => {
              savedState.decks[deckName].cards.forEach((card: AnkiCard) => {
                card.nextReview = parseDate(card.nextReview as string);
                card.lastReview = card.lastReview ? parseDate(card.lastReview as string) : null;
              });
            });
            if (savedState.stats.lastReviewDate) {
              savedState.stats.lastReviewDate = parseDate(
                savedState.stats.lastReviewDate as string,
              );
            }
            dispatch({ type: 'LOAD_STATE', payload: savedState });
          }
        } else {
          console.error('Failed to load state:', response.statusText);
        }
      } catch (error) {
        console.error('Error loading state:', error);
      }
    };
    loadState();
  }, []);

  useEffect(() => {
    const saveState = async () => {
      try {
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
      } catch (error) {
        console.error('Error saving state:', error);
      }
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
      nextReview: parseDate(getCurrentDate()),
      lastReview: null,
    };
    dispatch({ type: 'ADD_CARD', payload: { deckName, card: newCard } });
  };

  const addDeck = (name: string) => {
    dispatch({ type: 'ADD_DECK', payload: { name } });
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
      lastReview: parseDate(getCurrentDate()),
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
        lastReviewDate: parseDate(getCurrentDate()),
        streakDays: calculateStreak(state.stats.lastReviewDate, state.stats.streakDays),
      },
    });

    // Update daily progress
    const isNewCard = card.reviews === 0;
    const newProgress = {
      newCardsLearned: isNewCard
        ? state.dailyProgress.newCardsLearned + 1
        : state.dailyProgress.newCardsLearned,
      reviewsDone: state.dailyProgress.reviewsDone + 1,
    };

    dispatch({
      type: 'UPDATE_DAILY_PROGRESS',
      payload: newProgress,
    });

    // Check if daily learning is completed after this update
    if (checkDailyCompletion()) {
      console.log('Daily learning completed!');
      // You could dispatch an action here to update the UI or show a notification
    }
  };

  const updateSettings = (newSettings: Partial<Settings>) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: newSettings });
  };

  const calculateStreak = (lastReviewDate: Date | null, currentStreak: number): number => {
    if (!lastReviewDate) return 1;
    const today = getCurrentDate();
    const lastReview = formatDate(lastReviewDate);
    const diffDays =
      (new Date(today).getTime() - new Date(lastReview).getTime()) / (1000 * 60 * 60 * 24);
    if (diffDays === 0) return currentStreak;
    if (diffDays === 1) return currentStreak + 1;
    return 1;
  };

  return {
    state,
    dispatch,
    addCard,
    addDeck,
    updateCard,
    updateSettings,
    checkDailyCompletion,
  };
}
