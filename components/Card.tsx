// file: components/Card.tsx
import React from 'react';
import { AnkiCard } from '../types';

interface CardProps {
  card: AnkiCard;
  isFlipped: boolean;
  onFlip: () => void;
  onAnswer: (difficulty: string) => void;
}

const Card: React.FC<CardProps> = ({ card, isFlipped, onFlip, onAnswer }) => {
  return (
    <div className="w-full max-w-md mx-auto">
      <div
        className="w-[190px] h-[254px] perspective-1000 cursor-pointer mx-auto mb-4"
        onClick={onFlip}
      >
        <div
          className={`relative w-full h-full transition-transform duration-300 transform-style-preserve-3d shadow-lg rounded-md ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* Front side (English) */}
          <div className="absolute w-full h-full backface-hidden bg-gray-800 text-white rounded-md overflow-hidden">
            <div className="absolute w-full h-full p-4 flex flex-col justify-between">
              <span className="bg-black bg-opacity-30 px-2 py-1 rounded-full text-xs backdrop-filter backdrop-blur-sm w-fit">
                English
              </span>
              <div className="flex flex-col items-center justify-center flex-grow">
                <p className="text-2xl font-bold">{card.back}</p>
              </div>
              <div className="text-gray-400 text-xs">Tap to flip</div>
            </div>
          </div>

          {/* Back side (Chinese) */}
          <div className="absolute w-full h-full backface-hidden bg-gray-800 text-white rounded-md overflow-hidden rotate-y-180">
            <div className="absolute w-full h-full">
              <div className="absolute w-full h-[160%] animate-rotation bg-gradient-to-r from-transparent via-orange-400 to-transparent"></div>
              <div className="absolute w-[99%] h-[99%] m-[0.5%] bg-gray-800 rounded-md flex flex-col justify-center items-center">
                <p className="text-2xl font-bold">{card.front}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Answer buttons outside the card */}
      <div className="flex justify-center space-x-2 mt-4">
        {['again', 'hard', 'good', 'easy'].map(difficulty => (
          <button
            key={difficulty}
            onClick={() => onAnswer(difficulty)}
            className={`px-3 py-1 text-white rounded hover:bg-opacity-80 ${
              difficulty === 'again'
                ? 'bg-red-500'
                : difficulty === 'hard'
                ? 'bg-yellow-500'
                : difficulty === 'good'
                ? 'bg-green-500'
                : 'bg-blue-500'
            }`}
          >
            {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Card;
