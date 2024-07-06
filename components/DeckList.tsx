// file: components/DeckList.tsx
import React from 'react';
import { Deck } from '../types';

interface DeckListProps {
  decks: { [key: string]: Deck };
  onSelectDeck: (deckName: string) => void;
  onAddDeck: (deckName: string) => void;
}

const DeckList: React.FC<DeckListProps> = ({ decks, onSelectDeck, onAddDeck }) => {
  return (
    <div className="mb-4">
      <h2 className="text-xl font-bold mb-2">Decks</h2>
      <ul>
        {Object.values(decks).map(deck => (
          <li key={deck.name} className="mb-2">
            <button
              onClick={() => onSelectDeck(deck.name)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mr-2"
            >
              {deck.name} ({deck.cards.length} cards)
            </button>
          </li>
        ))}
      </ul>
      <form
        onSubmit={e => {
          e.preventDefault();
          const input = e.currentTarget.deckName as HTMLInputElement;
          onAddDeck(input.value);
          input.value = '';
        }}
        className="mt-4"
      >
        <input name="deckName" placeholder="New Deck Name" className="p-2 border rounded mr-2" />
        <button
          type="submit"
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Add Deck
        </button>
      </form>
    </div>
  );
};

export default DeckList;
