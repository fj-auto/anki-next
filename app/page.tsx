// file: app/page.tsx
'use client';

import { useState, useCallback, useEffect } from 'react';
import DeckList from '../components/DeckList';
import Card from '../components/Card';
import AddCardForm from '../components/AddCardForm';
import Stats from '../components/Stats';
import Settings from '../components/Settings';
import Charts from '../components/Charts';
import { useAnkiState } from '../hooks/useAnkiState';
import { Deck, AnkiCard, ChartData } from '../types';
import { formatDate, getCurrentDate } from '../utils/dateUtils';

export default function Home() {
  const { state, addCard, addDeck, updateCard, updateSettings, checkDailyCompletion } =
    useAnkiState();
  const [currentDeck, setCurrentDeck] = useState<string>('General');
  const [currentCardIndex, setCurrentCardIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [view, setView] = useState<'study' | 'stats' | 'settings'>('study');
  const [isDailyCompleted, setIsDailyCompleted] = useState<boolean>(false);

  const currentCard = state.decks[currentDeck]?.cards[currentCardIndex];

  useEffect(() => {
    setIsDailyCompleted(checkDailyCompletion());
  }, [state.dailyProgress, checkDailyCompletion]);

  const handleUpdateCard = (difficulty: string) => {
    updateCard(currentDeck, currentCardIndex, difficulty);
    setIsFlipped(false);
    setCurrentCardIndex(prevIndex => (prevIndex + 1) % state.decks[currentDeck].cards.length);
    setIsDailyCompleted(checkDailyCompletion());
  };

  const reviewData: ChartData[] = Object.values(state.decks)
    .flatMap(deck => deck.cards.map(card => ({ date: card.lastReview, reviews: card.reviews })))
    .filter((data): data is { date: Date; reviews: number } => data.date !== null)
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .reduce((acc: { [key: string]: number }, curr) => {
      const date = formatDate(curr.date);
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

  const easeData: ChartData[] = Object.values(state.decks)
    .flatMap(deck => deck.cards.map(card => Math.round(card.ease * 10) / 10))
    .reduce((acc: { [key: number]: number }, ease) => {
      acc[ease] = (acc[ease] || 0) + 1;
      return acc;
    }, {});

  const exportData = useCallback(async () => {
    const response = await fetch('/api/exportData');
    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = 'anki_app_data.json';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } else {
      console.error('Error exporting data');
    }
  }, []);

  const importData = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async e => {
        const content = e.target?.result;
        if (typeof content === 'string') {
          try {
            const importedState = JSON.parse(content);
            const response = await fetch('/api/importData', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(importedState),
            });
            if (response.ok) {
              // Reload the page to reflect the imported state
              window.location.reload();
            } else {
              console.error('Error importing data');
            }
          } catch (error) {
            console.error('Error parsing imported data:', error);
            alert('Error importing data. Please make sure the file is a valid JSON.');
          }
        }
      };
      reader.readAsText(file);
    }
  }, []);

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">AnkiWeb App</h1>

      {/* Daily Progress */}
      <div className="mb-4 p-4 bg-blue-100 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Today's Progress</h2>
        <p>
          New Cards Learned: {state.dailyProgress.newCardsLearned} / {state.settings.newCardsPerDay}
        </p>
        <p>
          Reviews Done: {state.dailyProgress.reviewsDone} / {state.settings.reviewsPerDay}
        </p>
        <p className={`font-bold ${isDailyCompleted ? 'text-green-600' : 'text-yellow-600'}`}>
          {isDailyCompleted ? 'Daily learning completed!' : 'Keep going!'}
        </p>
      </div>

      <nav className="flex justify-between items-center mb-4">
        <div>
          <button
            onClick={() => setView('study')}
            className={`mr-2 ${view === 'study' ? 'font-bold' : ''}`}
          >
            Study
          </button>
          <button
            onClick={() => setView('stats')}
            className={`mr-2 ${view === 'stats' ? 'font-bold' : ''}`}
          >
            Stats
          </button>
          <button
            onClick={() => setView('settings')}
            className={`mr-2 ${view === 'settings' ? 'font-bold' : ''}`}
          >
            Settings
          </button>
        </div>
        <div>
          <button
            onClick={exportData}
            className="mr-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Export Data
          </button>
          <label className="cursor-pointer px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
            Import Data
            <input type="file" onChange={importData} className="hidden" />
          </label>
        </div>
      </nav>
      {view === 'study' && (
        <>
          <DeckList decks={state.decks} onSelectDeck={setCurrentDeck} onAddDeck={addDeck} />
          {currentCard && (
            <>
              <Card
                card={currentCard}
                isFlipped={isFlipped}
                onFlip={() => setIsFlipped(!isFlipped)}
                onAnswer={handleUpdateCard}
              />
              <div className="mb-4 text-sm text-gray-600">
                Next review: {formatDate(currentCard.nextReview)}
                <br />
                Current interval: {currentCard.interval.toFixed(1)} days
                <br />
                Ease: {currentCard.ease.toFixed(2)}
              </div>
            </>
          )}
          <AddCardForm onAddCard={(front, back) => addCard(currentDeck, front, back)} />
        </>
      )}
      {view === 'stats' && (
        <>
          <Stats stats={state.stats} />
          <Charts
            reviewData={Object.entries(reviewData).map(([date, reviews]) => ({ date, reviews }))}
            easeData={Object.entries(easeData).map(([ease, count]) => ({
              ease: parseFloat(ease),
              count,
            }))}
          />
        </>
      )}
      {view === 'settings' && (
        <Settings settings={state.settings} onUpdateSettings={updateSettings} />
      )}
    </main>
  );
}
