// file: components/Card.tsx
import React from 'react';
import { AnkiCard } from '../types';
import { formatDate } from '../utils/dateUtils';

interface CardProps {
  card: AnkiCard;
  isFlipped: boolean;
  onFlip: () => void;
  onAnswer: (difficulty: string) => void;
}

const Card: React.FC<CardProps> = ({ card, isFlipped, onFlip, onAnswer }) => {
  return (
    <div
      className="w-96 h-56 bg-white rounded-xl shadow-md cursor-pointer mb-4 flex items-center justify-center p-4 perspective-1000"
      onClick={onFlip}
    >
      <div
        className={`w-full h-full transition-transform duration-500 ${
          isFlipped ? 'rotate-y-180' : ''
        } flex items-center justify-center`}
      >
        <div className="absolute w-full h-full flex items-center justify-center backface-hidden">
          <p className="text-2xl font-bold">{card.front}</p>
        </div>
        <div className="absolute w-full h-full flex flex-col items-center justify-center rotate-y-180 backface-hidden">
          <p className="text-2xl font-bold mb-4">{card.back}</p>
          <div className="flex space-x-2">
            <button
              onClick={e => {
                e.stopPropagation();
                onAnswer('again');
              }}
              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Again
            </button>
            <button
              onClick={e => {
                e.stopPropagation();
                onAnswer('hard');
              }}
              className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
            >
              Hard
            </button>
            <button
              onClick={e => {
                e.stopPropagation();
                onAnswer('good');
              }}
              className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Good
            </button>
            <button
              onClick={e => {
                e.stopPropagation();
                onAnswer('easy');
              }}
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Easy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Card;
